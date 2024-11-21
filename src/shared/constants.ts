export const GATHER_LUNCH_CLUB = "gather-lunch-club";
export const GATHER_DINNER_CLUB = "gather-dinner-club";

export const LUNCH_CLUB_JOIN_ACTION = "lunch-club-join-action";
export const DINNER_CLUB_JOIN_ACTION = "dinner-club-join-action";
export const LUNCH_DINNER_CLUB_JOIN_ACTION = "lunch-dinner-club-join-action";
export const LUNCH_DINNER_CLUB_CANCEL_ACTION =
  "lunch-dinner-club-cancel-action";
export const NOT_EXIST_JOIN = "not-exist-join";
export const READY_FOR_JOIN_CLUB_CALLBACK_ID = "ready-for-join-club";
export const NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID = "not-ready-for-join-club";

export const 일시 = "일시";
export const 아이디 = "아이디";
export const 연락처 = "연락처";
export const 만나지_않아도_될_멤버들 = "만나지_않아도_될_멤버들";
export const 보증금_동의 = "보증금_동의";
export const 매칭_불확실성_동의 = "매칭_불확실성_동의";
export const 제한된_지원_동의 = "제한된_지원_동의";
export const 개인정보_동의 = "개인정보_동의";
export const 클럽선택 = "클럽선택";
export const 런치클럽_관심사 = "런치클럽_관심사";
export const 디너클럽_일시 = "디너클럽_일시";
export const 디너클럽_장소 = "디너클럽_장소";
export const 분류 = "분류";

export const 성함 = "성함";
export const 자기소개 = "자기소개";

export const 링크 = "링크";
export const 텍스트 = "텍스트";

export const READY_FOR_JOIN_CLUB_CALLBACK_ID = "ready-for-join-club";
export const NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID = "not-ready-for-join-club";

export const CLUB_TYPES = {
  lunch: "lunch",
  dinner: "dinner",
  "lunch-dinner": "lunch-dinner",
} as const;
export type ClubType = (typeof CLUB_TYPES)[keyof typeof CLUB_TYPES];

export const regions = [
  "강남/서초",
  "을지로",
  "용산",
  "합정/홍대",
  "성수",
] as const;

export const keywords = [
  "IT/AI",
  "창업/사이드프로젝트",
  "커리어",
  "취미/일상/콘텐츠",
  "해외/여행",
] as const;

export const dinnerPreferredDateTimes = [
  "20241206 19:00",
  "20241208 18:00",
  "20241213 19:00",
  "20241214 18:00",
  "20241215 18:00",
];

export const groups = [
  "회고_off_토1시_몰입",
  "회고_off_토1시_소통",
  "회고_off_토1시_공감",
  "회고_off_토1시_웃음",
  "회고_off_토1시_연결",
  "회고_off_토1시_관점",
  "회고_off_토1시_중심",
  "회고_off_토1시_산책",
  "회고_off_토6시_마음",
  "회고_off_토6시_행운",
  "회고_off_토6시_하루",
  "회고_off_토6시_안녕",
  "회고_off_토6시_오늘",
  "회고_off_토6시_기대",
  "회고_off_토6시_열정",
  "회고_off_토6시_변화",
  "회고_off_토6시_활기",
  "회고_off_토6시_선물",
  "회고_off_토6시_도약",
  "회고_off_토6시_여유",
  "회고_off_토6시_환상",
  "회고_off_토6시_현재",
  "회고_off_토6시_내일",
  "회고_off_토6시_나눔",
  "회고_off_토6시_다짐",
  "회고_off_일1시_용기",
  "회고_off_일1시_낭만",
  "회고_off_일1시_흐름",
  "회고_off_일1시_성실",
  "회고_off_일1시_긍정",
  "회고_off_일1시_본질",
  "회고_off_일1시_친구",
  "회고_off_일1시_기억",
  "회고_off_일1시_의미",
  "회고_off_일1시_관심",
  "회고_off_일6시_미래",
  "회고_off_일6시_사유",
  "회고_off_일6시_명랑",
  "회고_off_일6시_상상",
  "회고_off_일6시_조화",
  "회고_off_일6시_균형",
  "회고_off_일6시_완성",
  "회고_off_일6시_이해",
  "회고_테마_원씽회고",
  "회고_테마_아티스트웨이",
  "회고_테마_사랑회고",
  "회고_테마_목표달성",
  "회고_테마_디톡스회고",
  "회고_테마_위헬플",
  "회고_테마_복리",
  "회고_off_리유니언_자유",
  "회고_on_토10시_경험",
  "회고_on_토10시_존중",
  "회고_on_토10시_방향",
  "회고_on_토10시_시작",
  "회고_so_배려",
  "회고_so_선명",
  "회고_so_걸음",
  "회고_so_화합",
  "회고_so_희망",
  "회고_so_지혜",
  "회고_so_공유",
  "회고_prv_이지영",
  "회고_prv_김민석A",
  "회고_prv_김유진B",
  "회고_prv_서영현",
  "회고_prv_최유진",
  "회고_prv_최지현",
  "회고_prv_이민주",
  "회고_prv_김동석",
  "회고_prv_남우석",
  "회고_prv_이가혁",
  "회고_prv_류주연",
  "회고_prv_심해인",
  "회고_prv_김병현",
  "회고_prv_정수연",
  "회고_prv_김나래A",
  "회고_prv_백재연",
  "회고_prv_김은영",
  "회고_prv_김정연",
  "회고_prv_김도현",
  "회고_prv_이종민",
  "회고_prv_김강민",
  "회고_refresh",
] as const;
