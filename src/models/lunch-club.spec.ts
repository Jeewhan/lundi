import { beforeEach, describe, expect, test, vi } from "vitest";

import { keywords } from "../constants";
import { generateMockLunchClubMember } from "../utils/mock";
import LunchClub from "./lunch-club";

// TODO: mock -> fixture
// TODO: fixture는 랜덤성이 없어야 한다. 상대적으로 비교해선 안 된다. 그러면 동어반복이 되어버린다.
// TODO: 테스트를 할 때는 구체적인 값이 들어가야지, 수식이나 랜덤이 들어가선 안 된다. 명확하게 기입한 값이 들어가야 한다.
// TODO: fixture를 어떻게 구성하느냐가 중요하다. edge case에 대한 설계도 내포되는 것.

describe("LunchClub", () => {
  test("mock", () => {
    expect(true).toBe(true);
  });
  //   let lunchClub: LunchClub;
  //   beforeEach(() => {
  //     const messenger = {
  //       post: vi.fn(),
  //       direct: vi.fn(),
  //       createBlocks: vi.fn(),
  //     };
  //     const sheets = {
  //       read: vi.fn(),
  //       write: vi.fn(),
  //     };
  //     lunchClub = new LunchClub(messenger, sheets);
  //   });
  //   describe("score", () => {
  //     test("1 on 1 매칭 성공: 키워드 일치", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       const b = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true; // TODO: 이렇게 해줄 것이라면 random generate를 하는 것의 가치가 없다.
  //       b.hasAppliedForLunch = true;
  //       a.lunchClubKeywords = keywords[0]; // TODO: 이 테스트 케이스를 보면서 string으로 명확하게 알고 이런 시나리오에선 어떻게 될 것이다를 알 수 있어야 한다. actual scenario가 맞을지 아닐지가 판단되어야 한다.
  //       b.lunchClubKeywords = [keywords[0], keywords[1]].join(","); // TODO: 절대로 indirect하게 해선 안 된다. 틀렸는지 맞았는지 알 수가 없다.
  //       // then
  //       expect(lunchClub.score(a, b)).toBeGreaterThanOrEqual(1);
  //     });
  //     test("1 on 1 매칭 실패: 키워드 불일치", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       const b = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true;
  //       b.hasAppliedForLunch = true;
  //       a.lunchClubKeywords = keywords[0];
  //       b.lunchClubKeywords = keywords[1];
  //       // then
  //       expect(lunchClub.score(a, b)).toEqual(0);
  //     });
  //     test("1 on 1 매칭 실패: 같은 그룹", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       const b = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true;
  //       b.hasAppliedForLunch = true;
  //       a.lunchClubKeywords = keywords[0];
  //       b.lunchClubKeywords = keywords[1];
  //       a.groupMembers = b.name;
  //       b.groupMembers = a.name;
  //       // then
  //       expect(lunchClub.score(a, b)).toEqual(0);
  //     });
  //     test("1 on 1 매칭 실패: 한 명이 다른 한 명을 제외", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       const b = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true;
  //       b.hasAppliedForLunch = true;
  //       a.lunchClubKeywords = keywords[0];
  //       b.lunchClubKeywords = keywords[1];
  //       a.excludedMembers = b.name;
  //       // then
  //       expect(lunchClub.score(a, b)).toEqual(0);
  //     });
  //     test("1 on 1 매칭 실패: 한 명이 신청하지 않은 경우", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       const b = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true;
  //       b.hasAppliedForLunch = false;
  //       // then
  //       expect(lunchClub.score(a, b)).toEqual(0);
  //     });
  //   });
  //   describe("pair", () => {
  //     test("혼자서 신청", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true;
  //       a.lunchClubKeywords = keywords[0];
  //       // then
  //       expect(lunchClub.pair([a])).toEqual([]);
  //     });
  //     test("매칭 실패", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       const b = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true;
  //       b.hasAppliedForLunch = true;
  //       a.lunchClubKeywords = keywords[0];
  //       b.lunchClubKeywords = keywords[1];
  //       // then
  //       expect(lunchClub.pair([a, b])).toEqual([]);
  //     });
  //     test("매칭 성공", () => {
  //       // given
  //       const a = generateMockLunchClubMember();
  //       const b = generateMockLunchClubMember();
  //       const c = generateMockLunchClubMember();
  //       const d = generateMockLunchClubMember();
  //       // when
  //       a.hasAppliedForLunch = true;
  //       b.hasAppliedForLunch = true;
  //       c.hasAppliedForLunch = true;
  //       d.hasAppliedForLunch = true;
  //       a.lunchClubKeywords = keywords[0];
  //       b.lunchClubKeywords = [keywords[0], keywords[1]].join(",");
  //       c.lunchClubKeywords = [keywords[2], keywords[3], keywords[4]].join(",");
  //       d.lunchClubKeywords = [keywords[3], keywords[4], keywords[5]].join(",");
  //       // then
  //       expect(lunchClub.pair([a, b, c, d])).toEqual([
  //         [c, d],
  //         [a, b],
  //       ]);
  //     });
  //   });
});
