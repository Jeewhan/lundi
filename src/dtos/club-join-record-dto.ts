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
} from "../shared/constants";

export class ClubJoinRecordDTO {
  public readonly [아이디]: string;
  public readonly [연락처]: string;
  public readonly [만나지_않아도_될_멤버들]: string[];
  public readonly [보증금_동의]: boolean;
  public readonly [매칭_불확실성_동의]: boolean;
  public readonly [제한된_지원_동의]: boolean;
  public readonly [개인정보_동의]: boolean;
  public readonly [런치클럽_관심사]: string[];
  public readonly [디너클럽_일시]: string[];
  public readonly [디너클럽_장소]: string[];

  constructor(private readonly existingJoin: Record<string, any>) {
    this[아이디] = existingJoin[아이디];
    this[연락처] = existingJoin[연락처];
    this[만나지_않아도_될_멤버들] =
      existingJoin[만나지_않아도_될_멤버들].split(", ");
    this[보증금_동의] = existingJoin[보증금_동의];
    this[매칭_불확실성_동의] = existingJoin[매칭_불확실성_동의];
    this[제한된_지원_동의] = existingJoin[제한된_지원_동의];
    this[개인정보_동의] = existingJoin[개인정보_동의];
    this[런치클럽_관심사] = existingJoin[런치클럽_관심사].split(", ");
    this[디너클럽_일시] = existingJoin[디너클럽_일시].split(", ");
    this[디너클럽_장소] = existingJoin[디너클럽_장소].split(", ");
  }
}
