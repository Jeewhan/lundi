import { beforeEach, describe, expect, test, vi } from "vitest";

import { keywords } from "../constants";
import { generateMockClubMemberBy } from "../utils/mock";
import LunchClub from "./lunch-club";
import { Messenger } from "../services/messenger";

describe("LunchClub", () => {
  let messenger: Messenger;
  let lunchClub: LunchClub;

  beforeEach(() => {
    messenger = {
      post: vi.fn(),
      direct: vi.fn(),
      createBlocks: vi.fn(),
    };
    lunchClub = new LunchClub(messenger);
  });

  describe("score", () => {
    test("1 on 1 매칭 성공: 키워드 일치", () => {
      // given
      const a = generateMockClubMemberBy("lunch");
      const b = generateMockClubMemberBy("lunch");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = true;
      a.lunchClubKeywords = keywords[0];
      b.lunchClubKeywords = [keywords[0], keywords[1]].join(", ");

      // then
      expect(lunchClub.score(a, b)).toBeGreaterThanOrEqual(1);
    });

    test("1 on 1 매칭 실패: 키워드 불일치", () => {
      // given
      const a = generateMockClubMemberBy("lunch");
      const b = generateMockClubMemberBy("lunch");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = true;
      a.lunchClubKeywords = keywords[0];
      b.lunchClubKeywords = keywords[1];

      // then
      expect(lunchClub.score(a, b)).toEqual(0);
    });

    test("1 on 1 매칭 실패: 같은 그룹", () => {
      // given
      const a = generateMockClubMemberBy("lunch");
      const b = generateMockClubMemberBy("lunch");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = true;
      a.lunchClubKeywords = keywords[0];
      b.lunchClubKeywords = keywords[1];
      a.groupMembers = b.name;
      b.groupMembers = a.name;

      // then
      expect(lunchClub.score(a, b)).toEqual(0);
    });

    test("1 on 1 매칭 실패: 한 명이 다른 한 명을 제외", () => {
      // given
      const a = generateMockClubMemberBy("lunch");
      const b = generateMockClubMemberBy("lunch");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = true;
      a.lunchClubKeywords = keywords[0];
      b.lunchClubKeywords = keywords[1];
      a.excludedMembers = b.name;

      // then
      expect(lunchClub.score(a, b)).toEqual(0);
    });

    test("1 on 1 매칭 실패: 한 명이 신청하지 않은 경우", () => {
      // given
      const a = generateMockClubMemberBy("lunch");
      const b = generateMockClubMemberBy("lunch");

      // when
      a.hasAppliedForLunch = true;
      b.hasAppliedForLunch = false;

      // then
      expect(lunchClub.score(a, b)).toEqual(0);
    });
  });
});
