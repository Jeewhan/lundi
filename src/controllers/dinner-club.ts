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

참여 일정 4개 체크 시 : 1~4번의 매칭 가능
참여 일정 2개 체크 시: 1~2번의 매칭 가능
참여 일정 1개 체크 시 : 1번의 매칭 가능

🔔정상적으로 신청이 되면, <@${process.env.LUNDI_USER_ID}> 앱으로부터 완료되었다는 알림이 오게 됩니다.
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
