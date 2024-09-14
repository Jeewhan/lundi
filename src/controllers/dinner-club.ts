import Slack from "../services/slack";

import { GATHER_DINNER_CLUB } from "../constants";

class DinnerClub {
  constructor(private readonly messenger: Slack) {}

  public async sendGatherMessage() {
    await this.messenger.postMessage(
      process.env.SLACK_DINNER_CHANNEL as string,
      "디너클럽🍜 참가신청을 받습니다!",
      gatherDinnerClubBlocks
    );
  }

  public async requestGather(body: BodyInit) {
    await fetch(process.env.APPS_SCRIPT_API_URL as string, {
      method: "POST",
      body,
    });
  }
}

export default DinnerClub;

const gatherDinnerClubBlocks = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `디너클럽🍜 참가신청을 받습니다!

이번 디너클럽은 장소/시간 선정의 어려움을 해결하기 위해 참여 날짜와 지역이 고정되어 있어요.

🗓️신청 기한: 다음 주 금요일(9/20) 자정까지

🍕최종 매칭: 일요일(9/22) 중

💬매칭 방식: 슬랙 그룹톡방 개설

✅ 참여 방법: 아래⬇️ 일정 중 참여 가능한 일정에 모두 체크해 주세요!

ex)
참여 일정 4개 체크 시: 1~4번의 매칭 가능
참여 일정 2개 체크 시: 1~2번의 매칭 가능
참여 일정 1개 체크 시: 1번의 매칭 가능
`,
    },
  },
  {
    type: "divider",
  },
  {
    type: "actions",
    elements: [
      {
        type: "checkboxes",
        action_id: GATHER_DINNER_CLUB,
        options: [
          {
            text: {
              type: "plain_text",
              text: "10월 4일(금) 19시",
            },
            value: "20241004 19:00",
          },
          {
            text: {
              type: "plain_text",
              text: "10월 5일(토) 18시",
            },
            value: "20241005 18:00",
          },
          {
            text: {
              type: "plain_text",
              text: "10월 25일(금) 19시",
            },
            value: "20241025 19:00",
          },
          {
            text: {
              type: "plain_text",
              text: "10월 26일(토) 18시",
            },
            value: "20241026 18:00",
          },
        ],
      },
    ],
  },
];
