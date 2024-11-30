import "dotenv/config";

import { App } from "@slack/bolt";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import Slack from "./services/messenger";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const slack = new Slack(app);

const serviceAccountAuth = new JWT({
  email: serviceAccountCredentials.client_email,
  key: serviceAccountCredentials.private_key,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
});
const doc = new GoogleSpreadsheet(
  process.env.MEMOIR_17_SHEET_ID as string,
  serviceAccountAuth,
);

class DinnerMember {
  public readonly excludesSet: Set<string>;
  public readonly datetimesSet: Set<string>;
  public readonly locationsSet: Set<string>;

  constructor(
    public readonly id: string,
    public readonly excludes: string,
    public readonly datetimes: string,
    public readonly locations: string,
  ) {
    this.excludesSet = new Set((excludes ?? "").split(", "));
    this.datetimesSet = new Set(datetimes.split(", "));
    this.locationsSet = new Set(locations.split(", "));
  }

  get score() {
    return (
      this.excludesSet.size * -1 +
      this.datetimesSet.size * 10 +
      this.locationsSet.size * 10
    );
  }

  public isExcluded(id: string) {
    return this.excludesSet.has(id);
  }

  public isDatetime(datetime: string) {
    return this.datetimesSet.has(datetime);
  }

  public isLocation(location: string) {
    return this.locationsSet.has(location);
  }

  public hasCommonDatetimes(other: DinnerMember): boolean {
    return Array.from(this.datetimesSet).some((datetime) =>
      other.isDatetime(datetime),
    );
  }

  public hasCommonLocations(other: DinnerMember): boolean {
    return Array.from(this.locationsSet).some((location) =>
      other.isLocation(location),
    );
  }
}

class Dinner {
  constructor(
    private readonly slack: Slack,
    private readonly doc: GoogleSpreadsheet,
  ) {}

  public async initialize() {
    await this.doc.loadInfo();

    const sheet = this.doc.sheetsByTitle["Dinner"];

    const rows = await sheet.getRows();

    const members = rows.map(
      (row) =>
        new DinnerMember(
          row.get("아이디"),
          row.get("Exclude"),
          row.get("디너클럽_일시"),
          row.get("디너클럽_장소"),
        ),
    );

    return members;
  }

  public group = (members: DinnerMember[]) => {
    const list = [...members];
    const sorted = list.sort((a, b) => a.score - b.score);

    const groups: DinnerMember[][] = [];
    const used = new Set<string>();

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      if (used.has(current.id)) continue;

      // 현재 그룹 시작
      const currentGroup: DinnerMember[] = [current];

      // 그룹에 추가 가능한 멤버 찾기 (최대 3명 더 추가 가능)
      for (let j = i + 1; j < sorted.length && currentGroup.length < 4; j++) {
        const candidate = sorted[j];
        if (used.has(candidate.id)) continue;

        // 현재 그룹의 모든 멤버와 호환되는지 확인
        const canJoinGroup = currentGroup.every((member) => {
          if (
            member.isExcluded(candidate.id) ||
            candidate.isExcluded(member.id)
          ) {
            return false;
          }

          return (
            member.hasCommonDatetimes(candidate) &&
            member.hasCommonLocations(candidate)
          );
        });

        // 그룹의 모든 멤버와 호환되면 그룹에 추가
        if (canJoinGroup) {
          // 새 멤버 추가 시 전체 그룹의 공통 시간과 장소 확인
          const allMembersHaveCommonSchedule = this.hasCommonScheduleForAll([
            ...currentGroup,
            candidate,
          ]);

          if (allMembersHaveCommonSchedule) {
            currentGroup.push(candidate);
          }
        }
      }

      // 현재 그룹의 모든 멤버를 used에 추가
      currentGroup.forEach((member) => used.add(member.id));
      groups.push(currentGroup);
    }

    console.log(groups);
    return groups;
  };

  // 그룹 전체의 공통 일정과 장소를 확인하는 헬퍼 메서드
  private hasCommonScheduleForAll(group: DinnerMember[]): boolean {
    if (group.length <= 1) return true;

    // 첫 번째 멤버의 시간과 장소를 기준으로 설정
    const commonDatetimes = new Set(Array.from(group[0].datetimesSet));
    const commonLocations = new Set(Array.from(group[0].locationsSet));

    // 나머지 멤버들과 교집합 구하기
    for (let i = 1; i < group.length; i++) {
      // 시간 교집합
      for (const datetime of commonDatetimes) {
        if (!group[i].datetimesSet.has(datetime)) {
          commonDatetimes.delete(datetime);
        }
      }

      // 장소 교집합
      for (const location of commonLocations) {
        if (!group[i].locationsSet.has(location)) {
          commonLocations.delete(location);
        }
      }

      // 공통 시간이나 장소가 하나도 없다면 false 반환
      if (commonDatetimes.size === 0 || commonLocations.size === 0) {
        return false;
      }
    }

    return true;
  }

  public write = async (groups: DinnerMember[][]) => {
    const sheet = this.doc.sheetsByTitle["Logs"];

    const rows = groups.map((group) => {
      const type = "dinner";
      const [l, ...m] = group;
      const leader = l.id;
      const members = m.map((member) => member.id).join(", ");

      return [type, leader, members];
    });

    await sheet.addRows(rows);
  };
}

const dinner = new Dinner(slack, doc);
dinner.initialize().then(dinner.group).then(dinner.write);
