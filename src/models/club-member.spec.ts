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
    const member = generateMockClubMemberBy("lunch-dinner");

    // then
    expect(member.dinnerPreferredDateTimeList).toBeInstanceOf(Array);
  });

  test("isEligibleForLunch", () => {
    // given
    const lunchMember = generateMockClubMemberBy("lunch");
    const dinnerMember = generateMockClubMemberBy("dinner");
    const lunchDinnerMember = generateMockClubMemberBy("lunch-dinner");

    // then
    expect(lunchMember.isEligibleForLunch()).toBe(true);
    expect(dinnerMember.isEligibleForLunch()).toBe(false);
    expect(lunchDinnerMember.isEligibleForLunch()).toBe(true);
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
    generateKeywords(),
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

const generateKeywords = (): string => {
  const selectedKeywords = faker.helpers.arrayElements(keywords, {
    min: 0,
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
