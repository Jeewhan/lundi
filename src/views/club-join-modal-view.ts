import {
  BlockAction,
  ButtonAction,
  KnownBlock,
  MrkdwnElement,
  MrkdwnOption,
} from "@slack/bolt";
import { ViewsOpenArguments } from "@slack/web-api";

import { UserDTO } from "../dtos/user-dto";
import { ClubJoinRecordDTO } from "../dtos/club-join-record-dto";

import {
  NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
  READY_FOR_JOIN_CLUB_CALLBACK_ID,
  개인정보_동의,
  디너클럽_일시,
  디너클럽_장소,
  런치클럽_관심사,
  만나지_않아도_될_멤버들,
  매칭_불확실성_동의,
  보증금_동의,
  성함,
  연락처,
  제한된_지원_동의,
} from "../shared/constants";

export class ClubJoinModalView {
  constructor(
    private readonly user: UserDTO, // private readonly existingJoin?: ClubJoinRecordDTO,
  ) {}

  public joinLunchClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
  ): ViewsOpenArguments {
    return this.joinClub(body, payload, "런치클럽 참가 신청", [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "런치클럽을 선택해주셨어요!\n매칭을 위해 아래 내용을 선택해주세요.",
        },
      },

      ...this.spacerBlock,

      ...this.getLunchClubTopicSelectionBlocks(),
    ]);
  }

  public joinDinnerClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
  ): ViewsOpenArguments {
    return this.joinClub(body, payload, "디너클럽 참가 신청", [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "디너클럽을 선택해주셨어요!\n매칭을 위해 아래 내용을 선택해주세요.",
        },
      },

      ...this.spacerBlock,

      ...this.getDinnerClubTopicSelectionBlocks(),
    ]);
  }

  public joinLunchDinnerClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
  ): ViewsOpenArguments {
    return this.joinClub(body, payload, "런치클럽 & 디너클럽 동시참가신청", [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "런치클럽 & 디너클럽을 동시에 선택해주셨어요!\n매칭을 위해 아래 내용을 선택해주세요.",
        },
      },

      ...this.spacerBlock,

      ...this.getLunchClubTopicSelectionBlocks(),

      ...this.spacerBlock,

      ...this.getDinnerClubTopicSelectionBlocks(),
    ]);
  }

  private get excludedMembers(): string[] {
    return (
      // this.existingJoin?.[만나지_않아도_될_멤버들] ??
      this.user[만나지_않아도_될_멤버들] ?? []
    );
  }

  private get spacerBlock(): KnownBlock[] {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: " ",
        },
      },

      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: " ",
        },
      },
    ];
  }

  // private get dinnerDatetimes(): MrkdwnOption[] {
  //   const list = [
  //     {
  //       value: "20241206 19:00",
  //       text: {
  //         type: "mrkdwn",
  //         text: "12/6(금) 저녁 7시",
  //       },
  //     },
  //     {
  //       value: "20241208 18:00",
  //       text: {
  //         type: "mrkdwn",
  //         text: "12/8(일) 저녁 6시",
  //       },
  //     },
  //     {
  //       value: "20241213 19:00",
  //       text: {
  //         type: "mrkdwn",
  //         text: "12/13(금) 저녁 7시",
  //       },
  //     },
  //     {
  //       value: "20241214 18:00",
  //       text: {
  //         type: "mrkdwn",
  //         text: "12/14(토) 저녁 6시",
  //       },
  //     },
  //     {
  //       value: "20241215 18:00",
  //       text: {
  //         type: "mrkdwn",
  //         text: "12/15(일) 저녁 6시",
  //       },
  //     },
  //   ] as MrkdwnOption[];

  //   return list.filter((item) =>
  //     (this.existingJoin?.[디너클럽_일시] ?? []).includes(item.value!),
  //   );
  // }

  private joinClub(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
    title: string,
    blocks: KnownBlock[],
  ): ViewsOpenArguments {
    if (!this.user.isValidIntroduce) {
      return this.getNotReadyForJoinClubView(body, payload, title);
    }

    return {
      trigger_id: body.trigger_id,

      view: {
        type: "modal",

        callback_id: READY_FOR_JOIN_CLUB_CALLBACK_ID,
        notify_on_close: true,

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
          ...this.getNameVerificationBlocks(),

          this.getPhoneNumberInputBlock(),

          ...this.spacerBlock,

          ...blocks,

          ...this.spacerBlock,

          ...this.getExcludedMembersSelectionBlocks(),

          ...this.spacerBlock,

          // ...(this.existingJoin
          ...(false ? [] : this.getPolicyAgreementBlocks()),
        ],
      },
    };
  }

  public getNotReadyForJoinClubView(
    body: BlockAction<ButtonAction>,
    payload: ButtonAction,
    title: string,
  ): ViewsOpenArguments {
    return {
      trigger_id: body.trigger_id,

      view: {
        type: "modal",

        callback_id: NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
        notify_on_close: true,

        title: {
          type: "plain_text",
          text: title,
        },

        blocks: [
          ...this.getNameVerificationBlocks(),

          {
            type: "section",

            text: {
              type: "mrkdwn",
              text: `*자기소개가 제출되어있지 않습니다.*\n*자기소개 채널에 제출하신 뒤, 클럽신청메시지 스레드에 제출했음을 알려주세요.*`,
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

  private getNameVerificationBlocks(): KnownBlock[] {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${this.user[성함]}님* 참가신청을 진행합니다.`,
        },
      },

      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*[필수]* 위에 적힌 성함이 영문, 별명, 성함의 일부(ex. 성 없이 이름) 등으로 나와있으실 경우, 원활한 운영을 위해 슬랙에서 전체 실명(알파벳 포함 | 홍길동A, 김철수B 등)으로 *변경해주신 뒤에 신청해주세요.*",
        },
      },

      ...this.spacerBlock,
    ];
  }

  private getPhoneNumberInputBlock() {
    return {
      type: "input",

      block_id: 연락처,

      label: {
        type: "plain_text",
        text: ":iphone: 원활한 매칭 진행을 위해 핸드폰 번호를 받습니다.\n(연락처는 매칭된 그룹 내에서만 공유됩니다!)",
        emoji: true,
      },

      element: {
        type: "plain_text_input",

        action_id: 연락처,

        // initial_value: this.existingJoin?.[연락처] ?? "",

        placeholder: {
          type: "plain_text",
          text: "010-1234-5678 형식으로 입력해 주세요.",
        },
      },
    };
  }

  private getExcludedMembersSelectionBlocks(): KnownBlock[] {
    return [
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: ":one: 만나지 않아도 되는 멤버가 있다면, 매칭에서 제외할 수 있습니다.\n- 같은 회고모임 멤버들은 기본적으로 포함되어있습니다.",
        },
      },

      {
        type: "input",

        block_id: 만나지_않아도_될_멤버들,

        element: {
          type: "multi_users_select",

          action_id: 만나지_않아도_될_멤버들,

          initial_users: this.excludedMembers,

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
    ];
  }

  private getPolicyAgreementBlocks(): KnownBlock[] {
    return [
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: ":two: 노쇼 방지를 위한 보증금 제도가 있습니다. 그룹 내에서 일정 확정 후 불참하실 경우, 메모어 보증금에서 1만원이 차감됩니다. (예: 1회 불참 시 1만원, 3회 불참 시 3만원 차감)",
        },
      },

      {
        type: "input",

        block_id: 보증금_동의,

        element: {
          type: "checkboxes",

          action_id: 보증금_동의,

          options: [
            {
              value: "agree",

              text: {
                type: "mrkdwn",
                text: "*네, 그럴게요!*",
              },
            },
          ],
        },

        label: {
          type: "plain_text",
          text: "부득이한 사유로 일정변경이 필요하다면 바로 매칭된 분들에게 공유해주세요.",
          emoji: true,
        },
      },

      ...this.spacerBlock,

      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: ":three: 매칭 과정에서 매칭 인원의 부족, 선호 및 관심 요소에 대한 부족으로 해당 회차에 한해 매칭이 안될 수도 있습니다.\n자주 발생하는 일은 아니며, 매칭이 될 수 있도록 최선을 다하겠습니다.",
        },
      },

      {
        type: "input",

        block_id: 매칭_불확실성_동의,

        element: {
          type: "checkboxes",

          action_id: 매칭_불확실성_동의,

          options: [
            {
              value: "agree",

              text: {
                type: "mrkdwn",
                text: "*네, 이해합니다!*",
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

      ...this.spacerBlock,

      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: ":four: 메모어 런치/디너는 CS 응대가 어렵습니다.",
        },
      },

      {
        type: "input",

        block_id: 제한된_지원_동의,

        element: {
          type: "checkboxes",

          action_id: 제한된_지원_동의,

          options: [
            {
              value: "agree",

              text: {
                type: "mrkdwn",
                text: "*네, 이해합니다!*",
              },
            },
          ],
        },

        label: {
          type: "plain_text",
          text: "모집글의 FAQ를 참고해주세요.",
          emoji: true,
        },
      },

      ...this.spacerBlock,

      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: ":five: 개인정보 수집·이용 및 제3자 제공 동의서\n본인은 다음과 같이 메모어 17기 신청 정보 중 일부를 본 동의서에서 정하는 경우에 한하여 메모어 런치/디너 클럽장에게 제공하는 것을 동의합니다.\n1. 개인정보 제3자 제공 동의\n- 제공받는 자: 런치/디너 클럽장\n2. 제공받는 자의 이용 목적\n- 런치/디너 클럽의 같은 모임원 혹은 중복 매칭 방지\n- 런치/디너 클럽의 모임방 생성 자동화\n- 모임 배정 고도화\n3. 제공 항목 : 성함, 연락처, 소속 모임명\n4. 제공받는 자의 보유ㆍ이용 기간\n- 17기 런치/디너 클럽 진행 기간동안 보관하며, 운영 종료 시 파기\n동의 거부권리 : 위 개인정보 제공 동의를 거부하실 수 있음. 다만 이 경우 런치/디너 클럽의 가입 및 프로그램 이용이 거부될 수 있습니다.",
        },
      },

      {
        type: "input",

        block_id: 개인정보_동의,

        element: {
          type: "checkboxes",

          action_id: 개인정보_동의,

          options: [
            {
              value: "agree",

              text: {
                type: "mrkdwn",
                text: "*네, 동의합니다!*",
              },
            },
          ],
        },

        label: {
          type: "plain_text",
          text: "개인정보 제3자 제공에 동의하실까요?",
          emoji: true,
        },
      },
    ];
  }

  private getLunchClubTopicSelectionBlocks(): KnownBlock[] {
    return [
      {
        type: "input",
        block_id: 런치클럽_관심사,
        element: {
          type: "checkboxes",
          action_id: 런치클럽_관심사,

          // initial_options:
          //   this.existingJoin?.[런치클럽_관심사]?.map((value) => ({
          //     value,
          //     text: {
          //       type: "mrkdwn",
          //       text: value,
          //     },
          //   })) ?? [],

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
          text: ":pizza: 런치클럽에서 만나 나누고 싶은 대화 주제(관심사)를 골라주세요!\n복수 선택이 가능해요. 많이 고를수록 더 다양한 만남이 가능해요.",
          emoji: true,
        },
      },
    ];
  }

  private getDinnerClubTopicSelectionBlocks(): KnownBlock[] {
    return [
      {
        type: "input",
        block_id: 디너클럽_일시,
        element: {
          type: "checkboxes",
          action_id: 디너클럽_일시,

          // initial_options: this.dinnerDatetimes,

          options: [
            {
              value: "20241206 19:00",
              text: {
                type: "mrkdwn",
                text: "12/6(금) 저녁 7시",
              },
            },
            {
              value: "20241208 18:00",
              text: {
                type: "mrkdwn",
                text: "12/8(일) 저녁 6시",
              },
            },
            {
              value: "20241213 19:00",
              text: {
                type: "mrkdwn",
                text: "12/13(금) 저녁 7시",
              },
            },
            {
              value: "20241214 18:00",
              text: {
                type: "mrkdwn",
                text: "12/14(토) 저녁 6시",
              },
            },
            {
              value: "20241215 18:00",
              text: {
                type: "mrkdwn",
                text: "12/15(일) 저녁 6시",
              },
            },
          ],
        },

        label: {
          type: "plain_text",
          text: ":knife_fork_plate: 디너클럽 참석이 가능한 일정을 모두 선택해주세요. 선택 후 변경은 어려워요.(복수선택 가능)\n참여 일정 5개 체크 시 : 0~5번의 매칭 가능\n참여 일정 3개 체크 시: 0~3번의 매칭 가능\n참여 일정 1개 체크 시 : 0~1번의 매칭 가능\n- 선택일을 적게 할 경우 매칭이 안될 수 있어요.",
          emoji: true,
        },
      },

      ...this.spacerBlock,

      {
        type: "input",
        block_id: 디너클럽_장소,
        element: {
          type: "checkboxes",
          action_id: 디너클럽_장소,
          options: [
            {
              value: "강남/서초",
              text: {
                type: "mrkdwn",
                text: "강남/서초",
              },
            },
            {
              value: "을지로",
              text: {
                type: "mrkdwn",
                text: "을지로",
              },
            },
            {
              value: "용산",
              text: {
                type: "mrkdwn",
                text: "용산",
              },
            },
            {
              value: "합정/홍대",
              text: {
                type: "mrkdwn",
                text: "합정/홍대",
              },
            },
            {
              value: "성수",
              text: {
                type: "mrkdwn",
                text: "성수",
              },
            },
          ],
        },

        label: {
          type: "plain_text",
          text: ":knife_fork_plate: 디너클럽 모임을 위해 선호하는 지역을 골라주세요.(복수선택 가능)\n- 많이 고를수록 더 다양한 만남이 가능해요.",
          emoji: true,
        },
      },
    ];
  }
}
