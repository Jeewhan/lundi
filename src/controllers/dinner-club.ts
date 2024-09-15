import { App } from "@slack/bolt";

import { GATHER_DINNER_CLUB } from "../constants";
import { createBlocks } from "../utils/slack";

class DinnerClub {
  constructor(private readonly messenger: App) {}

  public async sendGatherMessage() {
    await this.messenger.client.chat.postMessage({
      channel: process.env.SLACK_DINNER_CHANNEL as string,
      text: "디너클럽🍜 참가신청을 받습니다!",
      blocks: createBlocks(gatherText, gatherActionOptions),
    });
  }
}

export default DinnerClub;

const gatherText = `디너클럽🍜 참가신청을 받습니다!

이번 디너클럽은 장소/시간 선정의 어려움을 해결하기 위해 참여 날짜와 지역이 고정되어 있어요.

🗓️신청 기한: 다음 주 금요일(9/20) 자정까지

🍕최종 매칭: 일요일(9/22) 중

💬매칭 방식: 슬랙 그룹톡방 개설
`;
const gatherActionOptions = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "참여희망일을 선택해주세요.",
    },
    accessory: {
      type: "multi_static_select",
      placeholder: {
        type: "plain_text",
        text: "참여희망일",
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
