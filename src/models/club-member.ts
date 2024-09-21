import { clubTypes, groups } from "../constants";

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
    public lunchClubKeywords: string,
    public dinnerClubLocations: string,
    public hasAppliedForLunch: boolean,
    public dinnerPreferredDateTime: string
  ) {}

  get dinnerPreferredDateTimeList(): string[] {
    if (!this.dinnerPreferredDateTime.trim()) {
      return [];
    }

    return this.dinnerPreferredDateTime.split(", ");
  }

  public isEligibleForLunch(): boolean {
    if (this.clubType === "dinner") {
      return false;
    }

    if (this.hasAppliedForLunch && this.lunchClubKeywords.trim().length === 0) {
      throw new Error(`${this.name}님의 lunchClubKeywords가 누락되었습니다.`);
    }

    return this.hasAppliedForLunch;
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

  public hasMatchingLunchClubKeywords(
    lunchClubKeywords: ClubMember["lunchClubKeywords"]
  ) {
    const keywords = this.lunchClubKeywords.split(", ");
    const otherKeywords = lunchClubKeywords.split(", ");

    return keywords.filter((keyword) => otherKeywords.includes(keyword)).length;
  }

  public canMatchForLunchWith(member: ClubMember): boolean {
    return (
      this.isEligibleForLunch() &&
      member.isEligibleForLunch() &&
      !this.isPersonInGroup(member.name) &&
      !this.isPersonExcluded(member.name) &&
      !member.isPersonExcluded(this.name) &&
      this.hasMatchingLunchClubKeywords(member.lunchClubKeywords) > 0
    );
  }
}
