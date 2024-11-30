import "dotenv/config";

import { App, DividerBlock, SectionBlock } from "@slack/bolt";
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

class Join {
  constructor(
    public readonly 아이디: string,
    public readonly 성함: string,
    public readonly 연락처: string,
    public readonly 자기소개: string,
    public readonly 런치클럽_관심사: string,
    public readonly 디너클럽_일시: string,
    public readonly 디너클럽_장소: string,
  ) {}
}

export class Matcher {
  private joins: Map<string, Join> = new Map();
  private matches: Match[] = [];

  constructor(
    private readonly slack: Slack,
    private readonly doc: GoogleSpreadsheet,
  ) {}

  async initialize() {
    await this.doc.loadInfo();

    const joinsSheet = this.doc.sheetsByTitle["Joins"];
    const rows = await joinsSheet.getRows();
    const joins = rows.map(
      (row) =>
        new Join(
          row.get("아이디"),
          row.get("성함"),
          row.get("연락처"),
          row.get("자기소개"),
          row.get("런치클럽_관심사"),
          row.get("디너클럽_일시"),
          row.get("디너클럽_장소"),
        ),
    );

    this.joins = new Map(joins.map((join) => [join.아이디, join]));

    const logsSheet = this.doc.sheetsByTitle["Logs"];
    const logs = await logsSheet.getRows();

    this.matches = logs.map(
      (log) =>
        new Match(
          log.get("type"),
          log.get("leader"),
          log.get("members"),
          this.joins,
        ),
    );

    console.log(this.matches.length);

    const records = await Promise.all(
      this.matches.map(async (match) => {
        const ids = ["U07UK9HGDQV", match.leader, ...match.members];

        const channel = await this.slack.direct(ids, match.message);

        return [
          match.type,
          match.leader,
          match.members.join(", "),
          channel,
          JSON.stringify(match.message),
        ];
      }),
    );

    // console.log(records.map((record) => JSON.stringify(record)));
    logsSheet.addRows(records);
  }
}

class Match {
  public readonly members: string[];

  constructor(
    public readonly type: "lunch" | "dinner",
    public readonly leader: string,
    members: string,
    private readonly joins: Map<string, Join>,
  ) {
    this.members = members.split(", ");
  }

  public get message(): { blocks: (DividerBlock | SectionBlock)[] } {
    switch (this.type) {
      case "lunch":
        return this.lunch();
      case "dinner":
        return this.dinner();
      default:
        throw new Error("존재하지 않는 타입입니다.");
    }
  }

  public lunch(): { blocks: (DividerBlock | SectionBlock)[] } {
    const leader = this.joins.get(this.leader) as Join;
    const members = this.members.map((member) =>
      this.joins.get(member),
    ) as Join[];
    const all = [leader, ...members];

    if (all.some((join) => !join?.아이디)) {
      throw new Error("존재하지 않는 아이디가 있습니다.");
    }

    if (all.some((join) => !join?.성함)) {
      throw new Error("성함이 존재하지 않는 경우가 있습니다.");
    }

    if (all.some((join) => !join?.연락처)) {
      throw new Error("연락처가 존재하지 않는 경우가 있습니다.");
    }

    if (all.some((join) => !join?.자기소개)) {
      throw new Error("자기소개가 존재하지 않는 경우가 있습니다.");
    }

    if (all.some((join) => !join?.런치클럽_관심사)) {
      throw new Error("런치클럽 관심사가 존재하지 않는 경우가 있습니다.");
    }

    const commonInterests = this.findCommonInterests(all);
    const commonInterestsText = commonInterests.join(", ");

    if (commonInterests.length === 0) {
      throw new Error("공통 관심사를 찾을 수 없습니다.");
    }

    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `안녕하세요, 런치클럽 매칭이 완료되었습니다!\n\n<@${
              this.joins.get(this.leader)?.아이디
            }>님께서 모임을 이끌어주세요 :)\n만약 이틀 내에 답이 없다면 다른 분이 먼저 이야기를 꺼내주세요.\n상대방과 일정&장소를 조율하고, 맛있는 식사와 함께 즐거운 시간 보내세요.\n\n서로의 공통 관심사는 ${commonInterestsText} 이에요. 만났을 때 공통 관심사를 기반으로 이야기 나눠봐요!\n\n*지역과 음식점을 고르는게 고민이라면, 아래 모임 추천 장소 DB를 참고해서 정해보세요 :)\n<https://naver.me/G9rpvEew|런치/디너 모임장소 DB>`,
          },
        } as SectionBlock,

        {
          type: "divider",
        } as DividerBlock,

        ...(all.map((join) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${join?.아이디}>님\n연락처: ${join?.연락처}\n관심사:${join?.런치클럽_관심사}\n<${join?.자기소개}|자기소개>`,
          },
        })) as SectionBlock[]),

        {
          type: "divider",
        } as DividerBlock,

        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":warning: *노쇼 방지를 위한 보증금 제도가 있습니다.* \n 일정이 확정된 후 참여하는 것은 서로에 대한 최소한의 배려에요.\n 일정 조율 후 일방적으로 약속을 취소하거나 노쇼 시, 불참 멤버 리포트를 부탁드려요.\n<https://forms.gle/r2cmWBZbLWyMqjqt5|*노쇼 멤버 리포트*>",
          },
        } as SectionBlock,

        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "약속한 일정이 어려워진 경우, 상대방에게 양해를 구하고 미리 다른 일정을 조율해 보아요:wink:",
          },
        } as SectionBlock,
      ],
    };
  }

  public dinner(): { blocks: (DividerBlock | SectionBlock)[] } {
    const leader = this.joins.get(this.leader) as Join;
    const members = this.members.map((member) =>
      this.joins.get(member),
    ) as Join[];
    const all = [leader, ...members];

    if (all.some((join) => !join)) {
      throw new Error("존재하지 않는 아이디가 있습니다.");
    }

    if (all.some((join) => !join?.성함)) {
      throw new Error("성함이 존재하지 않는 경우가 있습니다.");
    }

    if (all.some((join) => !join?.연락처)) {
      throw new Error("연락처가 존재하지 않는 경우가 있습니다.");
    }

    if (all.some((join) => !join?.디너클럽_일시)) {
      throw new Error("디너클럽 일시가 존재하지 않는 경우가 있습니다.");
    }

    if (all.some((join) => !join?.디너클럽_장소)) {
      throw new Error("디너클럽 장소가 존재하지 않는 경우가 있습니다.");
    }

    const commonPlaces = this.findCommonPlaces(all).join(", ");
    const commonTimes = this.findCommonTimes(all).join(", ");

    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `안녕하세요, 디너클럽 매칭이 완료되었습니다!\n\n<@${leader.아이디}>님께서 모임을 이끌어주세요 :)\n만약 이틀 내에 답이 없다면 다른 분이 먼저 이야기를 꺼내주세요.\n함께 일정&장소를 조율하고, 맛있는 식사와 함께 즐거운 시간 보내세요.\n\n디너클럽은 지역 / 일정이 정해져 있어요!\n공통 만남 가능 지역은 ${commonPlaces} 이며,\n공통 만남 가능 일정은 ${commonTimes} 이에요.\n\n위 공통된 지역들과 일정들 중 하나의 지역과 하나의 시간을 선택해 만나보세요.\n\n*지역과 음식점을 고르는게 고민이라면, 아래 모임 추천 장소 DB를 참고해서 정해보세요 :)\n<https://naver.me/G9rpvEew|런치/디너 모임장소 DB>`,
          },
        } as SectionBlock,

        {
          type: "divider",
        } as DividerBlock,

        ...(all.map((join) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${join?.아이디}>님\n연락처: ${join?.연락처}\n장소: ${join?.디너클럽_장소}\n일정: ${join?.디너클럽_일시}\n<${join?.자기소개}|자기소개>`,
          },
        })) as SectionBlock[]),

        {
          type: "divider",
        } as DividerBlock,

        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":warning: *노쇼 방지를 위한 보증금 제도가 있습니다.* \n 일정이 확정된 후 참여하는 것은 서로에 대한 최소한의 배려에요.\n 일정 조율 후 일방적으로 약속을 취소하거나 노쇼 시, 불참 멤버 리포트를 부탁드려요.\n<https://forms.gle/r2cmWBZbLWyMqjqt5|*노쇼 멤버 리포트*>",
          },
        } as SectionBlock,

        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "약속한 일정이 어려워진 경우, 상대방에게 양해를 구하고 미리 다른 일정을 조율해 보아요:wink:",
          },
        } as SectionBlock,
      ],
    };
  }

  private findCommonInterests(members: Join[]): string[] {
    const firstMemberInterests = new Set(
      this.joins
        .get(this.leader)
        ?.런치클럽_관심사.split(",")
        .map((i) => i.trim()),
    );

    const commonInterests = Array.from(firstMemberInterests).filter(
      (interest) =>
        members.every((member) =>
          member?.런치클럽_관심사
            .split(",")
            .map((i) => i.trim())
            .includes(interest),
        ),
    );

    return commonInterests;
  }

  private findCommonPlaces(members: Join[]): string[] {
    const firstMemberPlaces = new Set(
      this.joins
        .get(this.leader)
        ?.디너클럽_장소.split(",")
        .map((i) => i.trim()),
    );

    const commonPlaces = Array.from(firstMemberPlaces).filter((place) =>
      members.every((member) =>
        member?.디너클럽_장소
          .split(",")
          .map((i) => i.trim())
          .includes(place),
      ),
    );

    return commonPlaces;
  }

  private findCommonTimes(members: Join[]): string[] {
    const firstMemberTimes = new Set(
      this.joins
        .get(this.leader)
        ?.디너클럽_일시.split(",")
        .map((i) => i.trim()),
    );

    const commonTimes = Array.from(firstMemberTimes).filter((time) =>
      members.every((member) =>
        member?.디너클럽_일시
          .split(",")
          .map((i) => i.trim())
          .includes(time),
      ),
    );

    return commonTimes;
  }
}
