import { App } from "@slack/bolt";

import { GATHER_LUNCH_CLUB } from "../constants";
import { createBlocks } from "../utils/slack";

class LunchClub {
  constructor(private readonly messenger: App) {}

  public async sendGatherMessage() {
    await this.messenger.client.chat.postMessage({
      channel: process.env.SLACK_LUNCH_CHANNEL as string,
      text: "런치클럽🍜 참가신청을 받습니다!",
      blocks: createBlocks(gatherText, gatherActionOptions),
    });
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
