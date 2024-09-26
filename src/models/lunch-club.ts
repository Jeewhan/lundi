import { GATHER_LUNCH_CLUB } from "../constants";
import { Messenger } from "../services/messenger";
import { Sheets } from "../services/sheets";
import { shuffle } from "../utils/shuffle";
import { LunchClubMember } from "./club-member";

class LunchClub {
  constructor(
    private readonly messenger: Messenger,
    private readonly sheets: Sheets
  ) {}

  public async sendGatherMessage() {
    await this.messenger.post(
      process.env.SLACK_LUNCH_CHANNEL as string,
      "런치클럽🍜 참가신청을 받습니다!",
      this.messenger.createBlocks(gatherText, gatherActionOptions)
    );
  }

  public score(left: LunchClubMember, right: LunchClubMember) {
    const leftScore = left.scoreLunchMatch(right);
    const rightScore = right.scoreLunchMatch(left);

    return leftScore === 0 || rightScore === 0
      ? 0
      : (leftScore + rightScore) / 2;
  }

  public pair(members: LunchClubMember[]) {
    // TODO: 이것을 pair가 아닌 fetch 시점에 처리해줄 것.
    const lunchClubMembers = shuffle(
      members.filter((member) => member.isEligibleForLunch())
    );
    const scores = new Map<number, [LunchClubMember, LunchClubMember][]>();
    const matched = new Set<string>();
    const result = [] as [LunchClubMember, LunchClubMember][];

    if (lunchClubMembers.length < 2) {
      return [];
    }

    for (let i = 0; i < lunchClubMembers.length; i += 1) {
      for (let j = i + 1; j < lunchClubMembers.length; j += 1) {
        const left = lunchClubMembers[i];
        const right = lunchClubMembers[j];

        const score = this.score(left, right);

        if (score) {
          scores.set(score, [...(scores.get(score) ?? []), [left, right]]);
        }
      }
    }

    const sortedScores = Array.from(scores.entries()).sort(
      ([aScore], [bScore]) => bScore - aScore
    );

    for (const [, pairs] of sortedScores) {
      for (const pair of pairs) {
        const [left, right] = pair;

        if (!matched.has(left.id) && !matched.has(right.id)) {
          matched.add(left.id);
          matched.add(right.id);
          result.push(pair);
        }
      }
    }

    return result;
  }

  public async notice(pairs: [LunchClubMember, LunchClubMember][]) {
    for (const [left, right] of pairs) {
      const channel = await this.messenger.direct(
        [left.id, right.id, process.env.LUNDI_MANAGER_SLACK_ID as string],
        getNoticeText(left, right)
      );

      await this.log([left, right], channel);
    }
  }

  public async log(pair: [LunchClubMember, LunchClubMember], channel?: string) {
    const [left, right] = pair;

    await this.sheets.write("logs", [
      left.id,
      right.id,
      ...(channel ? [channel] : []),
    ]);
  }

  public async fetch() {
    const members = await this.sheets.read("members");

    return members.map(
      (member: any) =>
        new LunchClubMember(
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
          member.dinnerPreferredDateTime
        )
    );
  }

  public async run() {
    const members = await this.fetch();

    const pairs = this.pair(members);

    await this.notice(pairs);
  }
}

export default LunchClub;

const gatherText = `런치클럽🍜 참가신청을 받습니다!

이번 기수에는 1,2차 매칭을 한 번에 진행해요.
매칭 참여를 최종적으로 원하실 경우 아래 버튼을 눌러주시면 자동으로 참석 완료!

🗓️신청 기한: 다음 주 금요일(9/20) 자정까지

🍕최종 매칭: 일요일(9/22) 중

💬매칭 방식: 슬랙 그룹톡방 개설

⚠️ 이번 기수에는 1,2차 매칭을 한 번에 진행해요.

✅ 참여 방법: 런치 매칭에 참여 원하실 경우 아래⬇️ '참가신청'을 눌러주세요.

🔔정상적으로 신청이 되면, <@${process.env.LUNDI_SLACK_ID}> 앱으로부터 완료되었다는 알림이 오게 됩니다.
알림을 못 받으셨을 경우, 다시 한 번 시도해 주세요.
만약 그래도 잘 되지 않을 경우 해당 신청 메세지 댓글(스레드)에 남겨주세요.
`;

const gatherActionOptions = [
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "참가신청",
          emoji: true,
        },
        value: "join",
        action_id: GATHER_LUNCH_CLUB,
      },
    ],
  },
];

const getNoticeText = (
  left: LunchClubMember,
  right: LunchClubMember
) => `안녕하세요, 런치클럽 매칭이 완료되었습니다!
<@${left.id}>님께서 모임을 이끌어주세요 :)
이틀 내에 답이 없다면 다른분이 먼저 이야기를 꺼내주세요.
상대방과 일정&장소를 조율하고, 맛있는 식사와 함께 즐거운 시간 보내세요.

서로의 공통 관심사는 ${left
  .getMatchingLunchClubKeywords(right.lunchClubKeywords)
  .join(", ")} 이에요. 만났을 때 공통 관심사를 기반으로 이야기 나눠봐요!

* 지역과 음식점을 고르기 고민이라면, 아래 모임 추천 장소 DB를 참고해서 정해보세요 :)

https://naver.me/G9rpvEew

<@${left.id}>님
• 연락처: ${left.phone}
• 관심사: ${left.lunchClubKeywords}
• <${left.introduce}|자기소개 링크>

<@${right.id}>님
• 연락처: ${right.phone}
• 관심사: ${right.lunchClubKeywords}
• <${right.introduce}|자기소개 링크>

일정 조율 후 불참 시 메모어 보증금 1만원이 차감됩니다.
상대방이 일정 조율 후 일방적으로 약속을 취소하거나 노쇼 시, 불참 멤버 리포트를 부탁드립니다🙏

약속한 일정이 어려워진 경우, 상대방에게 양해를 구하고 다른 일정을 조율해 보아요😉`;
