import { Faker, ko } from "@faker-js/faker";
import {
  CLUB_TYPES,
  ClubType,
  dinnerPreferredDateTimes,
  groups,
  keywords,
  regions,
} from "../constants";
import ClubMember, { LunchClubMember } from "../models/club-member";

export const faker = new Faker({
  locale: [ko],
});

export const generateMockLunchClubMember = () => {
  return new LunchClubMember(
    faker.person.fullName(),
    `U${faker.string.alphanumeric({ length: 10, casing: "upper" })}`,
    faker.helpers.arrayElement(groups),
    generatePhoneNumber(),
    generateIntroduce(),
    CLUB_TYPES.lunch,
    generateGroupMembers(),
    generateExcludedMembers(),
    generateLogs(),
    generateLunchClubKeywords(CLUB_TYPES.lunch),
    generateDinnerClubLocations(CLUB_TYPES.lunch),
    generateHasAppliedForLunch(CLUB_TYPES.lunch),
    generateDinnerPreferredDateTime(CLUB_TYPES.lunch),
  );
};

export const generateMockClubMemberBy = (clubType: ClubType): ClubMember => {
  return new ClubMember(
    faker.person.fullName(),
    `U${faker.string.alphanumeric({ length: 10, casing: "upper" })}`,
    faker.helpers.arrayElement(groups),
    generatePhoneNumber(),
    generateIntroduce(),
    clubType,
    generateGroupMembers(),
    generateExcludedMembers(),
    generateLogs(),
    generateLunchClubKeywords(clubType),
    generateDinnerClubLocations(clubType),
    generateHasAppliedForLunch(clubType),
    generateDinnerPreferredDateTime(clubType),
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
    faker.person.fullName(),
  ).join(", ");
};

const generateExcludedMembers = (): string => {
  return Array.from({ length: faker.number.int({ min: 0, max: 32 }) }, () =>
    faker.person.fullName(),
  ).join(", ");
};

const generateLogs = (): string => {
  return Array.from({ length: faker.number.int({ min: 0, max: 32 }) }, () =>
    faker.person.fullName(),
  ).join(", ");
};

const generateLunchClubKeywords = (clubType: ClubType): string => {
  if (clubType === CLUB_TYPES.dinner) {
    return "";
  }

  const selectedKeywords = faker.helpers.arrayElements(keywords, {
    min: 1,
    max: keywords.length,
  });

  return selectedKeywords.join(",");
};

const generateDinnerClubLocations = (clubType: ClubType): string => {
  if (clubType === CLUB_TYPES.lunch) {
    return "";
  }

  return faker.helpers
    .arrayElements(regions, {
      min: 1,
      max: regions.length,
    })
    .join(", ");
};

const generateHasAppliedForLunch = (clubType: ClubType): boolean => {
  if (clubType === CLUB_TYPES.dinner) {
    return false;
  }

  return faker.number.int({ min: 0, max: 100 }) > 30;
};

const generateDinnerPreferredDateTime = (clubType: ClubType): string => {
  if (clubType === CLUB_TYPES.lunch) {
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
