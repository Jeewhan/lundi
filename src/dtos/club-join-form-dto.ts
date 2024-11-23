import { ViewOutput } from "@slack/bolt";

import {
  개인정보_동의,
  디너클럽_일시,
  디너클럽_장소,
  런치클럽_관심사,
  만나지_않아도_될_멤버들,
  매칭_불확실성_동의,
  보증금_동의,
  연락처,
  제한된_지원_동의,
} from "../shared/constants";
import {
  DinnerClubMemberValues,
  LunchClubMemberValues,
  LunchDinnerClubMemberValues,
} from "../entities/member";

export class ClubJoinFormDTO {
  constructor(private readonly id: string) {}

  public parse(
    view: ViewOutput,
  ):
    | LunchClubMemberValues
    | DinnerClubMemberValues
    | LunchDinnerClubMemberValues {
    const values = view.state.values;

    return {
      [연락처]: values[연락처]?.[연락처]?.value ?? "",
      [만나지_않아도_될_멤버들]:
        values[만나지_않아도_될_멤버들]?.[만나지_않아도_될_멤버들]
          ?.selected_users ?? [],
      [보증금_동의]: !values[보증금_동의]
        ? true
        : values[보증금_동의]?.[보증금_동의]?.selected_options?.[0]?.value ===
          "agree",
      [매칭_불확실성_동의]: !values[매칭_불확실성_동의]
        ? true
        : values[매칭_불확실성_동의]?.[매칭_불확실성_동의]
            ?.selected_options?.[0]?.value === "agree",
      [제한된_지원_동의]: !values[제한된_지원_동의]
        ? true
        : values[제한된_지원_동의]?.[제한된_지원_동의]?.selected_options?.[0]
            ?.value === "agree",
      [개인정보_동의]: !values[개인정보_동의]
        ? true
        : values[개인정보_동의]?.[개인정보_동의]?.selected_options?.[0]
            ?.value === "agree",

      ...(values[런치클럽_관심사] && {
        [런치클럽_관심사]:
          values[런치클럽_관심사]?.[런치클럽_관심사]?.selected_options?.map(
            (option) => option.value,
          ) ?? [],
      }),

      ...(values[디너클럽_일시] && {
        [디너클럽_일시]:
          values[디너클럽_일시]?.[디너클럽_일시]?.selected_options?.map(
            (option) => option.value,
          ) ?? [],
      }),

      ...(values[디너클럽_장소] && {
        [디너클럽_장소]:
          values[디너클럽_장소]?.[디너클럽_장소]?.selected_options?.map(
            (option) => option.value,
          ) ?? [],
      }),
    };
  }
}
