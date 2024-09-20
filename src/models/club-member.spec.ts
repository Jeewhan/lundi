import { describe, test, expect, expectTypeOf } from "vitest";
import { Faker, ko } from "@faker-js/faker";

import ClubMember, {
  clubTypes,
  dinnerPreferredDateTimes,
  groups,
  keywords,
  regions,
} from "./club-member";

const faker = new Faker({
  locale: [ko],
});

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
    a.dinnerPreferredDateTime =
      "20241004 19:00, 20241005 18:00, 20241025 19:00, 20241026 18:00";
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
    a.lunchClubKeywords = "마케팅/브랜딩";
    b.lunchClubKeywords = "마케팅/브랜딩, 창업/비즈니스";

    c.lunchClubKeywords = "창업/비즈니스";
    d.lunchClubKeywords = "커리어";

    // then
    expect(
      a.hasMatchingLunchClubKeywords(b.lunchClubKeywords)
    ).toBeGreaterThanOrEqual(1);
    expect(
      b.hasMatchingLunchClubKeywords(c.lunchClubKeywords)
    ).toBeGreaterThanOrEqual(1);
    expect(c.hasMatchingLunchClubKeywords(d.lunchClubKeywords)).toBeLessThan(1);
  });
});

const generateMockClubMemberBy = (
  clubType: (typeof clubTypes)[number]
): ClubMember => {
  return new ClubMember(
    faker.person.fullName(),
    `U${faker.string.alphanumeric({ length: 10, casing: "upper" })}`,
    faker.helpers.arrayElement(groups),
    generatePhoneNumber(),
    generateIntroduce(),
    clubType,
    generateGroupMembers(),
    generateExcludedMembers(),
    generateLunchClubKeywords(clubType),
    generateDinnerClubLocations(clubType),
    generateHasAppliedForLunch(clubType),
    generateDinnerPreferredDateTime(clubType)
  );
};

const generatePhoneNumber = () => {
  return `010-${faker.string.numeric({
    length: 4,
    allowLeadingZeros: false,
  })}-${faker.string.numeric({ length: 4, allowLeadingZeros: false })}`;
};

const generateIntroduce = (): string => {
  const memoirNumber = faker.number.int({ min: 16, max: 99 });
  const channelId = `C${faker.string.alphanumeric({
    length: 10,
    casing: "upper",
  })}`;
  const postId = faker.number.int({ min: 1000000000000, max: 9999999999999 });

  return `https://memoir${memoirNumber}.slack.com/archives/${channelId}/p${postId}`;
};

const generateGroupMembers = (): string => {
  return Array.from({ length: faker.number.int({ min: 0, max: 4 }) }, () =>
    faker.person.fullName()
  ).join(", ");
};

const generateExcludedMembers = (): string => {
  return Array.from({ length: faker.number.int({ min: 0, max: 32 }) }, () =>
    faker.person.fullName()
  ).join(", ");
};

const generateLunchClubKeywords = (
  clubType: (typeof clubTypes)[number]
): string => {
  if (clubType === "dinner") {
    return "";
  }

  const selectedKeywords = faker.helpers.arrayElements(keywords, {
    min: 1,
    max: keywords.length,
  });

  return selectedKeywords.join(", ");
};

const generateDinnerClubLocations = (
  clubType: (typeof clubTypes)[number]
): string => {
  if (clubType === "lunch") {
    return "";
  }

  return faker.helpers
    .arrayElements(regions, {
      min: 1,
      max: regions.length,
    })
    .join(", ");
};

const generateHasAppliedForLunch = (
  clubType: (typeof clubTypes)[number]
): boolean => {
  if (clubType === "dinner") {
    return false;
  }

  return faker.number.int({ min: 0, max: 100 }) > 30;
};

const generateDinnerPreferredDateTime = (
  clubType: (typeof clubTypes)[number]
): string => {
  if (clubType === "lunch") {
    return "";
  }

  if (faker.number.int({ min: 0, max: 100 }) < 30) {
    return "";
  }

  const selectedDates = faker.helpers.arrayElements(dinnerPreferredDateTimes, {
    min: 1,
    max: 4,
  });

  return selectedDates.join(", ");
};
