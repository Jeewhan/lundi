import { DinnerClubMember } from "./club-member";

class DinnerGroup {
  constructor(public readonly members: DinnerClubMember[]) {}

  public get memberIDs() {
    return this.members.map((m) => m.id);
  }

  private get leader() {
    return this.members[0];
  }

  private getIntersection(
    getValues: (member: DinnerClubMember) => string[],
  ): string[] {
    return this.members.reduce((intersection, member) => {
      return intersection.filter((value) => getValues(member).includes(value));
    }, getValues(this.leader));
  }

  public get locations(): string[] {
    return this.getIntersection(({ dinnerClubLocations }) =>
      dinnerClubLocations.split(","),
    );
  }

  public get datetimes(): string[] {
    return this.getIntersection(
      ({ dinnerPreferredDateTimeList }) => dinnerPreferredDateTimeList,
    );
  }

  public getMemberText(member: DinnerClubMember) {
    return `<@${member.id}>님
• 연락처: ${member.phone}
• <${member.introduce}|자기소개 링크>`;
  }

  public get noticeText() {
    return `안녕하세요, 디너클럽 매칭이 완료되었습니다!
<@${
      this.leader.id
    }>님께서 모임을 이끌어주세요 :) 이틀 내에 답이 없다면 다른분들이 먼저 이야기를 꺼내주세요.
함께 일정&장소를 조율하고, 맛있는 식사와 함께 즐거운 시간 보내세요.

디너클럽은 지역 / 일정이 정해져 있어요!


공통 만남 가능 지역은 ${this.locations.join(", ")} 이며,
공통 만남 가능 일정은 ${this.datetimes.join(", ")} 이에요.

위 공통된 지역들과 일정들 중 하나의 지역과 하나의 시간을 선택해 만나보세요.

만약 음식점 고르기 고민이라면, <https://naver.me/G9rpvEew|모임 추천 장소 DB>를 참고해서 정해보세요 :)


${this.members.map(this.getMemberText).join("\n\n")}


일정 조율 후 불참 시 메모어 보증금 1만원이 차감됩니다.
상대방이 일정 조율 후 일방적으로 약속을 취소하거나 노쇼 시, 불참 멤버 리포트를 부탁드립니다🙏

약속한 일정이 어려워진 경우, 상대방에게 양해를 구하고 다른 일정을 조율해 보아요😉
`;
  }
}

export default DinnerGroup;
