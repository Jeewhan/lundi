import { CLUB_TYPES, ClubType, groups } from "../constants";

// TODO: scoring 을 할 때에만 따라다니는 애들 vs 그렇지 않은 애들.
// TODO: 같이 다니는 친구들과 그렇지 않은 친구들의 분리.
// TODO: score는 계산 가능한 것이어서, 정말로 명확하게 계산에 필요한 친구들로 따라다녀야 한다.

export default class ClubMember {
  constructor(
    public name: string,
    public id: string,
    public group: (typeof groups)[number],
    public phone: string,
    public introduce: string,
    public clubType: ClubType,
    public groupMembers: string,
    public excludedMembers: string,
    public logs: string,
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
    if (this.clubType === CLUB_TYPES.dinner) {
      return false;
    }

    if (this.hasAppliedForLunch && this.lunchClubKeywords.trim().length === 0) {
      throw new Error(`${this.name}님의 lunchClubKeywords가 누락되었습니다.`);
    }

    return this.hasAppliedForLunch;
  }

  public isEligibleForDinner(): boolean {
    return (
      (this.clubType === CLUB_TYPES.dinner ||
        this.clubType === CLUB_TYPES["lunch-dinner"]) &&
      this.dinnerClubLocations.split(",").length > 0 &&
      this.dinnerPreferredDateTimeList.length > 0
    );
  }

  public isPersonInGroup(name: ClubMember["name"]): boolean {
    return this.groupMembers.includes(name);
  }

  public isPersonExcluded(name: ClubMember["name"]): boolean {
    return this.excludedMembers.includes(name);
  }

  public isPersonInLogs(id: ClubMember["id"]): boolean {
    return this.logs.includes(id);
  }
}

export class LunchClubMember extends ClubMember {
  public getMatchingLunchClubKeywords(
    lunchClubKeywords: ClubMember["lunchClubKeywords"]
  ) {
    const keywords = this.lunchClubKeywords.split(",");
    const otherKeywords = lunchClubKeywords.split(",");

    return keywords.filter((keyword) => otherKeywords.includes(keyword));
  }

  public scoreLunchMatch(member: LunchClubMember): number {
    if (!(member instanceof LunchClubMember)) {
      throw new Error(
        `${(member as ClubMember).name}은 LunchClubMember가 아닙니다.`
      );
    }

    if (!this.isEligibleForLunch()) {
      return 0;
    }

    if (this.isPersonInGroup(member.name)) {
      return 0;
    }

    if (this.isPersonExcluded(member.name)) {
      return 0;
    }

    if (this.isPersonInLogs(member.id)) {
      return 0;
    }

    return this.getMatchingLunchClubKeywords(member.lunchClubKeywords).length;
  }
}

export class DinnerClubMember extends ClubMember {
  public scoreDinnerMatch(member: DinnerClubMember): number {
    const locations = this.dinnerClubLocations.split(",");

    if (!(member instanceof DinnerClubMember)) {
      throw new Error(
        `${(member as ClubMember).name}은 DinnerClubMember가 아닙니다.`
      );
    }

    if (!this.isEligibleForDinner()) {
      return 0;
    }

    if (this.isPersonInGroup(member.name)) {
      return 0;
    }

    if (this.isPersonExcluded(member.name)) {
      return 0;
    }

    if (this.isPersonInLogs(member.id)) {
      return 0;
    }

    if (
      this.dinnerPreferredDateTimeList.every(
        (dateTime) => !member.dinnerPreferredDateTimeList.includes(dateTime)
      )
    ) {
      return 0;
    }

    if (
      locations.every(
        (location) => !member.dinnerClubLocations.includes(location)
      )
    ) {
      return 0;
    }

    return (
      this.dinnerPreferredDateTimeList.reduce((score, datetime) => {
        return (
          score +
          (member.dinnerPreferredDateTimeList.includes(datetime) ? 1 : 0)
        );
      }, 0) +
      locations.reduce((score, location) => {
        return score + (member.dinnerClubLocations.includes(location) ? 1 : 0);
      }, 0)
    );
  }
}
