# FateMirror 下一阶段开发计划

> 文档用途：交给 Codex 继续开发 FateMirror MVP  
> 当前基线：首版确定性 Reading Engine 已完成，`test`、`lint`、`build` 均已通过  
> 目标版本：MVP 0.2  
> 核心原则：先完成产品闭环和可信度建设，不新增暂缓术数

---

## 1. 当前项目基线

当前已经完成以下确定性能力：

- 公历转农历；
- 小六壬；
- 九宫命格 / 三元命卦；
- 双方命卦匹配；
- 婚配方位；
- 对应 API；
- 基础 GET 表单结果页；
- 10 项 Reading Engine 测试；
- Next.js 构建、ESLint 检查。

现有关键实现：

```text
lib/
├── lunar-converter.ts
├── xiaoliu-ren.ts
├── ming-gong.ts
└── marriage-direction.ts

app/api/readings/
├── xiaoliu-ren/route.ts
├── ming-gua/route.ts
├── ming-gua-match/route.ts
└── marriage-direction/route.ts

app/[locale]/reading/
├── ming-gua/page.tsx
├── ming-gua-match/page.tsx
└── marriage-direction/page.tsx
```

现阶段的主要问题不在计算能力，而在：

1. 首页信息架构不够清晰；
2. 基础工具与综合 Reading 的关系不明确；
3. 结果页价值不足；
4. 关于页和免责声明仍有 MVP 占位或范围不一致；
5. GET 表单可能暴露个人输入；
6. 测试覆盖不足；
7. API 缺少统一 Schema、错误格式和算法版本；
8. LLM 文案层需要更严格的边界和降级策略。

---

## 2. 本阶段总体目标

本阶段只完成以下闭环：

```text
用户知道该选什么
→ 输入过程清晰
→ 计算结果稳定
→ 结果解释易懂
→ 可以查看计算依据
→ 得到一个现实可执行的建议
→ 出错时仍能获得基础结果
```

本阶段不追求增加更多术数，不开发梅花易数、称骨算命、面相、声相、行相、五行体质和医疗相关内容。

---

## 3. 产品结构调整

### 3.1 首页重新分组

首页不再使用“两条路径 + 三个同级工具”的结构。

建议调整为三个功能分区。

#### A. 关系解读

主要入口：

- 综合关系解读；
- 双方命卦匹配；
- 婚配方位。

其中“综合关系解读”是首页唯一主 CTA。

#### B. 个人解读

- 我的命卦。

#### C. 即时解读

- 此刻之问 / 小六壬。

推荐结构：

```text
首页首屏
├── 主标题
├── 简短定位
└── 主 CTA：开始关系解读

第二屏：关系解读
├── 综合关系解读
├── 双方命卦匹配
└── 婚配方位

第三屏：个人与即时工具
├── 我的命卦
└── 此刻之问
```

### 3.2 统一中文术语

全站主术语统一为：

| 当前可能出现的名称 | 统一名称 |
|---|---|
| 九宫命格 / 命宫 / 三元命卦 | 命卦 |
| 关系命宫 | 双方命卦匹配 |
| Moment Reading | 此刻之问 |
| Love & Connection Reading | 关系与连接解读 |
| 进入体验 | 按功能改为具体 CTA |
| 公式性别 | 性别 |

方法说明中可以补充：

> 命卦也称命宫或三元命卦。

### 3.3 CTA 文案

不要重复使用“进入体验”。

建议：

```text
开始关系解读
计算我的命卦
查看双方匹配
计算婚配方位
开始此刻之问
```

---

## 4. P0：必须完成的产品任务

P0 是本轮开发的首要范围，完成后才进入 P1。

---

### 4.1 重构首页信息架构

目标文件根据现有仓库实际结构确认，预计涉及：

```text
app/[locale]/page.tsx
app/components/*
lib/i18n.ts
```

实施要求：

1. 首页只保留一个主 CTA；
2. 其余功能按照“关系 / 个人 / 即时”分组；
3. 移除中文页面的中英文混用；
4. 每张功能卡说明：
   - 需要什么输入；
   - 会得到什么结果；
   - 是否属于综合 Reading 或基础工具；
5. 保留现有视觉风格，不大规模重写 UI 体系；
6. 确保移动端首屏能够看到主 CTA。

验收标准：

- 用户能在 10 秒内判断应该选择哪个入口；
- 首页不存在两个以上视觉权重相同的主按钮；
- 中文页面核心功能名称全部为中文；
- 所有功能入口都能正确跳转。

---

### 4.2 修复关于页面

目标路由：

```text
/[locale]/about
```

移除所有占位文案，例如：

```text
后续可以在这里补……
```

关于页至少包含：

1. FateMirror 是什么；
2. 当前版本；
3. 目前已经实现的方法；
4. 暂未实现的方法；
5. 计算层与 AI 文案层的区别；
6. 文化体验定位；
7. 隐私提示；
8. 反馈入口；
9. 最后更新时间。

建议文案重点：

```text
FateMirror 使用固定程序规则完成日期换算、命卦、六神和方向计算。
AI 只用于可选的自然语言整理，不会改变基础计算结果。
```

验收标准：

- 页面不存在开发占位语句；
- 不暗示结果具有科学预测能力；
- 不声称可以预测疾病、灾祸、死亡、财富结果或婚姻必然结果。

---

### 4.3 收紧免责声明

目标路由：

```text
/[locale]/disclaimer
```

当前 MVP 未实现五行体质、健康和调养模块，因此免责声明不应主动扩大到这些功能。

建议核心内容：

```text
FateMirror 的计算基于公开整理的传统历法与命理规则，
仅用于文化体验、自我观察和关系反思。

结果不构成对婚姻、职业、投资、健康、法律或其他重大事项的确定性判断，
不能替代专业意见。

日期换算、命卦、六神和方向结果由固定程序规则计算；
自然语言解释可能由模板或人工智能辅助生成，
但不会改变基础计算结果。
```

验收标准：

- 免责声明与现有功能范围一致；
- 所有 Reading 结果页底部都有免责声明入口；
- 不出现医疗效果、疾病诊断或灾祸断言。

---

### 4.4 新增方法说明页

新增路由建议：

```text
/[locale]/methodology
```

页面内容：

#### 通用部分

- 方法来源；
- 程序计算与 AI 文案的边界；
- 支持公历年份：1900—2100；
- 算法版本；
- 传统文化方法不等同于科学预测。

#### 小六壬

- 输入项；
- 农历月、日、时辰如何参与；
- 23:00—23:59 的 MVP 处理规则；
- 闰月处理；
- 同一输入得到同一结果。

#### 命卦

- 出生年份与性别公式；
- 5 中宫转换；
- 东四命和西四命；
- 结果只作传统视角参考。

#### 双方命卦匹配

- 正配；
- 同组；
- 跨组；
- 不使用“凶婚”“克夫”“克妻”等恐吓词。

#### 婚配方位

- 结果为方向轴，不是精确城市；
- 不代表伴侣必然来自该方向。

验收标准：

- 每个基础工具结果页都能跳转到对应方法章节；
- 方法页能够说明边界情况；
- 用户无需查看源代码即可理解结果从哪里来。

---

### 4.5 统一结果页结构

所有基础 Reading 结果页统一为五层。

#### 第一层：一句话结果

例：

```text
你的命卦为坤卦，属于西四命。
```

#### 第二层：关键结果卡片

例：

```text
命卦：坤
数字：2
分组：西四命
本卦方位：西南
有利方向：西、西南、西北、东北
```

#### 第三层：现实解释

必须区分：

```text
传统视角
现实关系提示
需要注意的地方
```

禁止输出：

```text
百分百准确
命中注定
一定幸福
必然离婚
天作之合 98 分
```

#### 第四层：一个行动建议

每个结果只提供 1—2 个可执行行动。

例：

```text
今天的观察：
留意你在关系分歧中最担心失去的是什么。

今天的行动：
用一句不带判断的话，确认对方近期最看重的一件事。
```

#### 第五层：可折叠计算依据

展示：

```text
输入值
农历转换结果
计算公式
中间变量
最终索引
算法版本
农历库版本
```

默认折叠，提供：

```text
查看本次结果如何计算
复制计算过程
```

验收标准：

- 每个基础结果页均具备五层结构；
- 普通用户不需要先阅读 trace；
- trace 能完整复现结果；
- 文案与纯函数结果不得冲突。

---

### 4.6 表单从 GET 迁移

当前基础页面使用 GET 表单。

调整规则：

#### 可以本地计算的功能

优先直接调用客户端纯函数或 Server Action，不把个人输入放入 URL。

#### 需要服务端 API 的功能

使用 POST：

```text
POST /api/readings/xiaoliu-ren
POST /api/readings/ming-gua
POST /api/readings/ming-gua-match
POST /api/readings/marriage-direction
```

要求：

- 出生日期不出现在查询参数中；
- 关系问题原文不出现在 URL 中；
- API 不记录不必要的原始问题文本；
- 分享功能未来使用匿名 shareId，不直接分享原始输入 URL。

验收标准：

- 计算完成后地址栏不包含出生日期、性别、关系问题；
- 浏览器前进后退仍可正常使用；
- 刷新后的行为需要有明确设计：
  - 提示重新输入；或
  - 从 sessionStorage 恢复；
- 不默认写入 localStorage 长期保存。

---

### 4.7 完整状态与降级

每个 Reading 页面必须支持：

```text
初始状态
输入校验错误
提交中
基础计算成功
基础计算失败
扩展文案生成中
扩展文案生成失败
不支持年份
重新计算
```

关键要求：

```text
基础计算成功但 LLM 失败
≠
整个页面失败
```

当 AI 文案失败时：

1. 仍显示确定性结果；
2. 使用本地模板解释；
3. 显示非阻断提示：
   “扩展解读暂时不可用，基础计算结果不受影响。”

验收标准：

- 模拟 OpenAI 请求失败后，基础结果仍可展示；
- API 超时不会让页面无限 loading；
- 所有错误信息使用用户可理解的中文。

---

## 5. P1：工程质量与可维护性

---

### 5.1 引入统一 Schema

建议使用 Zod。

目录建议：

```text
lib/readings/schemas/
├── common.ts
├── xiaoliu-ren.ts
├── ming-gua.ts
├── ming-gua-match.ts
└── marriage-direction.ts
```

每个模块至少包含：

```text
RequestSchema
ResultSchema
TraceSchema
ErrorSchema
```

统一 API 响应：

```ts
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta: {
        method: string;
        methodVersion: string;
        calculatedAt: string;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        field?: string;
      };
    };
```

建议错误码：

```text
INVALID_INPUT
INVALID_DATE
UNSUPPORTED_GREGORIAN_YEAR
INVALID_TIMEZONE
LUNAR_CONVERSION_FAILED
CALCULATION_FAILED
INTERPRETATION_UNAVAILABLE
INTERNAL_ERROR
```

验收标准：

- Route 不再自行拼接互不一致的错误 JSON；
- 前端根据错误码显示统一文案；
- Schema 同时用于前端表单和 API。

---

### 5.2 增加算法元数据与版本

所有结果必须包含：

```ts
type MethodMeta = {
  method: string;
  methodVersion: string;
  lunarAdapter?: string;
  lunarAdapterVersion?: string;
  calculatedAt: string;
};
```

当前建议：

```text
xiaoliu-ren: 1.0.0
ming-gua: 1.0.0
ming-gua-match: 1.0.0
marriage-direction: 1.0.0
lunar-adapter: lunar-javascript 1.7.7
```

算法规则变化时：

- 文案调整：不一定升级算法版本；
- 计算规则变化：升级 minor 或 major；
- 仅修复 trace 字段：升级 patch。

验收标准：

- API、结果页 trace、复制计算过程都包含版本；
- 历史截图能够识别使用的算法版本。

---

### 5.3 迁移到正式测试框架

建议使用 Vitest。

新增：

```text
vitest.config.ts

tests/readings/
├── lunar-converter.test.ts
├── xiaoliu-ren.test.ts
├── ming-gua.test.ts
├── ming-gua-match.test.ts
├── marriage-direction.test.ts
└── api-contract.test.ts
```

保留现有 `scripts/run-reading-engine-tests.mjs` 作为临时回归入口，确认 Vitest 覆盖完整后再决定是否删除。

命令：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "build": "next build"
  }
}
```

---

### 5.4 测试矩阵

#### 农历转换

必须覆盖：

- 1900 年边界；
- 2100 年边界；
- 1900 年之前；
- 2100 年之后；
- 春节前一天；
- 春节当天；
- 春节后一天；
- 闰月第一天；
- 闰月最后一天；
- 2024-02-29；
- 非法日期 2026-02-30；
- 字符串日期不受服务器时区影响；
- ISO 时间按照 IANA 时区转换。

#### 小六壬

必须覆盖：

- 十二时辰；
- 每个时辰边界；
- 22:59；
- 23:00；
- 23:59；
- 00:00；
- 结果索引 0—5；
- 闰月；
- 同一 UTC 时间在不同时区得到不同本地输入；
- 无效时区；
- 缺失时间；
- trace 可复算。

#### 命卦

必须覆盖：

- 基数 1—9；
- 男性结果 5 转 2；
- 女性结果 5 转 8；
- 最终结果永不为 5；
- 1900；
- 2100；
- 非法年份；
- 非法性别值。

#### 双方命卦匹配

必须覆盖：

- 四组正配；
- 所有同组非正配；
- 所有跨组；
- 参数交换对称性；
- 输入 5 被拒绝；
- 非法数字被拒绝。

#### 婚配方位

必须覆盖：

- 农历 1—12 月；
- 初一；
- 月末；
- 闰月；
- 八个方向；
- 四条方向轴；
- trace 可复算。

目标：

- 规则函数分支覆盖率不低于 90%；
- 不以单纯增加测试数量作为目标；
- 使用表驱动测试覆盖全部规则组合。

---

### 5.5 CI

新增 GitHub Actions 或仓库现有 CI。

建议流程：

```text
install
→ typecheck
→ test
→ lint
→ build
```

建议文件：

```text
.github/workflows/ci.yml
```

要求：

- 使用 `npm ci`；
- Node.js 版本与 Vercel 保持一致；
- 任意一步失败则阻止合并；
- 不在 CI 中调用真实 OpenAI API；
- LLM 相关测试使用 mock。

---

### 5.6 限制 LLM 文案层

架构必须保持：

```text
纯函数计算
→ 结构化事实
→ 本地基础模板
→ 可选 LLM 润色
→ 输出校验
```

LLM 输入中只传递结构化事实，不让模型重新计算。

示例：

```ts
type InterpretationFacts = {
  method: "ming-gua-match";
  personA: {
    palaceNumber: number;
    trigram: string;
    group: "east" | "west";
  };
  personB: {
    palaceNumber: number;
    trigram: string;
    group: "east" | "west";
  };
  matchType: "best_match" | "same_group" | "different_group";
  allowedClaims: string[];
  forbiddenClaims: string[];
};
```

禁止模型生成：

```text
自造匹配分数
疾病判断
怀孕预测
死亡或灾祸
投资收益
必然结婚或离婚
付费化解
恐吓性文案
```

输出后校验：

1. 匹配类型是否与事实一致；
2. 是否出现禁止词；
3. 是否超过长度；
4. 是否包含绝对化断言；
5. 校验失败则使用本地模板。

---

## 6. P2：完成 P0、P1 后再评估

P2 不在本轮强制实现范围。

候选内容：

1. 本地历史记录；
2. 用户主动删除历史；
3. 分享卡片；
4. 今日行动内容库；
5. “有启发 / 一般 / 不符合”反馈；
6. 基础埋点；
7. SEO、Open Graph、canonical、hreflang；
8. 英文版本内容一致性；
9. 结果导出图片。

P2 是否进入开发，需根据真实使用数据决定。

---

## 7. 明确不开发的内容

本阶段不得实现：

```text
梅花易数
称骨算命
五行人格 / 五行体质
面相识别
声相判断
行相判断
医疗预测
疾病诊断
怀孕预测
死亡或灾祸预测
股票或投资结果预测
付费化解
开天眼
气功效果判断
手温判断运势
```

不得以“先放入口”“隐藏功能”“实验功能”为理由提前实现。

---

## 8. 推荐组件拆分

建议在不破坏现有项目结构的前提下逐步抽取。

```text
app/components/readings/
├── reading-form-shell.tsx
├── reading-result-shell.tsx
├── result-summary.tsx
├── result-facts-card.tsx
├── reality-guidance.tsx
├── action-suggestion.tsx
├── calculation-trace.tsx
├── methodology-link.tsx
├── reading-disclaimer.tsx
├── reading-error.tsx
└── interpretation-status.tsx
```

Schema 和领域模型：

```text
lib/readings/
├── meta.ts
├── errors.ts
├── api-response.ts
├── interpretation/
│   ├── local-templates.ts
│   ├── llm-client.ts
│   ├── output-validator.ts
│   └── forbidden-claims.ts
└── schemas/
```

要求：

- 不为追求目录美观大规模迁移已有纯函数；
- 优先复用已有实现；
- 每次重构必须保持测试通过。

---

## 9. 数据与隐私要求

### 9.1 默认不持久化

MVP 默认不保存：

- 出生日期；
- 性别；
- 对方出生日期；
- 用户的关系问题；
- 计算结果历史。

### 9.2 日志最小化

服务端日志不要记录完整请求体。

可记录：

```text
requestId
method
methodVersion
success
errorCode
durationMs
```

不要记录：

```text
完整出生日期
关系问题原文
姓名
联系方式
```

### 9.3 分析埋点

未来增加埋点时只记录行为事件：

```text
home_primary_cta_clicked
reading_form_started
reading_form_completed
reading_result_rendered
trace_expanded
methodology_opened
interpretation_failed
```

不把用户输入作为埋点属性。

---

## 10. 可访问性与移动端要求

所有表单：

- 有明确 label；
- 错误信息与字段关联；
- 支持键盘操作；
- loading 按钮具有 `aria-busy`；
- 折叠 trace 支持键盘展开；
- 对比度满足基本可读性；
- 移动端按钮高度不低于 44px；
- 日期选择器在手机端可用；
- 结果卡不产生横向滚动；
- 长 trace 自动换行。

---

## 11. 完成定义

本阶段只有同时满足以下条件才算完成：

### 产品

- 首页完成重新分组；
- 只有一个主 CTA；
- 中文术语统一；
- 关于页无占位；
- 免责声明与功能范围一致；
- 方法说明页上线；
- 四个基础工具结果页使用统一结构。

### 隐私

- 个人输入不再出现在 URL；
- 默认不持久化；
- 服务端日志不记录完整请求。

### 工程

- API 使用统一 Schema；
- 统一错误码；
- 所有结果包含算法版本；
- LLM 失败时基础结果可用；
- Vitest 测试通过；
- lint 通过；
- build 通过；
- CI 通过。

### 内容安全

- 不出现绝对命运判断；
- 不出现医疗和灾祸预测；
- 不出现付费化解；
- 不出现模型自造分数；
- LLM 文案不得与计算结果冲突。

---

## 12. Codex 执行顺序

Codex 应严格按以下顺序开发。

### Step 1：仓库检查

1. 阅读现有目录；
2. 检查未提交改动；
3. 不覆盖、不回退用户已有改动；
4. 运行：
   - `npm test`
   - `npm run lint`
   - `npm run build`
5. 记录当前基线。

### Step 2：P0 内容与信息架构

1. 首页重组；
2. 统一术语；
3. 修复关于页；
4. 修复免责声明；
5. 新增方法说明页。

### Step 3：结果页统一

1. 抽取共享结果组件；
2. 改造命卦结果页；
3. 改造双方命卦匹配；
4. 改造婚配方位；
5. 改造小六壬 / Moment 结果；
6. 增加 trace 和方法链接。

### Step 4：隐私与表单

1. GET 改 POST 或本地计算；
2. 清理 URL 参数；
3. 增加状态和错误处理；
4. 实现 LLM 降级。

### Step 5：P1 工程化

1. Zod；
2. 统一 API 响应；
3. 算法版本；
4. Vitest；
5. 测试矩阵；
6. CI；
7. LLM 输出校验。

### Step 6：最终验证

必须运行：

```bash
npm test
npm run test:coverage
npm run lint
npm run build
```

并手工检查：

```text
/zh
/zh/about
/zh/disclaimer
/zh/methodology
/zh/reading/ming-gua
/zh/reading/ming-gua-match
/zh/reading/marriage-direction
Moment / 小六壬相关页面
```

---

## 13. Codex 最终交付格式

完成后必须输出：

1. 实施摘要；
2. 新增文件；
3. 修改文件；
4. 删除文件；
5. 页面变化；
6. API 变化；
7. Schema 变化；
8. 测试数量及覆盖范围；
9. `test`、`lint`、`build` 结果；
10. 尚未完成项；
11. 已知限制；
12. 是否发现并保留了用户原有未提交改动；
13. 需要人工确认的 UI 或文案问题。

---

## 14. 可直接交给 Codex 的任务指令

```text
请完整阅读《FateMirror 下一阶段开发计划》。

在当前 FateMirror 仓库基础上完成 MVP 0.2。
不要重建项目，不要回退或覆盖用户已有未提交改动。

严格按 P0 → P1 的顺序执行。
本轮不得实现文档中“明确不开发”的内容。

关键要求：

1. 保持现有确定性 Reading Engine 为唯一计算来源；
2. 日期、命卦、六神、方向不得由 LLM 计算；
3. 首页重构为关系、个人、即时三个分区，并只保留一个主 CTA；
4. 修复关于页和免责声明；
5. 新增方法说明页；
6. 统一所有基础结果页为：
   一句话结论、关键结果、现实解释、行动建议、可折叠 trace；
7. 将包含个人输入的 GET 表单改为 POST、本地计算或安全的状态传递；
8. 引入统一 Schema、错误码和算法版本；
9. LLM 失败时必须保留基础计算结果，并使用本地模板降级；
10. 使用 Vitest 扩展规则矩阵测试；
11. 添加 CI；
12. 全程保留现有用户改动。

开始修改前，先检查仓库、git 状态、package.json 和现有页面结构，
然后输出简短实施计划。

完成后运行：

npm test
npm run test:coverage
npm run lint
npm run build

最终报告所有新增、修改、删除文件，测试结果、已知限制和未完成项。
```
