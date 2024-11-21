import {
  BlockAction,
  ButtonAction,
  KnownBlock,
  MrkdwnElement,
} from "@slack/bolt";
import { ViewsOpenArguments } from "@slack/web-api";

import users from "../assets/17.json";
import {
  NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
  READY_FOR_JOIN_CLUB_CALLBACK_ID,
} from "../shared/constants";

type User = (typeof users)[keyof typeof users];

export class Join {
  constructor(private readonly id: string) {}

  public joinLunchClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
  ): ViewsOpenArguments {
    return this.joinClub(body, payload, "런치클럽 참가 신청", [
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: "런치클럽을 선택해 주셨어요! 모임 배정을 위해 아래 내용을 선택해 주세요.",
        } as MrkdwnElement,
      },

      {
        type: "input",

        block_id: "lunch-club-topic",

        element: {
          type: "checkboxes",

          action_id: "lunch-club-topic",

          options: [
            {
              value: "IT/AI",

              text: {
                type: "mrkdwn",
                text: "IT/AI",
              },
            },

            {
              value: "창업/사이드프로젝트",

              text: {
                type: "mrkdwn",
                text: "창업/사이드프로젝트",
              },
            },

            {
              value: "커리어",

              text: {
                type: "mrkdwn",
                text: "커리어",
              },
            },

            {
              value: "취미/일상/콘텐츠",

              text: {
                type: "mrkdwn",
                text: "취미/일상/콘텐츠",
              },
            },

            {
              value: "해외/여행",

              text: {
                type: "mrkdwn",
                text: "해외/여행",
              },
            },
          ],
        },

        label: {
          type: "plain_text",
          text: "런치클럽에서 만나 나누고 싶은 대화 주제(관심사)를 골라주세요!\n복수 선택이 가능해요. 많이 고를수록 더 다양한 만남이 가능해요.",
          emoji: true,
        },
      },
    ]);
  }

  public joinDinnerClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
  ): ViewsOpenArguments {
    return this.joinClub(body, payload, "디너클럽 참가 신청", []);
  }

  public joinLunchDinnerClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
  ): ViewsOpenArguments {
    return this.joinClub(body, payload, "런치클럽 & 디너클럽 동시참가신청", []);
  }

  private joinClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
    title: string,
    blocks: KnownBlock[],
  ): ViewsOpenArguments {
    const user = users[body.user.id as keyof typeof users];

    // if (!user.introduce) {
    //   return this.getNotReadyForJoinClubView(body, payload, title, user);
    // }

    return {
      trigger_id: body.trigger_id,

      view: {
        type: "modal",

        callback_id: READY_FOR_JOIN_CLUB_CALLBACK_ID,
        notify_on_close: true, // TODO: 취소한 경우에 누가 얼마나 작성하고 취소했는지 기록해둘 것.

        title: {
          type: "plain_text",
          text: title,
        },

        close: {
          type: "plain_text",
          text: "닫기",
        },

        submit: {
          type: "plain_text",
          text: "제출",
        },

        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${user.name}님* 참가신청을 진행합니다.`,
            },
          },

          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "만약 위에 적힌 성함이 실명 전체 또는 '홍길동A' 등이 아닌, 영문 또는 별명 그리고 성함의 일부(성 없이 이름) 등으로 나와있으실 경우, 원활한 운영을 위해 슬랙에서 *본명으로 꼭 변경해주신 뒤에 신청해주시길 부탁드려요.*",
            },
          },

          {
            type: "input",

            block_id: "phone",

            label: {
              type: "plain_text",
              text: "원활한 모임 진행을 위해 핸드폰 번호를 받습니다.\n(연락처는 매칭된 그룹 내에서만 공유됩니다!)",
            },

            element: {
              type: "plain_text_input",

              action_id: "phone",

              placeholder: {
                type: "plain_text",
                text: "010-1234-5678 형식으로 입력해 주세요.",
              },
            },
          },

          {
            type: "divider",
          },

          ...blocks,

          {
            type: "divider",
          },

          {
            type: "section",

            text: {
              type: "mrkdwn",
              text: "만나지 않아도 되는 멤버가 있다면, 매칭에서 제외할 수 있습니다 :)\n- 정확하게 선택해주셔야만 제대로 반영될 수 있습니다.\n- 같은 회고모임에 배정되어있는 분들은 기본적으로 포함되었습니다.",
            },
          },

          {
            type: "input",

            block_id: "exclude",

            element: {
              type: "multi_users_select",

              action_id: "exclude",

              ...(user.groupMembers && {
                initial_users: user.groupMembers.split(", "),
              }),

              placeholder: {
                type: "plain_text",
                text: "이름으로 검색해주세요.",
                emoji: true,
              },
            },

            label: {
              type: "plain_text",
              text: "만나지 않아도 되는 멤버(들)",
              emoji: true,
            },

            optional: true,
          },

          {
            type: "divider",
          },

          {
            type: "section",

            text: {
              type: "mrkdwn",
              text: "노쇼 방지를 위한 보증금 제도가 있습니다. 그룹 내에서 모임 일정 확정 후 불참하실 경우, 메모어 보증금에서 1만원이 차감됩니다. (예: 1회 불참 시 1만원, 3회 불참 시 3만원 차감)",
            },
          },

          {
            type: "input",

            element: {
              type: "checkboxes",

              action_id: "guarantee",

              options: [
                {
                  value: "agree",

                  text: {
                    type: "plain_text",
                    text: "네, 그럴게요!",
                  },
                },
              ],
            },

            label: {
              type: "plain_text",
              text: "일정이 확정되면 꼭 참여해주세요! 혹시나 일정변경이 필요하다면 바로 공유해주세요.",
              emoji: true,
            },
          },

          {
            type: "section",

            text: {
              type: "mrkdwn",
              text: "런치/디너 클럽 매칭 과정에서 매칭 인원의 부족, 선호 및 관심 요소에 대한 부족으로 해당 회차에 한해 매칭이 안될 수도 있습니다.\n자주 발생하는 일은 아니며, 매칭이 될 수 있도록 최선을 다하겠습니다.",
            },
          },

          {
            type: "input",

            block_id: "acknowledge-possible-no-match",

            element: {
              type: "checkboxes",

              action_id: "acknowledge-possible-no-match",

              options: [
                {
                  value: "agree",

                  text: {
                    type: "plain_text",
                    text: "네, 이해합니다!",
                  },
                },
              ],
            },

            label: {
              type: "plain_text",
              text: "혹시 매칭이 안되더라도 이해해 주실 수 있으신가요?",
              emoji: true,
            },
          },

          {
            type: "section",

            text: {
              type: "mrkdwn",
              text: "메모어 런치/디너는 CS 응대가 어렵습니다.\n대신, 지난 2년간 쌓아온 데이터로 상황에 따른 FAQ 메뉴얼을 만들어 공유드릴 예정이에요.",
            },
          },

          {
            type: "input",

            block_id: "customer-service",

            element: {
              type: "checkboxes",

              action_id: "customer-service",

              options: [
                {
                  value: "agree",

                  text: {
                    type: "plain_text",
                    text: "네, 이해합니다!",
                  },
                },
              ],
            },

            label: {
              type: "plain_text",
              text: "너른 양해 부탁드립니다.",
              emoji: true,
            },
          },

          {
            type: "section",

            text: {
              type: "mrkdwn",
              text: "*[개인정보 수집·이용 및 제3자 제공 동의서]*\n본인은 다음과 같이 메모어 17기 신청 정보 중 일부를 본 동의서에서 정하는 경우에 한하여 메모어 런치/디너 클럽장에게 제공하는 것을 동의합니다.\n1. 개인정보 제3자 제공 동의\n- 제공받는 자: 런치/디너 클럽장\n2. 제공받는 자의 이용 목적\n- 런치/디너 클럽의 같은 모임원 혹은 중복 매칭 방지\n- 런치/디너 클럽의 모임방 생성 자동화\n- 모임 배정 고도화\n3. 제공 항목 : 성함, 연락처, 소속 모임명\n4. 제공받는 자의 보유ㆍ이용 기간\n- 17기 런치/디너 클럽 진행 기간동안 보관하며, 운영 종료 시 파기\n동의 거부권리 : 위 개인정보 제공 동의를 거부하실 수 있음. 다만 이 경우 런치/디너 클럽의 가입 및 프로그램 이용이 거부될 수 있습니다.",
            },
          },

          {
            type: "input",

            block_id: "personal-information-consent",

            element: {
              type: "checkboxes",

              action_id: "personal-information-consent",

              options: [
                {
                  value: "agree",

                  text: {
                    type: "plain_text",
                    text: "네, 동의합니다!",
                  },
                },
              ],
            },

            label: {
              type: "plain_text",
              text: "클럽 운영을 위한 개인정보 수집·이용 및 제3자 제공 동의에 관한 항목입니다. 개인정보 제3자 제공에 동의하실까요?",
              emoji: true,
            },
          },
        ],
      },
    };
  }

  private getNotReadyForJoinClubView(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
    title: string,
    user: User,
  ): ViewsOpenArguments {
    return {
      trigger_id: body.trigger_id,

      notify_on_close: true,

      view: {
        type: "modal",

        callback_id: NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,

        title: {
          type: "plain_text",
          text: title,
        },

        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${user.name}님* 참가신청을 진행합니다.`,
            },
          },

          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "만약 위에 적힌 성함이 실명 전체 또는 '홍길동A' 등이 아닌, 영문 또는 별명 그리고 성함의 일부(성 없이 이름) 등으로 나와있으실 경우, 원활한 운영을 위해 슬랙에서 *본명으로 꼭 변경해주신 뒤에 신청해주시길 부탁드려요.*",
            },
          },

          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*자기소개가 제출되어있지 않습니다.*\n*자기소개 채널에 제출하신 뒤 스레드에 제출했음을 알려주세요.*`,
            },
          },
        ],
      },

      close: {
        type: "plain_text",
        text: "닫기",
      },
    };
  }
}
