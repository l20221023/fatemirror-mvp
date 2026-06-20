# 《改命记实录》术与道总结（FateMirror 开发版）

> 用途：作为 FateMirror 项目的产品规则、领域模型和 Codex 开发依据  
> 内容来源：《改命记实录》及前期整理稿  
> 文档性质：传统文化娱乐与自我反思产品设计，不构成科学预测、医疗诊断、心理诊断、法律或投资建议

---

## 0. 文档目标

本文件不是普通读书笔记，而是经过筛选和产品化后的开发规格。

所有内容被拆分为四类：

1. **可计算模块**：规则明确、输入确定、结果可复现，可直接编程实现；
2. **内容引导模块**：不负责预测，只提供反思问题、行动建议和传统文化解释；
3. **暂缓模块**：书中仅有局部规则，暂不足以形成完整、可靠的计算引擎；
4. **排除模块**：涉及疾病判断、偏方、超自然能力或高风险断言，不进入产品功能。

FateMirror 的核心定位：

> 以传统象数规则提供一种观察自己、关系和当下状态的视角，帮助用户看懂局势并重新获得选择权，而不是宣称决定命运。

---

# 一、产品总原则（道）

## 1. 阴阳是一种反思框架，不是科学诊断

书中以阴阳解释静与动、冷与暖、思考与行动、收缩与生发。

FateMirror 中可将其转化为用户容易理解的反思维度：

| 偏阴状态 | 偏阳状态 |
|---|---|
| 停滞、退缩、反复思虑 | 行动、表达、推进 |
| 环境昏暗、杂乱、压抑 | 环境明亮、整洁、流动 |
| 注意力困在想象和担忧中 | 注意力回到现实和可执行事项 |
| 被动等待结果 | 主动做出小范围选择 |

产品不得将“阴”简单等同于坏，也不得将“阳”简单等同于好。输出应强调平衡和适量。

---

## 2. 预测结果必须保留不确定性

书中的“预测与化解”可以转化为以下产品原则：

- 计算结果只反映某套传统规则在当前输入下的输出；
- 用户行为、关系质量、现实条件和偶然事件都可能改变后续发展；
- 不输出“必然发生”“注定失败”“一定相克”等绝对结论；
- 输出必须包含现实行动建议，而不是只给吉凶标签；
- 同一问题不鼓励用户为了获得满意答案而反复重算。

推荐固定提示：

> 本结果来自传统象数规则，可用于娱乐和自我反思，不代表客观事实，也不替代现实判断。

---

## 3. 用户主动选择，而不是制造依赖

“法不轻施，道不轻传”在产品中不解释为故意制造神秘感，而转化为：

- 用户主动进入某个测算模块后才展示相关内容；
- 不在用户未请求时推送灾祸、疾病、分手或死亡等恐吓信息；
- 不以“必须付费化解”制造焦虑；
- 免费结果应完整表达基础结论，付费内容只能增加深度、记录、个性化解释或组合分析；
- 任何付费功能不得承诺改运、治病、复合或致富。

---

## 4. 注意力应回到现实行动

FateMirror 的每个 Reading 最后应给出一个现实、低风险、可执行的行动建议，例如：

- 暂缓在情绪激动时做决定；
- 将问题写成三个可验证事实；
- 主动沟通一次，而不是继续猜测；
- 整理一个经常使用的空间；
- 完成一个十分钟内可开始的小任务。

不得用“继续测算”作为默认行动建议。

---

## 5. 用户始终拥有选择权

推荐核心文案：

> 结果描述的是一种传统视角，不是命令。你仍然可以结合事实、价值观和现实条件作出自己的决定。

---

# 二、FateMirror 功能分层

## 2.1 P1：可直接开发的确定性模块

| 模块 | 内部标识 | 输入 | 输出 | 优先级 |
|---|---|---|---|---|
| 小六壬 | `xiaoliuRen` | 起念时间、时区、问题文本（可选） | 六神、解释、行动提示 | P1 |
| 九宫命格/三元命卦 | `mingGua` | 公历出生年份、性别 | 命宫、卦象、组别、方向 | P1 |
| 命宫关系匹配 | `mingGuaMatch` | 双方命宫或出生信息 | 正配/同组/跨组及解释 | P1 |
| 婚配方位 | `marriageDirection` | 公历出生日期、出生地说明（文本） | 地支、方向、对向轴 | P1 |

这些模块必须使用确定性代码计算，不能让大语言模型自行心算。

---

## 2.2 P2：内容与自我反思模块

| 模块 | 内部标识 | 形式 | 优先级 |
|---|---|---|---|
| 当前状态自评 | `stateCheckIn` | 简短问卷，不宣称“测运势” | P2 |
| 今日行动建议 | `dailyGuidance` | 根据主题抽取低风险行动 | P2 |
| 阴阳反思卡 | `yinYangReflection` | 反思问题和行动提示 | P2 |
| 居住环境自查 | `homeReflection` | 用户自主勾选的环境清单 | P2 |
| 智慧内容库 | `wisdomLibrary` | 文章、卡片、结果页说明 | P2 |

---

## 2.3 P3：暂缓开发模块

| 模块 | 原因 | 当前处理 |
|---|---|---|
| 梅花易数 | 起卦公式只是第一步，缺少完整体用、互卦、变卦和断卦规则 | 显示“研究中”，不提供假结果 |
| 称骨算命 | 缺少年、月、日、时完整重量表及称骨歌数据 | 保留占位页 |
| 五行人格/体质 | 当前资料主要集中在木型，无法形成完整五类测试 | 等规则完整后开发 |
| 面相识别 | 自动推断人格、福祸或健康准确性不足，存在偏见风险 | 不开放自动识别 |
| 声相/行相识别 | 缺少客观、可验证的分类规则 | 不开放自动识别 |
| 图片风水识别 | 需要明确图像规则和人工复核，误判风险高 | 可先做用户自查清单 |

---

## 2.4 不进入产品的内容

下列内容仅作为原书研究材料保存，不进入用户测算、推荐或健康功能：

- 根据手温、面色、眼神判断运势或疾病；
- 将低体温描述为癌症前兆；
- “虚病、业力病、因果病”等疾病分类；
- 炭烤大蒜等偏方；
- 八卦象数治疗疾病；
- 外气、内气外放、开天眼、能量注入；
- 以风水直接解释具体疾病；
- 根据面部纹路判断“心地险恶”“家暴倾向”“担不住福气”；
- 任何关于死亡、灾祸、疾病、怀孕、投资收益的确定性预测。

---

# 三、核心计算模块一：小六壬

## 3.1 功能定位

小六壬根据用户“第一次自然起念”的时间，按照农历月、农历日和十二时辰顺序计算六神结果。

产品定位：传统文化娱乐和当下决策反思，不是事实预测器。

---

## 3.2 输入模型

```ts
type XiaoliuRenInput = {
  occurredAt: string;        // ISO 8601 时间
  timezone: string;          // IANA 时区，例如 Asia/Shanghai
  question?: string;         // 用户当时想到的问题，可选
  lunarOverride?: {          // 仅用于测试或转换失败时的高级输入
    month: number;           // 1-12
    day: number;             // 1-30
    isLeapMonth?: boolean;
  };
};
```

校验规则：

- `occurredAt` 必须是有效时间；
- `timezone` 必须明确，不能默认使用服务器时区；
- 问题文本不参与数值计算；
- 同一问题可记录第一次结果，界面不鼓励短时间连续重算。

---

## 3.3 十二时辰序号

| 时辰 | 本地时间范围 | 序号 |
|---|---:|---:|
| 子 | 23:00-00:59 | 1 |
| 丑 | 01:00-02:59 | 2 |
| 寅 | 03:00-04:59 | 3 |
| 卯 | 05:00-06:59 | 4 |
| 辰 | 07:00-08:59 | 5 |
| 巳 | 09:00-10:59 | 6 |
| 午 | 11:00-12:59 | 7 |
| 未 | 13:00-14:59 | 8 |
| 申 | 15:00-16:59 | 9 |
| 酉 | 17:00-18:59 | 10 |
| 戌 | 19:00-20:59 | 11 |
| 亥 | 21:00-22:59 | 12 |

MVP 约定：23:00-23:59 仍使用用户当地公历日期转换出的农历日，只把时辰记为子时；如后续要支持“晚子时换日”，必须作为独立计算模式，不得悄悄改变结果。

---

## 3.4 六神顺序

```ts
const SIX_GODS = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"] as const;
```

| 六神 | 中性关键词 | 关系提示 | 行动建议 |
|---|---|---|---|
| 大安 | 稳定、静守、秩序 | 关系趋于稳定，暂不必强推 | 维持节奏，确认事实 |
| 留连 | 拖延、反复、未决 | 容易纠缠或迟迟没有答复 | 设定期限，减少无效等待 |
| 速喜 | 快速、消息、推进 | 适合及时表达或确认 | 把握时机，但保留边界 |
| 赤口 | 争执、误会、冲动 | 容易因表达方式发生冲突 | 暂缓争辩，先降温再沟通 |
| 小吉 | 回归、协作、小进展 | 关系有缓和或重新连接机会 | 采取小步行动，不夸大预期 |
| 空亡 | 落空、不确定、信息不足 | 当前可能难以形成明确结果 | 补充信息，避免孤注一掷 |

结果名称来自传统规则；解释文案必须避免“必然吉凶”。

---

## 3.5 计算公式

传统数法是月、日、时依次从当前落点开始按一数起。转换成零基数组索引：

```ts
resultIndex = mod(lunarMonth + lunarDay + hourIndex - 3, 6);
result = SIX_GODS[resultIndex];
```

其中：

```ts
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
```

不要使用含义不清的“从大安往后数 M 位”实现，否则容易产生一位偏差。

---

## 3.6 参考实现

```ts
function getHourIndex(hour: number): number {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error("INVALID_HOUR");
  }
  return Math.floor(((hour + 1) % 24) / 2) + 1;
}

function calculateXiaoliuRen(
  lunarMonth: number,
  lunarDay: number,
  localHour: number,
) {
  if (lunarMonth < 1 || lunarMonth > 12) throw new Error("INVALID_LUNAR_MONTH");
  if (lunarDay < 1 || lunarDay > 30) throw new Error("INVALID_LUNAR_DAY");

  const hourIndex = getHourIndex(localHour);
  const resultIndex = mod(lunarMonth + lunarDay + hourIndex - 3, 6);

  return {
    lunarMonth,
    lunarDay,
    hourIndex,
    resultIndex,
    result: SIX_GODS[resultIndex],
  };
}
```

注意：上面 `getHourIndex` 必须单元测试。也可直接使用明确区间表实现，减少边界错误。

推荐的明确实现：

```ts
function getHourIndex(hour: number): number {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error("INVALID_HOUR");
  }
  if (hour === 23 || hour === 0) return 1;
  return Math.floor((hour + 1) / 2) + 1;
}
```

---

## 3.7 验收测试

```ts
// 农历一月初一、子时：大安
expect(calculateXiaoliuRen(1, 1, 23).result).toBe("大安");

// 书中案例：农历四月十一、15:30 为申时：赤口
expect(calculateXiaoliuRen(4, 11, 15).result).toBe("赤口");

// 时辰边界
expect(getHourIndex(0)).toBe(1);
expect(getHourIndex(1)).toBe(2);
expect(getHourIndex(22)).toBe(12);
expect(getHourIndex(23)).toBe(1);
```

---

## 3.8 输出模型

```ts
type XiaoliuRenResult = {
  method: "xiaoliu-ren";
  input: {
    occurredAt: string;
    timezone: string;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    hourBranch: string;
    hourIndex: number;
  };
  calculation: {
    formula: string;
    resultIndex: number;
  };
  result: {
    name: string;
    keywords: string[];
    summary: string;
    relationship: string;
    work: string;
    action: string;
  };
  disclaimer: string;
};
```

农历闰月在 MVP 中按同名月份数字计算，同时保留 `isLeapMonth` 供界面展示。

---

# 四、核心计算模块二：九宫命格 / 三元命卦

## 4.1 功能定位

根据用户公历出生年份和性别，计算命宫数字、后天八卦、人物象、东四命或西四命，以及对应方向组。

MVP 严格采用原书的简便公历年算法，不引入八字、属相或立春换年。

后续若增加立春分界，必须新增 `calculationMode`，不能覆盖现有结果。

---

## 4.2 输入模型

```ts
type Gender = "male" | "female";

type MingGuaInput = {
  birthYear: number;
  gender: Gender;
  calculationMode?: "gregorian-year-simple";
};
```

校验建议：

- 年份范围由所选农历/日期库支持范围决定；
- 不接受模糊年份；
- 性别字段只用于这一传统公式，界面需说明该算法原本按男女分式计算；
- 不据此推断现实中的性格、健康、职业或家庭地位。

---

## 4.3 年份基数

将年份各位数相加，再反复相加到 1-9：

```ts
function digitalRoot(value: number): number {
  if (!Number.isInteger(value) || value <= 0) throw new Error("INVALID_VALUE");
  return 1 + ((value - 1) % 9);
}
```

为了更直观，也可先求年份各位和，再求数字根：

```ts
function getYearBaseNumber(year: number): number {
  const sum = String(year)
    .split("")
    .reduce((acc, digit) => acc + Number(digit), 0);
  return digitalRoot(sum);
}
```

示例：

```text
1995 → 1+9+9+5=24 → 2+4=6
2018 → 2+0+1+8=11 → 1+1=2
```

---

## 4.4 男女公式

男性：

```text
11 - 基数
```

女性：

```text
4 + 基数
```

若结果大于 9，继续减 9；若结果为 5：

- 男性 5 → 坤 2；
- 女性 5 → 艮 8。

```ts
function normalizePalace(value: number): number {
  while (value > 9) value -= 9;
  while (value < 1) value += 9;
  return value;
}

function calculateMingGuaNumber(year: number, gender: Gender): number {
  const base = getYearBaseNumber(year);
  let palace = gender === "male" ? 11 - base : 4 + base;
  palace = normalizePalace(palace);

  if (palace === 5) return gender === "male" ? 2 : 8;
  return palace;
}
```

---

## 4.5 命宫映射

| 数字 | 卦象 | 人物象 | 组别 | 本宫方位 | 有利方向组 |
|---:|---|---|---|---|---|
| 1 | 坎 | 中男 | 东四命 | 北 | 北、东、东南、南 |
| 2 | 坤 | 母亲 | 西四命 | 西南 | 西南、西、西北、东北 |
| 3 | 震 | 长男 | 东四命 | 东 | 北、东、东南、南 |
| 4 | 巽 | 长女 | 东四命 | 东南 | 北、东、东南、南 |
| 6 | 乾 | 父亲 | 西四命 | 西北 | 西南、西、西北、东北 |
| 7 | 兑 | 少女 | 西四命 | 西 | 西南、西、西北、东北 |
| 8 | 艮 | 少男 | 西四命 | 东北 | 西南、西、西北、东北 |
| 9 | 离 | 中女 | 东四命 | 南 | 北、东、东南、南 |

“人物象”仅是八卦传统象意，不表示用户现实中的家庭身份或性别角色。

---

## 4.6 数据常量

```ts
const MING_GUA_MAP = {
  1: { trigram: "坎", roleSymbol: "中男", group: "east", direction: "北" },
  2: { trigram: "坤", roleSymbol: "母亲", group: "west", direction: "西南" },
  3: { trigram: "震", roleSymbol: "长男", group: "east", direction: "东" },
  4: { trigram: "巽", roleSymbol: "长女", group: "east", direction: "东南" },
  6: { trigram: "乾", roleSymbol: "父亲", group: "west", direction: "西北" },
  7: { trigram: "兑", roleSymbol: "少女", group: "west", direction: "西" },
  8: { trigram: "艮", roleSymbol: "少男", group: "west", direction: "东北" },
  9: { trigram: "离", roleSymbol: "中女", group: "east", direction: "南" },
} as const;

const EAST_DIRECTIONS = ["北", "东", "东南", "南"] as const;
const WEST_DIRECTIONS = ["西南", "西", "西北", "东北"] as const;
```

---

## 4.7 验收测试

```ts
expect(calculateMingGuaNumber(1995, "male")).toBe(2);   // 坤
expect(calculateMingGuaNumber(2018, "female")).toBe(6); // 乾
expect(calculateMingGuaNumber(1984, "male")).toBe(7);   // 兑
expect(calculateMingGuaNumber(1990, "female")).toBe(8); // 原始结果5，女寄艮8
```

建议增加 1984-1993 连续年份男女结果快照测试，检查九年循环。

---

## 4.8 输出模型

```ts
type MingGuaResult = {
  method: "ming-gua";
  calculationMode: "gregorian-year-simple";
  input: {
    birthYear: number;
    gender: Gender;
  };
  calculation: {
    baseNumber: number;
    rawPalace: number;
    usedFivePalaceRule: boolean;
  };
  result: {
    palaceNumber: 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9;
    trigram: string;
    roleSymbol: string;
    group: "east" | "west";
    groupLabel: "东四命" | "西四命";
    direction: string;
    favorableDirections: string[];
  };
  disclaimer: string;
};
```

---

# 五、核心计算模块三：命宫关系匹配

## 5.1 匹配层级

原书规则可整理为三层，不使用“凶婚”作为产品主标签：

### A. 传统正配

| 配对 | 象意 |
|---|---|
| 乾 6 + 坤 2 | 父母正配 |
| 震 3 + 巽 4 | 长男长女正配 |
| 坎 1 + 离 9 | 中男中女正配 |
| 艮 8 + 兑 7 | 少男少女正配 |

### B. 同组匹配

双方同属东四命，或同属西四命，但不是上面的传统正配。

产品表达：

> 从命宫分组看，双方方向偏好较接近；现实关系仍取决于沟通、边界、价值观和生活条件。

### C. 跨组匹配

一方东四命，一方西四命。

产品表达：

> 从传统分组看，双方的方向偏好不同，可能需要更多协商。该结果不代表关系一定不合。

---

## 5.2 计算实现

```ts
const BEST_MING_GUA_PAIRS = new Set(["2-6", "3-4", "1-9", "7-8"]);

function pairKey(a: number, b: number): string {
  return [a, b].sort((x, y) => x - y).join("-");
}

function calculateMingGuaMatch(a: MingGuaResult, b: MingGuaResult) {
  if (BEST_MING_GUA_PAIRS.has(pairKey(a.result.palaceNumber, b.result.palaceNumber))) {
    return {
      level: "traditional-best-pair",
      label: "传统正配",
      summary: "双方在传统命宫人物象中构成对应组合。",
    };
  }

  if (a.result.group === b.result.group) {
    return {
      level: "same-group",
      label: "同组匹配",
      summary: "双方同属东四命或西四命，传统上视为方向较接近。",
    };
  }

  return {
    level: "cross-group",
    label: "跨组匹配",
    summary: "双方分属东四命和西四命，传统上视为方向偏好存在差异。",
  };
}
```

---

## 5.3 结果页必须同时展示现实关系维度

命宫匹配结果下方固定增加四项现实自查：

1. 双方是否能直接表达需求；
2. 冲突发生后是否能修复；
3. 对金钱、家庭和未来规划是否基本一致；
4. 是否尊重彼此边界和自主选择。

这四项不得由命宫结果自动推断。

---

# 六、核心计算模块四：婚配方位

## 6.1 功能定位

根据用户农历出生月和出生日，从月支开始顺数，得到一个地支位置，并给出相对于出生地的方向轴。

该功能只表示传统上的“伴侣来源方向参考”，不能表述为“正缘一定来自该方向”。

---

## 6.2 输入模型

```ts
type MarriageDirectionInput = {
  birthDate: string;       // YYYY-MM-DD，公历
  timezone?: string;       // 出生地时区，只有日期时可选
  birthPlaceLabel?: string;// 仅用于结果文案，如“以洛阳为中心”
  lunarOverride?: {
    month: number;
    day: number;
    isLeapMonth?: boolean;
  };
};
```

---

## 6.3 农历月份对应地支

农历正月从寅开始：

| 农历月 | 地支 | 方向 |
|---:|---|---|
| 1 | 寅 | 东北 |
| 2 | 卯 | 东 |
| 3 | 辰 | 东南 |
| 4 | 巳 | 东南 |
| 5 | 午 | 南 |
| 6 | 未 | 西南 |
| 7 | 申 | 西南 |
| 8 | 酉 | 西 |
| 9 | 戌 | 西北 |
| 10 | 亥 | 西北 |
| 11 | 子 | 北 |
| 12 | 丑 | 东北 |

内部以十二地支零基索引表示：

```ts
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

const LUNAR_MONTH_TO_BRANCH_INDEX = {
  1: 2,  // 寅
  2: 3,  // 卯
  3: 4,  // 辰
  4: 5,  // 巳
  5: 6,  // 午
  6: 7,  // 未
  7: 8,  // 申
  8: 9,  // 酉
  9: 10, // 戌
  10: 11,// 亥
  11: 0, // 子
  12: 1, // 丑
} as const;
```

---

## 6.4 计算公式

“月上数日”：月支作为第一天，向后数 `日-1` 位。

```ts
targetBranchIndex = mod(monthBranchIndex + lunarDay - 1, 12);
```

示例：农历三月初三：

```text
三月 = 辰
初三 = 从辰向后两位
辰 → 巳 → 午
结果 = 午 = 南
方向轴 = 南—北
```

---

## 6.5 地支到方向与方向轴

```ts
const BRANCH_DIRECTION = {
  子: "北",
  丑: "东北",
  寅: "东北",
  卯: "东",
  辰: "东南",
  巳: "东南",
  午: "南",
  未: "西南",
  申: "西南",
  酉: "西",
  戌: "西北",
  亥: "西北",
} as const;

const DIRECTION_AXIS = {
  北: "南—北",
  南: "南—北",
  东: "东—西",
  西: "东—西",
  东北: "东北—西南",
  西南: "东北—西南",
  东南: "东南—西北",
  西北: "东南—西北",
} as const;
```

结果页同时展示“主方向”和“对向轴”。原书案例把午位解释为出生地南北轴线，而不是只限定正南一个点。

---

## 6.6 参考实现

```ts
function calculateMarriageDirection(lunarMonth: number, lunarDay: number) {
  if (lunarMonth < 1 || lunarMonth > 12) throw new Error("INVALID_LUNAR_MONTH");
  if (lunarDay < 1 || lunarDay > 30) throw new Error("INVALID_LUNAR_DAY");

  const monthBranchIndex = LUNAR_MONTH_TO_BRANCH_INDEX[lunarMonth as keyof typeof LUNAR_MONTH_TO_BRANCH_INDEX];
  const targetBranchIndex = mod(monthBranchIndex + lunarDay - 1, 12);
  const branch = BRANCHES[targetBranchIndex];
  const direction = BRANCH_DIRECTION[branch];
  const axis = DIRECTION_AXIS[direction];

  return {
    lunarMonth,
    lunarDay,
    monthBranch: BRANCHES[monthBranchIndex],
    targetBranchIndex,
    branch,
    direction,
    axis,
  };
}
```

---

## 6.7 验收测试

```ts
// 农历三月初三：辰起，数到午，南—北轴
expect(calculateMarriageDirection(3, 3)).toMatchObject({
  branch: "午",
  direction: "南",
  axis: "南—北",
});

// 农历正月初一：寅，东北—西南轴
expect(calculateMarriageDirection(1, 1)).toMatchObject({
  branch: "寅",
  direction: "东北",
  axis: "东北—西南",
});
```

---

# 七、农历转换公共服务

小六壬和婚配方位都依赖公历转农历，应使用同一个服务，禁止各模块分别实现。

```ts
type LunarDateResult = {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  monthLabel: string;
  dayLabel: string;
};

interface LunarCalendarService {
  fromGregorian(date: string, timezone?: string): LunarDateResult;
}
```

实现要求：

- 使用维护状态良好、测试覆盖明确的农历库；
- 固定库版本并记录支持年份；
- 为春节前后、闰月、月末和跨时区日期编写测试；
- 返回原始转换结果，便于用户检查；
- 转换失败时不得猜测，应提示用户手动输入农历日期。

---

# 八、P2 内容模块

## 8.1 当前状态自评：替代“一秒测运势”

原书通过握手感受手温判断运势。该方法受天气、运动、循环状态、情绪和个体差异影响，不适合作为自动预测功能。

FateMirror 将其改造为用户自评，不采集他人身体特征，也不判断疾病。

### 建议问题

每项 0-4 分：

1. 最近一周睡眠后是否感到恢复；
2. 白天是否有稳定精力完成必要事项；
3. 遇到问题时是否能采取一个具体行动；
4. 是否长期陷入反复猜测和担忧；
5. 居住或工作空间是否整洁、明亮、通风；
6. 最近是否能与重要的人进行清晰沟通。

### 输出维度

- `energy`：精力与恢复；
- `action`：行动倾向；
- `attention`：注意力是否困在反刍中；
- `environment`：环境舒适度；
- `connection`：现实沟通情况。

### 输出限制

- 不命名为医学量表；
- 不诊断焦虑症、抑郁症或其他疾病；
- 分数较低时只建议休息、记录事实、寻求可信任的人或专业帮助；
- 出现健康担忧时提示咨询合格医疗专业人员。

---

## 8.2 阴阳反思卡

内容数据结构：

```ts
type ReflectionCard = {
  id: string;
  theme: "attention" | "action" | "relationship" | "environment" | "choice";
  title: string;
  observation: string;
  question: string;
  action: string;
  riskLevel: "low";
};
```

示例：

```json
{
  "id": "attention-001",
  "theme": "attention",
  "title": "把注意力拉回事实",
  "observation": "当信息不足时，人容易用想象补全空白。",
  "question": "这件事里，哪些是已经发生的事实，哪些只是你的推测？",
  "action": "分别写下三个事实和三个猜测。",
  "riskLevel": "low"
}
```

---

## 8.3 今日行动建议

可采用规则选择，不必调用大模型：

```ts
if (result === "赤口") chooseFrom("communication-cooldown");
if (result === "留连") chooseFrom("deadline-and-boundary");
if (result === "空亡") chooseFrom("collect-more-information");
if (result === "速喜") chooseFrom("timely-small-action");
if (result === "大安") chooseFrom("maintain-stability");
if (result === "小吉") chooseFrom("reconnect-and-cooperate");
```

建议库中的行动必须满足：

- 不涉及医疗、药物、投资或法律判断；
- 十分钟内可以开始；
- 不要求购买“化解物”；
- 不鼓励监控、操控或测试他人；
- 不把关系问题简单归因于命理。

---

## 8.4 居住环境自查

把书中的“镜子、假花、空花瓶、留白”等内容改为一般环境体验清单：

- 是否存在夜间直射床铺或眼睛的强光；
- 是否有大面积反光导致眩光；
- 通道是否被杂物阻挡；
- 是否有容易倾倒、破碎或绊倒的物件；
- 是否存在长期不使用但积灰的装饰；
- 房间是否有基本通风、照明和收纳空间。

输出应使用现代、安全、可验证的语言：

> 减少眩光和杂物可能有助于提升空间舒适度与使用效率。

不要输出：

> 镜子会导致某种疾病；假花会招来小人；空花瓶会吸引负面能量。

---

## 8.5 可保留的低风险练习

### 注意力归位练习

来源于书中的“洗心养神功”，产品中改名为“感官注意练习”：

1. 在安全环境中缓慢行走或安静坐着；
2. 依次注意眼前物体的颜色、形状和材质；
3. 注意周围声音，不评价好坏；
4. 持续 3-10 分钟；
5. 结束后写下一个接下来要完成的小行动。

不得宣称治疗焦虑、抑郁、社交恐惧或其他疾病。

### 安全日光与户外活动提示

书中的“采日光功”只保留一般生活建议：

- 在天气和身体条件允许时进行适量户外活动；
- 避免正午长时间暴晒；
- 注意防晒、补水和高温风险；
- 有光敏感、皮肤病或其他健康问题时咨询医生。

不得使用“温补五脏、提升免疫力、补正气”等医疗功效文案。

---

# 九、P3 暂缓模块说明

## 9.1 梅花易数

原稿中的公式需要纠正：上卦和下卦是除以 8，不是除以 6。

书中时间起卦基础公式：

```text
上卦 = (年 + 月 + 日) ÷ 8 取余，余 0 按 8
下卦 = (年 + 月 + 日 + 时) ÷ 8 取余，余 0 按 8
动爻 = (年 + 月 + 日 + 时) ÷ 6 取余，余 0 按 6
```

但目前不能直接开发正式 Reading，原因包括：

- “年”和“时”的取值体系需要统一；
- 缺少先天八卦数字到卦象的完整定义；
- 缺少体卦、用卦、互卦、变卦规则；
- 缺少五行生克、旺衰和断语生成规则；
- 书中强调外应和心念，难以转成稳定算法。

当前界面只显示：

> 梅花易数模块正在整理规则，暂不开放计算。FateMirror 不会在规则不完整时生成看似确定的结果。

---

## 9.2 称骨算命

已知基础：

- 将出生年、农历月、农历日、时辰对应重量相加；
- 总重量通常从二两一到七两二；
- 每个总重量对应称骨歌。

暂缓原因：

- 当前资料没有完整、可校验的四张重量表；
- 不同版本可能存在表格差异；
- 缺少全部称骨歌及版权、来源确认；
- 不能只根据“重量高低”简单判好坏。

上线条件：完成版本选定、数据校验、测试样例和中性解释文案。

---

## 9.3 五行人格

当前资料只对木型人有较多描述，不能据此拼凑完整五行测试。

后续开发至少需要：

- 木、火、土、金、水五类完整且对称的题库；
- 每题评分和反向计分规则；
- 并列类型处理；
- 结果置信度；
- 不从脸型、身体或健康信息自动推断人格；
- 明确标注为传统人格反思工具，而非心理测验。

---

## 9.4 面相、声相、行相

不做自动图像或声音推断，主要原因：

- 外貌和声音受光线、设备、年龄、疲劳、疾病和文化差异影响；
- “心地险恶、家暴倾向、福薄”等标签伤害性强且缺少可靠依据；
- 自动分析可能放大偏见；
- 不应根据生理特征推断道德、人格、健康或命运。

可以保留为“原书文化内容阅读”，但不输出到具体用户身上。

---

# 十、九宫方位基础数据

九宫基础可作为命宫和未来风水内容的公共数据，不单独宣称吉凶。

口诀：

```text
戴九履一，左三右七，四二为肩，八六为足。
```

采用“上南下北”的传统九宫布局：

```text
4  9  2
3  5  7
8  1  6
```

| 数字 | 卦 | 方位 | 五行 |
|---:|---|---|---|
| 1 | 坎 | 北 | 水 |
| 2 | 坤 | 西南 | 土 |
| 3 | 震 | 东 | 木 |
| 4 | 巽 | 东南 | 木 |
| 5 | 中宫 | 中央 | 土 |
| 6 | 乾 | 西北 | 金 |
| 7 | 兑 | 西 | 金 |
| 8 | 艮 | 东北 | 土 |
| 9 | 离 | 南 | 火 |

需要注意：

- 九宫数字不是先天八卦数；
- 命宫模块使用后天八卦九宫数字；
- 未来若开发梅花易数，先天八卦数必须使用独立枚举，避免混用。

---

# 十一、内容库（Wisdom Library）

## 11.1 建议主题

```ts
type WisdomTheme =
  | "yin-yang-balance"
  | "attention"
  | "choice"
  | "action"
  | "relationship-boundary"
  | "respect"
  | "environment"
  | "uncertainty";
```

每条内容建议包含：

```ts
type WisdomContent = {
  id: string;
  theme: WisdomTheme;
  title: string;
  sourceIdea: string;
  modernInterpretation: string;
  reflectionQuestion: string;
  actionSuggestion: string;
  tags: string[];
};
```

---

## 11.2 可使用的核心思想

### 一阴一阳之谓道

现代解释：同一特征在不同场景下可能有不同作用。稳定可以是耐心，也可能变成停滞；行动可以是主动，也可能变成冲动。

### 注意力在哪里，行动就容易流向哪里

现代解释：持续关注不可控的事情，容易消耗精力；把注意力转向可验证事实和可执行步骤，有助于恢复掌控感。

### 修行是修正行为

现代解释：理解一个道理不等于发生改变，真正的变化体现在下一次具体选择中。

### 主动选择权

现代解释：重要的不是得到唯一答案，而是理解可选方案、代价和边界。

### 尊重他人选择

现代解释：在别人没有请求时，不以“为你好”为理由强行干预；在关系中先确认对方是否愿意听建议。

---

## 11.3 不建议直接使用的原书断言

以下句子不得作为产品事实陈述：

- “天下没有预测不准的人或事”；
- “貌似不准只是被化解了”；
- “正气足，外邪不侵”用于疾病说明；
- “手冷说明运势差”；
- “某种家居物品会招小人或导致疾病”；
- “一等婚能挡灾、治病或福泽家人”。

可以改写为：

> 在这套传统体系中，人们尝试通过象数关系理解趋势；实际生活仍受到大量现实变量影响。

---

# 十二、统一结果文案规范

## 12.1 推荐表达

- “从这套传统规则看……”
- “这个结果更适合被理解为……”
- “可以把它当作一个反思角度……”
- “当前信息更支持谨慎观察……”
- “现实结果仍取决于双方行动和条件……”
- “不妨先验证以下事实……”

## 12.2 禁止表达

- “你命中注定……”
- “一定会发生……”
- “绝对不能结婚……”
- “你的对象必定来自……”
- “这是癌症/疾病的前兆……”
- “付费后可以化解……”
- “不照做就会有灾……”
- “系统准确率 100%……”

---

# 十三、统一免责声明

简版：

> FateMirror 提供传统文化娱乐和自我反思内容，不构成科学预测或专业建议。请结合现实信息自主判断。

关系模块扩展版：

> 命宫和方位结果不能判断一段关系是否健康。涉及婚姻、分手、财产和人身安全时，请优先依据现实行为、法律权利和专业意见。

健康相关页面：

> FateMirror 不提供疾病诊断或治疗建议。出现持续不适、明显症状或健康担忧时，请咨询合格医疗专业人员。

---

# 十四、推荐代码结构

```text
src/
  domain/
    xiaoliuRen/
      calculate.ts
      constants.ts
      types.ts
      interpret.ts
      calculate.test.ts
    mingGua/
      calculate.ts
      match.ts
      constants.ts
      types.ts
      calculate.test.ts
      match.test.ts
    marriageDirection/
      calculate.ts
      constants.ts
      types.ts
      calculate.test.ts
  services/
    lunarCalendar/
      index.ts
      adapter.ts
      types.ts
      adapter.test.ts
  content/
    wisdom/
      zh-CN.json
    guidance/
      zh-CN.json
    disclaimers/
      zh-CN.json
  application/
    readings/
      createReading.ts
      getReading.ts
  api/
    readings.ts
  ui/
    ...
```

设计原则：

- `calculate.ts` 只负责数学计算；
- `interpret.ts` 根据结果代码查询文案，不修改计算值；
- 所有常量集中管理；
- 所有计算返回 trace，便于调试；
- 内容文案与算法分离，便于国际化和版本迭代；
- 不让 LLM 决定命宫数字、农历日期或六神结果。

---

# 十五、建议 API

## 15.1 小六壬

```http
POST /api/readings/xiaoliu-ren
```

```json
{
  "occurredAt": "2026-06-20T15:30:00+08:00",
  "timezone": "Asia/Shanghai",
  "question": "这次沟通是否适合今天推进？"
}
```

## 15.2 命宫

```http
POST /api/readings/ming-gua
```

```json
{
  "birthYear": 1995,
  "gender": "male"
}
```

## 15.3 命宫匹配

```http
POST /api/readings/ming-gua-match
```

```json
{
  "personA": { "birthYear": 1995, "gender": "male" },
  "personB": { "birthYear": 1990, "gender": "female" }
}
```

## 15.4 婚配方位

```http
POST /api/readings/marriage-direction
```

```json
{
  "birthDate": "1995-01-16",
  "birthPlaceLabel": "洛阳"
}
```

---

# 十六、通用 Reading 存储模型

```ts
type ReadingRecord = {
  id: string;
  userId?: string;
  type: "xiaoliu-ren" | "ming-gua" | "ming-gua-match" | "marriage-direction";
  version: string;              // 算法版本，例如 1.0.0
  input: Record<string, unknown>;
  normalizedInput: Record<string, unknown>;
  calculationTrace: Record<string, unknown>;
  resultCode: string;
  renderedContentVersion: string;
  createdAt: string;
};
```

必须保存算法版本。以后若修改农历库、时辰边界或文案，历史结果仍可追溯。

隐私要求：

- 出生日期、关系信息属于个人数据；
- 默认只保存完成产品功能所需的最少信息；
- 提供删除历史记录入口；
- 不把用户问题用于公开训练或展示；
- 不通过命理结果推断敏感身份属性。

---

# 十七、首版页面建议

## 首页

- 标题：看见当下，保留选择；
- 四个入口：小六壬、我的命宫、关系命宫、婚配方位；
- 明确“传统文化娱乐与反思工具”。

## 小六壬结果页

1. 起念时间和农历转换结果；
2. 六神结果；
3. 中性解释；
4. 感情/工作两个可切换场景；
5. 一个现实行动；
6. 不确定性说明。

## 命宫结果页

1. 命宫数字和卦象；
2. 东四命/西四命；
3. 本宫方位和方向组；
4. 计算过程；
5. 传统象意说明；
6. 不将人物象解释为现实身份。

## 关系结果页

1. 双方命宫；
2. 传统正配/同组/跨组；
3. 现实关系四项自查；
4. 不显示“凶婚”红色恐吓标签；
5. 不鼓励仅根据结果结束关系。

## 婚配方位结果页

1. 农历生日；
2. 月支起点；
3. 顺数过程；
4. 主方向和对向轴；
5. 以出生地为参考中心；
6. 明确不是对象出生地保证。

---

# 十八、首版开发范围

## 必须完成

- [ ] 公历转农历公共服务；
- [ ] 小六壬确定性计算及单元测试；
- [ ] 命宫确定性计算及单元测试；
- [ ] 命宫匹配及单元测试；
- [ ] 婚配方位确定性计算及单元测试；
- [ ] 统一免责声明；
- [ ] 计算过程展示；
- [ ] 错误输入处理；
- [ ] 算法版本记录；
- [ ] 中文结果文案与算法分离。

## 可以随后完成

- [ ] Reading 历史记录；
- [ ] 分享卡片；
- [ ] 当前状态自评；
- [ ] 智慧内容库；
- [ ] 今日行动建议；
- [ ] 多语言。

## 首版不得开发

- [ ] 医疗或疾病预测；
- [ ] 面相、声音、步态自动判断；
- [ ] 手温测运势；
- [ ] 收费化解；
- [ ] 未完成规则的梅花易数；
- [ ] 缺表格数据的称骨算命；
- [ ] 自动判定“正缘”“必分手”“必发财”。

---

# 十九、Codex 执行要求

将本文件交给 Codex 时，应要求其遵循以下顺序：

1. 先检查现有 FateMirror 技术栈和目录，不擅自重建项目；
2. 先实现纯函数和测试，再接 API 和页面；
3. 选择并封装农历转换库，不在业务代码中散落第三方调用；
4. 为每个模块建立输入、输出和错误类型；
5. 保证所有结果可由相同输入稳定复现；
6. 展示计算 trace，便于核对；
7. 不使用 LLM 替代确定性计算；
8. 不添加本文件列为“暂缓”或“不得开发”的功能；
9. 不编造缺失规则；
10. 完成后输出修改文件列表、测试结果、已知限制和下一步建议。

推荐直接给 Codex 的任务描述：

```text
请阅读《术道部分总结_FateMirror开发版.md》，基于当前 FateMirror 仓库实现首版确定性 Reading Engine。

范围仅包括：
1. 小六壬；
2. 九宫命格/三元命卦；
3. 命宫关系匹配；
4. 婚配方位；
5. 公历转农历公共服务；
6. 单元测试、API、基础结果页和免责声明。

先分析现有技术栈与目录，再给出实施计划。不得编造缺失规则，不得实现文档中标记为暂缓或排除的内容。所有计算必须由纯函数完成并返回 calculation trace；LLM 只能用于可选的文案润色，不能参与数值计算。

完成后请：
- 运行全部相关测试；
- 报告修改文件；
- 给出测试结果；
- 标明农历库、支持年份和边界处理；
- 说明仍未实现的功能。
```

---

# 二十、原书章节索引

便于后续人工复核：

| 内容 | 章节 |
|---|---:|
| 预测与化解 | 第4章 |
| 婚配方位 | 第5章 |
| 小六壬 | 第6章 |
| 法不轻施、道不轻传 | 第10章 |
| 采日光功 | 第23章 |
| 洗心养神功 | 第47章 |
| 九宫方位速记 | 第114章 |
| 一秒测运势 | 第119章 |
| 梅花易数时间起卦 | 第152章 |
| 称骨算命 | 第154章 |
| 命宫算法 | 第264章 |
| 命宫婚配 | 第265-266章 |
| 三元命原始算法 | 第348-349章 |

---

# 二十一、最终产品结构

```text
FateMirror
├─ Reading Engine（确定性计算）
│  ├─ 小六壬
│  ├─ 九宫命格
│  ├─ 命宫匹配
│  └─ 婚配方位
│
├─ Wisdom Engine（内容与反思）
│  ├─ 阴阳反思卡
│  ├─ 注意力归位
│  ├─ 主动选择
│  ├─ 关系边界
│  ├─ 今日行动
│  └─ 环境自查
│
├─ Research Queue（规则待补）
│  ├─ 梅花易数
│  ├─ 称骨算命
│  └─ 五行人格
│
└─ Excluded（不产品化）
   ├─ 医疗与疾病预测
   ├─ 偏方与象数治疗
   ├─ 面相道德判断
   ├─ 手温测运势
   ├─ 超自然能力
   └─ 收费化解
```

产品最终应坚持：

> 计算部分透明、稳定、可测试；解释部分温和、克制、有现实行动；传统内容可以保留，但不能伪装成科学结论。
