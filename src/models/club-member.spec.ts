import { describe, test, expect, expectTypeOf } from "vitest";

import ClubMember from "./club-member";
import { clubTypes, dinnerPreferredDateTimes, keywords } from "../constants";
import { faker, generateMockClubMemberBy } from "../utils/mock";

describe("ClubMember", () => {
  test("constructor", () => {
    // given
    const member = generateMockClubMemberBy(
      faker.helpers.arrayElement(clubTypes)
    );

    // then
    expectTypeOf(member).toMatchTypeOf<ClubMember>();
  });

  test("get dinnerPreferredDateTimeList", () => {
    // given
    const a = generateMockClubMemberBy("lunch-dinner");
    const b = generateMockClubMemberBy("lunch-dinner");

    // when
    a.dinnerPreferredDateTime = dinnerPreferredDateTimes.join(", ");
    b.dinnerPreferredDateTime = "";

    // then
    expect(a.dinnerPreferredDateTimeList).toBeInstanceOf(Array);
    expect(b.dinnerPreferredDateTimeList).toEqual([]);
  });

  test("isEligibleForLunch", () => {
    // given
    const lunchMember = generateMockClubMemberBy("lunch");
    const dinnerMember = generateMockClubMemberBy("dinner");
    const lunchDinnerMember = generateMockClubMemberBy("lunch-dinner");

    // when
    lunchMember.hasAppliedForLunch = true;
    dinnerMember.hasAppliedForLunch = true;
    lunchDinnerMember.hasAppliedForLunch = true;
    lunchDinnerMember.lunchClubKeywords = "";

    // then
    expect(lunchMember.isEligibleForLunch()).toBe(true);
    expect(dinnerMember.isEligibleForLunch()).toBe(false);
    expect(() => lunchDinnerMember.isEligibleForLunch()).toThrowError(
      /lunchClubKeywords가 누락되었습니다./
    );
  });

  test("isEligibleForDinner", () => {
    // given
    const lunchMember = generateMockClubMemberBy("lunch");
    const dinnerMember = generateMockClubMemberBy("dinner");
    const lunchDinnerMember = generateMockClubMemberBy("lunch-dinner");

    // then
    expect(lunchMember.isEligibleForDinner()).toBe(false);
    expect(dinnerMember.isEligibleForDinner()).toBe(true);
    expect(lunchDinnerMember.isEligibleForDinner()).toBe(true);
  });

  test("isPersonInGroup", () => {
    // given
    const a = generateMockClubMemberBy("lunch-dinner");
    const b = generateMockClubMemberBy("lunch-dinner");
    const c = generateMockClubMemberBy("lunch-dinner");

    // when
    a.groupMembers = a.groupMembers.split(", ").concat(b.name).join(", ");

    // then
    expect(a.isPersonInGroup(b.name)).toBe(true);
    expect(a.isPersonInGroup(c.name)).toBe(false);
  });

  test("isPersonExcluded", () => {
    // given
    const a = generateMockClubMemberBy("lunch-dinner");
    const b = generateMockClubMemberBy("lunch-dinner");
    const c = generateMockClubMemberBy("lunch-dinner");

    // when
    a.excludedMembers = a.excludedMembers.split(", ").concat(b.name).join(", ");

    // then
    expect(a.isPersonExcluded(b.name)).toBe(true);
    expect(a.isPersonExcluded(c.name)).toBe(false);
  });

  test("hasMatchingLunchClubKeywords", () => {
    // given
    const a = generateMockClubMemberBy("lunch-dinner");
    const b = generateMockClubMemberBy("lunch-dinner");
    const c = generateMockClubMemberBy("lunch-dinner");
    const d = generateMockClubMemberBy("lunch-dinner");

    // when
    a.lunchClubKeywords = keywords[0];
    b.lunchClubKeywords = [keywords[0], keywords[1]].join(", ");

    c.lunchClubKeywords = keywords[1];
    d.lunchClubKeywords = keywords[2];

    // then
    expect(
      a.hasMatchingLunchClubKeywords(b.lunchClubKeywords)
    ).toBeGreaterThanOrEqual(1);
    expect(
      b.hasMatchingLunchClubKeywords(c.lunchClubKeywords)
    ).toBeGreaterThanOrEqual(1);
    expect(c.hasMatchingLunchClubKeywords(d.lunchClubKeywords)).toBeLessThan(1);
  });

  describe("canMatchForLunchWith", () => {
    test("매칭 성공", () => {
      // given
      const a = generateMockClubMemberBy("lunch-dinner");
      const b = generateMockClubMemberBy("lunch-dinner");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = true;

      a.lunchClubKeywords = keywords[0];
      b.lunchClubKeywords = [keywords[0], keywords[1]].join(", ");

      expect(a.canMatchForLunchWith(b)).toBe(true);
    });

    test("다른 한 명은 dinner만 신청했다.", () => {
      // given
      const a = generateMockClubMemberBy("lunch-dinner");
      const b = generateMockClubMemberBy("dinner");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = false;

      // then
      expect(a.canMatchForLunchWith(b)).toBe(false);
    });

    test("서로가 같은 그룹에 있다.", () => {
      // given
      const a = generateMockClubMemberBy("lunch-dinner");
      const b = generateMockClubMemberBy("lunch-dinner");

      // when
      a.groupMembers = a.groupMembers.split(", ").concat(b.name).join(", ");

      // then
      expect(a.canMatchForLunchWith(b)).toBe(false);
    });

    test("서로가 서로를 제외한다.", () => {
      // given
      const a = generateMockClubMemberBy("lunch-dinner");
      const b = generateMockClubMemberBy("lunch-dinner");

      // when
      a.excludedMembers = a.excludedMembers
        .split(", ")
        .concat(b.name)
        .join(", ");

      // then
      expect(a.canMatchForLunchWith(b)).toBe(false);
    });

    test("한 명만 다른 한 명을 제외한다.", () => {
      // given
      const a = generateMockClubMemberBy("lunch-dinner");
      const b = generateMockClubMemberBy("lunch-dinner");
      const c = generateMockClubMemberBy("lunch-dinner");

      // when
      a.excludedMembers = a.excludedMembers
        .split(", ")
        .concat(b.name)
        .join(", ");

      // then
      expect(a.canMatchForLunchWith(b)).toBe(false);
    });

    test("서로의 관심사가 다르다.", () => {
      // given
      const a = generateMockClubMemberBy("lunch-dinner");
      const b = generateMockClubMemberBy("lunch-dinner");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = true;

      a.lunchClubKeywords = keywords[0];
      b.lunchClubKeywords = keywords[2];

      // then
      expect(a.canMatchForLunchWith(b)).toBe(false);
    });
  });
});
