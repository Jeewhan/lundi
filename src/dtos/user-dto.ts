import "dotenv/config";

import {
  아이디,
  만나지_않아도_될_멤버들,
  groups,
  자기소개,
  성함,
} from "../shared/constants";

export class UserDTO {
  public readonly [아이디]: string;
  public readonly [성함]: string;
  public readonly ["그룹"]: (typeof groups)[number];
  public readonly [자기소개]: string;
  public readonly [만나지_않아도_될_멤버들]: string[];

  constructor(userRecord: Record<string, string>) {
    this[아이디] = userRecord[아이디];
    this[성함] = userRecord[성함];
    this["그룹"] = userRecord["그룹"] as (typeof groups)[number];
    this[자기소개] = userRecord[자기소개] ?? "";
    this[만나지_않아도_될_멤버들] = userRecord[만나지_않아도_될_멤버들]
      ? userRecord[만나지_않아도_될_멤버들].split(", ")
      : [];
  }

  get isValidIntroduce(): boolean {
    if (!this[자기소개]) return false;

    return this[자기소개].includes(
      process.env.MEMOIR_17_INTRODUCE_CHANNEL as string,
    );
  }
}
