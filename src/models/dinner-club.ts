import {
  dinnerPreferredDateTimes,
  GATHER_DINNER_CLUB,
} from "../shared/constants";
import { Messenger } from "../services/messenger";
import { Sheets } from "../services/sheets";
import { shuffle } from "../utils/shuffle";
import ClubMember, { DinnerClubMember } from "./club-member";
import DinnerGroup from "./dinner-group";

type Group =
  | [DinnerClubMember, DinnerClubMember, DinnerClubMember]
  | [DinnerClubMember, DinnerClubMember, DinnerClubMember, DinnerClubMember];

class DinnerClub {
  constructor(
    private readonly messenger: Messenger,
    private readonly sheets: Sheets,
  ) {}

  public async sendGatherMessage() {
    await this.messenger.post(
      process.env.SLACK_DINNER_CHANNEL as string,
      "디너클럽🍜 참가신청을 받습니다!",
      this.messenger.createBlocks(gatherText, gatherActionOptions),
    );
  }

  public async fetch() {
    const members = await this.sheets.read("members");

    const dinnerClubMembers = members
      .map(
        (member: any) =>
          new ClubMember(
            member.name,
            member.id,
            member.group,
            member.phone,
            member.introduce,
            member.clubType,
            member.groupMembers,
            member.excludedMembers,
            member.logs,
            member.lunchClubKeywords,
            member.dinnerClubLocations,
            member.hasAppliedForLunch,
            member.dinnerPreferredDateTime,
          ),
      )
      .filter((member: any) => member.isEligibleForDinner())
      .map(
        (member: any) =>
          new DinnerClubMember(
            member.name,
            member.id,
            member.group,
            member.phone,
            member.introduce,
            member.clubType,
            member.groupMembers,
            member.excludedMembers,
            member.logs,
            member.lunchClubKeywords,
            member.dinnerClubLocations,
            member.hasAppliedForLunch,
            member.dinnerPreferredDateTime,
          ),
      );

    // return shuffle<DinnerClubMember>(dinnerClubMembers);
    return dinnerClubMembers;
  }

  public async log(group: DinnerGroup, channel?: string) {
    // for (const member of group.members) {
    //   await this.sheets.write("logs", [
    //     member.name,
    //     group.members
    //       .filter((m) => m.id !== member.id)
    //       .map((m) => m.name)
    //       .join(","),
    //     Array.from(group.locations).join(","),
    //     Array.from(group.datetimes).join(","),
    //     member.groupMembers,
    //     member.excludedMembers,
    //     member.logs,
    //     group.noticeText,
    //   ]);
    // }

    for (const member of group.members) {
      await this.sheets.write("logs", [
        member.id,
        group.members
          .filter((m) => m.id !== member.id)
          .map((m) => m.id)
          .join(","),
        ...(channel ? [channel] : []),
      ]);
    }
  }

  public async notice(groups: DinnerGroup[]) {
    for (const group of groups) {
      const channel = await this.messenger.direct(
        group.memberIDs.concat(process.env.LUNDI_MANAGER_SLACK_ID as string),
        group.noticeText,
      );

      await this.log(group, channel);
    }
  }

  public group(members: DinnerClubMember[]) {
    const groups: DinnerGroup[] = [];
    const joinedMembers = new Set<string>();

    const combinations = this.generateCombinations(members);

    const scoredCombinations = combinations
      .map((combination) => ({
        combination,
        score: this.calculateScore(combination),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => a.score - b.score)
      .sort((a, b) => b.combination.length - a.combination.length);

    for (const { combination } of scoredCombinations) {
      if (combination.every((member) => !joinedMembers.has(member.id))) {
        const group = new DinnerGroup(combination);

        if (group.locations.length && group.datetimes.length) {
          groups.push(new DinnerGroup(combination));
          combination.forEach((member) => joinedMembers.add(member.id));
        }
      }

      if (joinedMembers.size === members.length) {
        break;
      }
    }

    return groups;
  }

  public async match() {
    const members = await this.fetch();

    const groups = this.group(members);

    // for (const group of groups) {
    //   await this.log(group);
    // }

    await this.notice(groups);
  }

  private generateCombinations(members: DinnerClubMember[]) {
    const combinations: Group[] = [];

    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        for (let k = j + 1; k < members.length; k += 1) {
          for (let l = k + 1; l < members.length; l += 1) {
            combinations.push([members[i], members[j], members[k], members[l]]);
          }
        }
      }
    }

    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        for (let k = j + 1; k < members.length; k += 1) {
          combinations.push([members[i], members[j], members[k]]);
        }
      }
    }

    return combinations;
  }

  private calculateScore(group: Group) {
    let score = 0;
    const combinationCount = (group.length * (group.length - 1)) / 2;

    for (let i = 0; i < group.length; i += 1) {
      const member = group[i];

      for (const m of group.filter((m) => m.id !== member.id)) {
        const s = member.scoreDinnerMatch(m);

        if (s === 0) return 0;

        score += s;
      }
    }

    return score / combinationCount;
  }
}

export default DinnerClub;

const gatherText = `디너클럽🍜 참가신청을 받습니다!

이번 디너클럽은 장소/시간 선정의 어려움을 해결하기 위해 참여 날짜와 지역이 고정되어 있어요.

🗓️신청 기한: 다음 주 금요일(9/20) 자정까지

🍕최종 매칭: 일요일(9/22) 중

💬매칭 방식: 슬랙 그룹톡방 개설

참여 일정 4개 체크 시 : 1~4번의 매칭 가능
참여 일정 2개 체크 시: 1~2번의 매칭 가능
참여 일정 1개 체크 시 : 1번의 매칭 가능

🔔정상적으로 신청이 되면, <@${process.env.LUNDI_SLACK_ID}> 앱으로부터 완료되었다는 알림이 오게 됩니다.
알림을 못 받으셨을 경우, 다시 한 번 시도해 주세요.
만약 그래도 잘 되지 않을 경우 해당 신청 메세지 댓글(스레드)에 남겨주세요.
`;

const gatherActionOptions = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "참여희망일",
    },
    accessory: {
      type: "multi_static_select",
      placeholder: {
        type: "plain_text",
        text: "이 곳을 눌러 참여 가능한 일자를 모두 선택해주세요.",
        emoji: true,
      },
      options: [
        {
          text: {
            type: "plain_text",
            text: "10월 4일(금) 19시",
            emoji: true,
          },
          value: "20241004 19:00",
        },
        {
          text: {
            type: "plain_text",
            text: "10월 5일(토) 18시",
            emoji: true,
          },
          value: "20241005 18:00",
        },
        {
          text: {
            type: "plain_text",
            text: "10월 25일(금) 19시",
            emoji: true,
          },
          value: "20241025 19:00",
        },
        {
          text: {
            type: "plain_text",
            text: "10월 26일(토) 18시",
            emoji: true,
          },
          value: "20241026 18:00",
        },
      ],
      action_id: GATHER_DINNER_CLUB,
    },
  },
];
