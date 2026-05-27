export type Branch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

export type XiaoLiuRenKey =
  | "da-an"
  | "liu-lian"
  | "su-xi"
  | "chi-kou"
  | "xiao-ji"
  | "kong-wang";

export type CompatibilityKind =
  | "same"
  | "liu-he"
  | "san-he"
  | "liu-chong"
  | "liu-hai"
  | "mixed";

export type TraditionalProfile = {
  solarDate: string;
  birthTime: string;
  usedEstimatedTime: boolean;
  lunarMonth: number;
  lunarDay: number;
  zodiacBranch: Branch;
  shiChenBranch: Branch;
  shiChenRange: string;
  xiaoLiuRenKey: XiaoLiuRenKey;
  mingGongBranch: Branch;
};

export type CompatibilityReading = {
  kind: CompatibilityKind;
  score: number;
};

const CHINA_TIME_ZONE = "Asia/Shanghai";

const EARTHLY_BRANCHES: Branch[] = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

const SHI_CHEN = [
  { branch: "子", range: "23:00-00:59" },
  { branch: "丑", range: "01:00-02:59" },
  { branch: "寅", range: "03:00-04:59" },
  { branch: "卯", range: "05:00-06:59" },
  { branch: "辰", range: "07:00-08:59" },
  { branch: "巳", range: "09:00-10:59" },
  { branch: "午", range: "11:00-12:59" },
  { branch: "未", range: "13:00-14:59" },
  { branch: "申", range: "15:00-16:59" },
  { branch: "酉", range: "17:00-18:59" },
  { branch: "戌", range: "19:00-20:59" },
  { branch: "亥", range: "21:00-22:59" },
] as const satisfies ReadonlyArray<{ branch: Branch; range: string }>;

const LIU_HE_PAIRS = new Map<Branch, Branch>([
  ["子", "丑"],
  ["丑", "子"],
  ["寅", "亥"],
  ["亥", "寅"],
  ["卯", "戌"],
  ["戌", "卯"],
  ["辰", "酉"],
  ["酉", "辰"],
  ["巳", "申"],
  ["申", "巳"],
  ["午", "未"],
  ["未", "午"],
]);

const LIU_CHONG_PAIRS = new Map<Branch, Branch>([
  ["子", "午"],
  ["午", "子"],
  ["丑", "未"],
  ["未", "丑"],
  ["寅", "申"],
  ["申", "寅"],
  ["卯", "酉"],
  ["酉", "卯"],
  ["辰", "戌"],
  ["戌", "辰"],
  ["巳", "亥"],
  ["亥", "巳"],
]);

const LIU_HAI_PAIRS = new Map<Branch, Branch>([
  ["子", "未"],
  ["未", "子"],
  ["丑", "午"],
  ["午", "丑"],
  ["寅", "巳"],
  ["巳", "寅"],
  ["卯", "辰"],
  ["辰", "卯"],
  ["申", "亥"],
  ["亥", "申"],
  ["酉", "戌"],
  ["戌", "酉"],
]);

const SAN_HE_GROUPS: Branch[][] = [
  ["申", "子", "辰"],
  ["亥", "卯", "未"],
  ["寅", "午", "戌"],
  ["巳", "酉", "丑"],
];

export function buildTraditionalProfile(
  birthDate: string,
  birthTime?: string,
): TraditionalProfile {
  const normalizedTime =
    birthTime && /^\d{2}:\d{2}$/.test(birthTime) ? birthTime : "12:00";
  const usedEstimatedTime = !birthTime || !/^\d{2}:\d{2}$/.test(birthTime);
  const wallClockDate = new Date(`${birthDate}T${normalizedTime}:00+08:00`);
  const lunarParts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    timeZone: CHINA_TIME_ZONE,
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(wallClockDate);
  const yearText = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    timeZone: CHINA_TIME_ZONE,
    year: "numeric",
  }).format(wallClockDate);
  const lunarMonth = Number(findPartValue(lunarParts, "month"));
  const lunarDay = Number(findPartValue(lunarParts, "day"));
  const zodiacBranch = parseYearBranch(yearText);
  const shiChen = resolveShiChen(normalizedTime);
  const xiaoLiuRenIndex =
    ((lunarMonth - 1) + (lunarDay - 1) + (shiChen.index - 1)) % 6;
  const xiaoLiuRenKeys: XiaoLiuRenKey[] = [
    "da-an",
    "liu-lian",
    "su-xi",
    "chi-kou",
    "xiao-ji",
    "kong-wang",
  ];
  const mingGongBranch = resolveMingGongBranch(lunarMonth, shiChen.index);

  return {
    solarDate: birthDate,
    birthTime: normalizedTime,
    usedEstimatedTime,
    lunarMonth,
    lunarDay,
    zodiacBranch,
    shiChenBranch: shiChen.branch,
    shiChenRange: shiChen.range,
    xiaoLiuRenKey: xiaoLiuRenKeys[xiaoLiuRenIndex] ?? "da-an",
    mingGongBranch,
  };
}

export function buildCompatibilityReading(
  person: TraditionalProfile,
  counterpart: TraditionalProfile,
): CompatibilityReading {
  const a = person.zodiacBranch;
  const b = counterpart.zodiacBranch;

  if (a === b) {
    return { kind: "same", score: 78 };
  }

  if (LIU_HE_PAIRS.get(a) === b) {
    return { kind: "liu-he", score: 92 };
  }

  if (SAN_HE_GROUPS.some((group) => group.includes(a) && group.includes(b))) {
    return { kind: "san-he", score: 86 };
  }

  if (LIU_CHONG_PAIRS.get(a) === b) {
    return { kind: "liu-chong", score: 42 };
  }

  if (LIU_HAI_PAIRS.get(a) === b) {
    return { kind: "liu-hai", score: 55 };
  }

  return { kind: "mixed", score: 68 };
}

function findPartValue(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function parseYearBranch(yearText: string): Branch {
  const match = yearText.match(
    /[甲乙丙丁戊己庚辛壬癸]([子丑寅卯辰巳午未申酉戌亥])年?/,
  );
  const branch = match?.[1] as Branch | undefined;

  return branch && EARTHLY_BRANCHES.includes(branch) ? branch : "子";
}

function resolveShiChen(time: string) {
  const [hoursText, minutesText] = time.split(":");
  const totalMinutes = Number(hoursText) * 60 + Number(minutesText);

  if (totalMinutes >= 23 * 60 || totalMinutes < 60) {
    return { ...SHI_CHEN[0], index: 1 };
  }

  const normalizedHours = Math.floor(totalMinutes / 60);
  const index = Math.floor((normalizedHours + 1) / 2) + 1;
  const shiChen = SHI_CHEN[index - 1] ?? SHI_CHEN[0];

  return { ...shiChen, index };
}

function resolveMingGongBranch(lunarMonth: number, shiChenIndex: number): Branch {
  const monthAnchor =
    ((0 - (lunarMonth - 1)) % EARTHLY_BRANCHES.length +
      EARTHLY_BRANCHES.length) %
    EARTHLY_BRANCHES.length;
  const palaceIndex = (monthAnchor + (shiChenIndex - 1)) % EARTHLY_BRANCHES.length;

  return EARTHLY_BRANCHES[palaceIndex] ?? "子";
}
