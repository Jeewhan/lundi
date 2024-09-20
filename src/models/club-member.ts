export default class ClubMember {
  constructor(
    public name: string,
    public id: string,
    public group: (typeof groups)[number],
    public phone: string,
    public introduce: string,
    public clubType: (typeof clubTypes)[number],
    public groupMembers: string,
    public excludedMembers: string,
    public keywords: string,
    public dinnerClubLocations: string,
    public hasAppliedForLunch: boolean,
    public dinnerPreferredDateTime: string
  ) {}

  get dinnerPreferredDateTimeList(): string[] {
    return this.dinnerPreferredDateTime.split(", ");
  }

  public isEligibleForLunch(): boolean {
    return this.clubType === "lunch" || this.clubType === "lunch-dinner";
  }

  public isEligibleForDinner(): boolean {
    return this.clubType === "dinner" || this.clubType === "lunch-dinner";
  }

  public isPersonInGroup(name: ClubMember["name"]): boolean {
    return this.groupMembers.includes(name);
  }

  public isPersonExcluded(name: ClubMember["name"]): boolean {
    return this.excludedMembers.includes(name);
  }
}

export const clubTypes = ["lunch", "dinner", "lunch-dinner"] as const;

export const regions = [
  "강남/서초",
  "을지로",
  "용산",
  "합정/홍대",
  "성수",
] as const;

export const groups = [
  "회고_off_리유니언_배려",
  "회고_off_리유니언_현재",
  "회고_off_토1시_기대",
  "회고_off_토1시_사유",
  "회고_off_토1시_용기",
  "회고_off_토1시_웃음",
  "회고_off_토1시_행운",
  "회고_off_토1시_환상",
  "회고_off_토6시_관점",
  "회고_off_토6시_긍정",
  "회고_off_토6시_나눔",
  "회고_off_토6시_다짐",
  "회고_off_토6시_마음",
  "회고_off_토6시_명랑",
  "회고_off_토6시_몰입",
  "회고_off_토6시_미래",
  "회고_off_토6시_변화",
  "회고_off_토6시_선물",
  "회고_off_토6시_오늘",
  "회고_off_토6시_의미",
  "회고_off_토6시_이해",
  "회고_off_토6시_자유",
  "회고_off_토6시_중심",
  "회고_off_토6시_친구",
  "회고_off_토6시_필연",
  "회고_off_토6시_활기",
  "회고_off_토6시_흐름",
  "회고_off_토6시_공감",
  "회고_off_토6시_경험",
  "회고_off_일1시_관심",
  "회고_off_일1시_기억",
  "회고_off_일1시_내일",
  "회고_off_일1시_성실",
  "회고_off_일1시_소통",
  "회고_off_일1시_시작",
  "회고_off_일1시_하루",
  "회고_off_일1시_도전",
  "회고_off_일6시_도약",
  "회고_off_일6시_산책",
  "회고_off_일6시_열정",
  "회고_off_일6시_여유",
  "회고_off_일6시_재미",
  "회고_off_일6시_조화",
  "회고_off_일6시_집중",
  "회고_off_일6시_화합",
  "회고_off_일6시_희망",
  "회고_off_일6시_균형",
  "회고_on_토10시_걸음",
  "회고_on_토10시_본질",
  "회고_prv_서석준",
  "회고_prv_유병국",
  "회고_refresh",
  "회고_so_기쁨",
  "회고_so_도움",
  "회고_so_탐구",
  "회고_so_풍요",
  "회고_so_하늘",
] as const;

export const keywords = [
  "마케팅/브랜딩",
  "IT/AI",
  "창업/비즈니스",
  "커리어",
  "부업/사이드프로젝트",
  "취미/일상/콘텐츠",
  "해외/여행",
] as const;

export const dinnerPreferredDateTimes = [
  "20241004 19:00",
  "20241005 18:00",
  "20241025 19:00",
  "20241026 18:00",
];
