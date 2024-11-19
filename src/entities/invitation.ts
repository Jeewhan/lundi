import { GoogleSpreadsheet } from "google-spreadsheet";

import { Messenger } from "../services/messenger";
import {
  DINNER_CLUB_JOIN_ACTION,
  LUNCH_CLUB_JOIN_ACTION,
  LUNCH_DINNER_CLUB_JOIN_ACTION,
} from "../shared/constants";

export class Invitation {
  constructor(
    private readonly messenger: Messenger,
    private readonly doc: GoogleSpreadsheet,
  ) {}

  public async sendLunchDinnerClubAnnouncement() {
    await this.messenger.post(
      process.env.LUNDI_TEST_CHANNEL as string,
      "런치클럽 & 디너클럽 모집해요 🎉",
      LUNCH_DINNER_CLUB_INVITE_BUTTON_LAYOUT,
    );
  }
}

const LUNCH_DINNER_CLUB_INVITE_BUTTON_LAYOUT = [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: "메모어 대표 네트워킹 클럽! 런치&디너클럽 모집해요 🎉",
      emoji: true,
    },
  },
  {
    type: "section",
    text: {
      type: "plain_text",
      text: "정기모임을 넘어 더 다양한 분들과 만나고 싶으실 경우,\n새로운 멤버들과 만나 같이 밥 먹으며 네트워킹해요!\n각양각색 메모어 멤버들과의 만남 속, 깊고 다채로운 이야기가 기다리고 있어요.",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*런치클럽*\n런치클럽은 `일대일`로 만나 식사하며 *관심사 기반으로 대화를 나눠요!*\n자세한 운영 내용은 <https://www.notion.so/e75efa945f7c41a0b7898bd934cc8c38|여기>를 참고해주세요!\n> 꼭 점심에 만나야될 필요는 없어요! 매칭된 상대방과 일정을 조율하여 만나는 방식입니다.",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*디너클럽*\n디너클럽은 `3~5인` 그룹으로 만나 맛있는 *저녁식사를 함께 즐겨요*!\n자세한 운영 내용은 <https://www.notion.so/97ddad22b2c141b79fdff96b8d9ba444|여기>를 참고해주세요!\n> 신청 할 때 일정과 지역을 모두 미리 결정 후 만나요. 같은 일정을 선택한 분들과 매칭돼요.",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "`런치/디너 하나만 참여할 수도, 둘 다 참여할 수도 있어요.`",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "`이번 17기는 각각 한 번의 매칭을 진행해요.`",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":spiral_calendar_pad: *신청 기한*: 다음 주 화요일(11/26)까지",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":pizza: *최종 매칭*: 다음 주 금요일(11/29) 중",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":speech_balloon: *매칭 방식*: 슬랙 그룹메시지 개설",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":white_check_mark: *참여 방법*: 아래 '참가신청'을 눌러 매칭에 필요한 내용을 작성해 주세요.",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "런치클럽 참가신청",
        },
        value: "join",
        action_id: LUNCH_CLUB_JOIN_ACTION,
        style: "primary",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "디너클럽 참가신청",
        },
        value: "join",
        action_id: DINNER_CLUB_JOIN_ACTION,
        style: "primary",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "런치클럽, 디너클럽 동시참가신청",
        },
        value: "join",
        action_id: LUNCH_DINNER_CLUB_JOIN_ACTION,
        style: "primary",
      },
    ],
  },
];
