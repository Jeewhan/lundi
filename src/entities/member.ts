import { DateTime } from "luxon";
import { KnownBlock, SectionBlock } from "@slack/bolt";

import {
  아이디,
  연락처,
  만나지_않아도_될_멤버들,
  보증금_동의,
  매칭_불확실성_동의,
  제한된_지원_동의,
  개인정보_동의,
  런치클럽_관심사,
  디너클럽_일시,
  디너클럽_장소,
  클럽선택,
  일시,
} from "../shared/constants";

export interface MemberValues {
  [연락처]: string;
  [만나지_않아도_될_멤버들]: string[];
  [보증금_동의]: boolean;
  [매칭_불확실성_동의]: boolean;
  [제한된_지원_동의]: boolean;
  [개인정보_동의]: boolean;
}

export interface LunchClubMemberValues extends MemberValues {
  [런치클럽_관심사]: string[];
}

export interface DinnerClubMemberValues extends MemberValues {
  [디너클럽_일시]: string[];
  [디너클럽_장소]: string[];
}

export interface LunchDinnerClubMemberValues
  extends LunchClubMemberValues,
    DinnerClubMemberValues {}

export class Member {
  private readonly [연락처]: string;
  private readonly [만나지_않아도_될_멤버들]: string[];
  private readonly [보증금_동의]: boolean;
  private readonly [매칭_불확실성_동의]: boolean;
  private readonly [제한된_지원_동의]: boolean;
  private readonly [개인정보_동의]: boolean;
  private readonly [클럽선택]: "런치" | "디너" | "런치디너";
  private readonly [런치클럽_관심사]: string[];
  private readonly [디너클럽_일시]: string[];
  private readonly [디너클럽_장소]: string[];

  constructor(
    private readonly 아이디: string,
    values:
      | LunchClubMemberValues
      | DinnerClubMemberValues
      | LunchDinnerClubMemberValues,
  ) {
    this[연락처] = values[연락처];
    this[만나지_않아도_될_멤버들] = values[만나지_않아도_될_멤버들];
    this[보증금_동의] = values[보증금_동의] ?? true;
    this[매칭_불확실성_동의] = values[매칭_불확실성_동의] ?? true;
    this[제한된_지원_동의] = values[제한된_지원_동의] ?? true;
    this[개인정보_동의] = values[개인정보_동의] ?? true;

    const isLunch = "런치클럽_관심사" in values;
    const isDinner = "디너클럽_일시" in values && "디너클럽_장소" in values;

    this[클럽선택] = `${isLunch ? "런치" : ""}${isDinner ? "디너" : ""}` as
      | "런치"
      | "디너"
      | "런치디너";

    this[런치클럽_관심사] = isLunch ? values[런치클럽_관심사] : [];
    this[디너클럽_일시] = isDinner ? values[디너클럽_일시] : [];
    this[디너클럽_장소] = isDinner ? values[디너클럽_장소] : [];
  }

  public get row() {
    return {
      [일시]: DateTime.now()
        .setZone("Asia/Seoul")
        .toFormat("yyyy-MM-dd HH:mm:ss"),
      [아이디]: this[아이디],
      [연락처]: this[연락처],
      [만나지_않아도_될_멤버들]: this[만나지_않아도_될_멤버들].join(", "),
      [보증금_동의]: this[보증금_동의],
      [매칭_불확실성_동의]: this[매칭_불확실성_동의],
      [제한된_지원_동의]: this[제한된_지원_동의],
      [개인정보_동의]: this[개인정보_동의],
      [클럽선택]: this[클럽선택],
      [런치클럽_관심사]: this[런치클럽_관심사].join(", "),
      [디너클럽_일시]: this[디너클럽_일시].join(", "),
      [디너클럽_장소]: this[디너클럽_장소].join(", "),
    };
  }

  public get blocks(): KnownBlock[] {
    const relevantFields = [
      연락처,
      클럽선택,
      런치클럽_관심사,
      디너클럽_일시,
      디너클럽_장소,
    ] as const;

    const noticeBlock =
      this[클럽선택] === "런치디너"
        ? []
        : [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "> 클럽선택이 *런치디너* 가 아니라 *런치* 또는 *디너* 라고 나와있다면, 해당 클럽만 신청된 것입니다.\n> 둘 다 신청되기를 바라신다면 *동시참가신청* 을 해주세요.",
              },
            } as KnownBlock,
          ];

    const propertyBlocks = relevantFields
      .filter((field) =>
        Array.isArray(this.row[field])
          ? this.row[field].length
          : this.row[field],
      )
      .map(
        (field) =>
          ({
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${field}: *${this.row[field]}*`,
            },
          } as SectionBlock),
      );

    return [...propertyBlocks, ...noticeBlock];
  }
}
