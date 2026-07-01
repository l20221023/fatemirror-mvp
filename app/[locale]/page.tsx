import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../components/language-switcher";
import { StartReadingButton } from "../components/start-reading-button";
import { TrackEvent } from "../components/track-event";
import { getDictionary, hasLocale, type Locale } from "../../lib/i18n";

type LocalizedHomePageProps = PageProps<"/[locale]">;

type ProductCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  source: string;
  meta: string[];
  accent: "violet" | "blue";
};

type ToolCard = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

export default async function LocalizedHomePage(props: LocalizedHomePageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  const primaryProducts: ProductCard[] = [
    {
      title: isZh ? "关系与连接解读" : "Relationship & Connection Reading",
      description: isZh
        ? "适合想看清两个人之间的互动、边界和下一步。先用固定规则生成基础结果，再把事实、推测和行动建议分开呈现。"
        : "For reading the interaction, boundaries, and next step between two people. Fixed rules produce the base result before facts, inferences, and actions are separated.",
      href: "/reading/advice",
      cta: isZh ? "开始关系解读" : "Start relationship reading",
      source: "home_featured_advice",
      meta: isZh ? ["4 步输入", "AI 扩展", "报告可删除"] : ["4-step input", "AI-assisted", "Deletable report"],
      accent: "violet",
    },
    {
      title: isZh ? "此刻之问" : "Moment Question",
      description: isZh
        ? "适合一个当下正在卡住的问题。只需要起念时刻和问题本身，快速得到小六壬结果、现实解释与行动提醒。"
        : "For one current question that feels stuck. Uses the moment of inquiry to return a Xiao Liu Ren result, grounded reading, and action cue.",
      href: "/reading/moment",
      cta: isZh ? "查看此刻之问" : "Open moment question",
      source: "home_featured_moment",
      meta: isZh ? ["轻量输入", "无需双方资料", "含计算依据"] : ["Light input", "No partner data", "Trace included"],
      accent: "blue",
    },
  ];

  const tools: ToolCard[] = [
    {
      title: isZh ? "我的命卦" : "My Ming Gua",
      description: isZh ? "用出生年份和性别计算命卦、分组与方向。" : "Calculate palace number, group, and directions.",
      href: "/reading/ming-gua",
      icon: "01",
    },
    {
      title: isZh ? "双方命卦匹配" : "Ming Gua Match",
      description: isZh ? "比较两个人的命卦组别与传统匹配类型。" : "Compare two Ming Gua groups and match type.",
      href: "/reading/ming-gua-match",
      icon: "02",
    },
    {
      title: isZh ? "婚配方位" : "Marriage Direction",
      description: isZh ? "按农历规则返回传统方位轴和完整计算轨迹。" : "Return a direction axis with the calculation trace.",
      href: "/reading/marriage-direction",
      icon: "03",
    },
  ];

  const whyCards = isZh
    ? [
        ["规则可复算", "日期、农历、命卦、六神与方位来自固定程序，同一输入应得到同一结果。"],
        ["事实有边界", "已知事实、个人推测和暂时无法确认的信息会被分开呈现。"],
        ["行动归还给你", "结果提供观察角度，但不替代现实沟通、边界和判断。"],
      ]
    : [
        ["Reproducible rules", "Dates, lunar conversion, palace values, deities, and directions come from fixed procedures."],
        ["Facts have edges", "Known facts, personal inferences, and unknowns are shown as separate layers."],
        ["Action stays yours", "The result offers a lens without replacing communication, boundaries, or judgment."],
      ];

  const boundaries = isZh
    ? ["AI 不读取他人内心", "不做必然命运判断", "不提供医疗与投资预测", "报告可以主动删除"]
    : ["AI does not read minds", "No absolute fate claims", "No medical or investment prediction", "Reports can be deleted"];

  const process = isZh
    ? [
        ["输入", "只收集完成判断所需的信息"],
        ["规则", "先由固定程序生成基础结果"],
        ["边界", "事实、推测、未知信息分层"],
        ["行动", "把下一步交还给你"],
      ]
    : [
        ["Input", "Only ask for what the reading needs"],
        ["Rules", "Fixed procedures create the base result"],
        ["Boundaries", "Facts, inferences, and unknowns stay separate"],
        ["Action", "The next step remains yours"],
      ];

  return (
    <main className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-12">
      <TrackEvent eventName="landing_view" page={`/${locale}`} metadata={{ locale, surface: "home_v043_visual_refresh" }} />
      <header className="flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href={`/${locale}`} className="font-serif text-base tracking-[0.18em] text-[color:var(--color-foreground)]">
          {dict.shared.brand}
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <Link href={`/${locale}/about`} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navAbout}
          </Link>
          <Link href={`/${locale}/methodology`} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {isZh ? "方法说明" : "Methodology"}
          </Link>
          <Link href={`/${locale}/privacy`} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {isZh ? "隐私" : "Privacy"}
          </Link>
          <LanguageSwitcher locale={locale} pathSuffix="" />
        </nav>
      </header>

      <section className="grid min-h-[calc(100svh-96px)] items-center gap-10 py-9 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:py-12">
        <div>
          <p className="inline-flex rounded-full border border-[color:var(--color-border-active)] bg-[rgba(167,139,250,0.11)] px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--color-accent-primary)] uppercase">
            {isZh ? "V0.4 · 邀请制测试" : "V0.4 · invite-only beta"}
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.04] text-balance sm:text-6xl lg:text-7xl">
            {isZh ? "看清关系，也看清自己的下一步。" : "See the relationship, then see your next step."}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-muted)] sm:text-lg">
            {isZh
              ? "FateMirror 通过固定规则整理传统视角，再将事实、推测和可执行行动分开呈现。它不是替你决定命运，而是帮你把问题看清。"
              : "FateMirror organizes traditional lenses through fixed rules, then separates facts, inferences, and executable actions. It does not decide for you; it helps you see clearly."}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StartReadingButton locale={locale} source="home_primary_advice_cta" pagePath={`/${locale}`} destinationPath="/reading/advice" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--color-accent-primary)] px-6 py-3 text-sm font-semibold text-[#090A0F] shadow-[0_18px_60px_rgba(167,139,250,0.28)] transition hover:bg-[#c4b5fd]">
              {isZh ? "开始关系解读" : "Start relationship reading"}
            </StartReadingButton>
            <Link href="#tools" className="text-sm font-medium text-[color:var(--color-muted)] underline-offset-4 transition hover:text-[color:var(--color-foreground)] hover:underline">
              {isZh ? "先使用基础工具" : "Use a base tool first"}
            </Link>
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 text-sm text-[color:var(--color-secondary)] sm:grid-cols-2">
            {boundaries.map((item) => (
              <span key={item} className="rounded-full border border-[color:var(--color-border)] bg-[rgba(15,17,25,0.68)] px-4 py-2">
                {item}
              </span>
            ))}
          </div>
        </div>
        <FateMirrorVisual locale={locale} />
      </section>

      <ProcessStrip items={process} />

      <Section eyebrow={isZh ? "为什么使用 FateMirror" : "Why FateMirror"} title={isZh ? "传统视角可以保留，现实判断也必须清楚。" : "Keep the traditional lens without losing practical judgment."}>
        <div className="grid gap-4 md:grid-cols-3">
          {whyCards.map(([title, text]) => (
            <TrustCard key={title} title={title} text={text} />
          ))}
        </div>
      </Section>

      <Section eyebrow={isZh ? "核心产品" : "Core products"} title={isZh ? "核心体验更像一间安静的观测室，而不是入口列表。" : "The core experience feels like a quiet observatory, not a list of doors."}>
        <div className="grid gap-5 lg:grid-cols-2">
          {primaryProducts.map((item) => (
            <FeaturedProduct key={item.title} item={item} locale={locale} />
          ))}
        </div>
      </Section>

      <Section id="tools" eyebrow={isZh ? "基础工具" : "Base tools"} title={isZh ? "用于快速确认规则结果，视觉权重保持克制。" : "Quick deterministic tools with a quieter visual weight."}>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <ToolLink key={tool.title} tool={tool} locale={locale} />
          ))}
        </div>
      </Section>

      <Section eyebrow={isZh ? "报告预览" : "Report preview"} title={isZh ? "输入之后，用户看到的是可验证结构，而不是一句神秘结论。" : "After input, users see a verifiable structure instead of a mysterious verdict."}>
        <ReportPreview isZh={isZh} />
      </Section>

      <section className="py-8">
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-[color:var(--color-border)] pt-8">
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-muted)]">
            {isZh
              ? "边界清楚，体验才可信。FateMirror 不做恐吓式判断，也不把传统方法包装成科学预测。"
              : "Clear boundaries make the experience trustworthy. FateMirror avoids fear-based claims and never presents tradition as scientific prediction."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/methodology`} className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-border-active)]">
              {isZh ? "查看方法说明" : "View methodology"}
            </Link>
            <Link href={`/${locale}/privacy`} className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-border-active)]">
              {isZh ? "查看隐私规则" : "View privacy"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-10 py-8 sm:py-10">
      <p className="text-xs tracking-[0.22em] text-[color:var(--color-accent-secondary)] uppercase">{eyebrow}</p>
      <h2 className="mt-3 max-w-4xl font-serif text-3xl leading-tight text-balance sm:text-4xl">{title}</h2>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function FateMirrorVisual({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";

  return (
    <div className="hero-device relative mx-auto w-full max-w-[470px]" aria-hidden="true">
      <div className="absolute -inset-5 rounded-[2rem] bg-[radial-gradient(circle_at_42%_16%,rgba(167,139,250,0.22),transparent_32%),radial-gradient(circle_at_75%_70%,rgba(125,211,252,0.16),transparent_36%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[rgba(15,17,25,0.78)] p-4 shadow-[0_28px_110px_rgba(0,0,0,0.38)]">
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-3">
          <span className="font-mono text-xs tracking-[0.2em] text-[color:var(--color-accent-secondary)]">FATEMIRROR</span>
          <span className="rounded-full border border-[rgba(125,211,252,0.22)] px-2.5 py-1 font-mono text-[10px] text-[color:var(--color-secondary)]">
            {isZh ? "观测中" : "OBSERVING"}
          </span>
        </div>

        <div className="grid gap-4 pt-5 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex min-h-64 items-center justify-center">
            <div className="fate-mirror-orbit absolute inset-4 rounded-[50%] border border-[rgba(125,211,252,0.18)]" />
            <div className="fate-mirror-core relative h-56 w-44 rounded-[50%] border border-[rgba(242,240,235,0.14)] bg-[radial-gradient(circle_at_48%_30%,rgba(242,240,235,0.18),transparent_18%),linear-gradient(145deg,rgba(167,139,250,0.24),rgba(125,211,252,0.1)_42%,rgba(15,17,25,0.86)_78%)] shadow-[inset_0_0_42px_rgba(242,240,235,0.08),0_32px_100px_rgba(0,0,0,0.42)]">
              <div className="absolute inset-[10%] rounded-[50%] border border-[rgba(167,139,250,0.18)]" />
              <div className="absolute left-[22%] top-[16%] h-[28%] w-[22%] rounded-full bg-[rgba(242,240,235,0.18)] blur-xl" />
              <div className="absolute inset-x-[22%] top-[48%] h-px bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.62),transparent)]" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1rem] border border-[rgba(167,139,250,0.24)] bg-[rgba(167,139,250,0.08)] p-4">
              <p className="font-mono text-[11px] tracking-[0.16em] text-[color:var(--color-accent-primary)]">{isZh ? "本次观察" : "CURRENT OBSERVATION"}</p>
              <p className="mt-3 font-serif text-2xl">{isZh ? "留连" : "Pause"}</p>
              <p className="mt-2 text-xs leading-5 text-[color:var(--color-muted)]">
                {isZh ? "更像关系停滞与信息不足，而不是明确否定。" : "More like stalled movement and missing information than a clear refusal."}
              </p>
            </div>
            {[
              [isZh ? "事实" : "Facts", isZh ? "已发生的互动" : "Observed interaction"],
              [isZh ? "未知" : "Unknowns", isZh ? "对方真实意图" : "The other person's intent"],
              [isZh ? "行动" : "Action", isZh ? "先暂停推进 3 天" : "Pause advancement for 3 days"],
            ].map(([label, text]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-[color:var(--color-border)] pb-3 text-sm">
                <span className="text-[color:var(--color-secondary)]">{label}</span>
                <span className="text-right text-[color:var(--color-foreground)]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessStrip({ items }: { items: string[][] }) {
  return (
    <section className="py-5">
      <div className="grid gap-3 rounded-[1.5rem] border border-[color:var(--color-border)] bg-[rgba(15,17,25,0.58)] p-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([title, text], index) => (
          <div key={title} className="process-cell rounded-[1rem] px-4 py-4">
            <p className="font-mono text-xs text-[color:var(--color-accent-secondary)]">0{index + 1}</p>
            <h2 className="mt-2 text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[rgba(15,17,25,0.62)] p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">{text}</p>
    </article>
  );
}

function FeaturedProduct({ item, locale }: { item: ProductCard; locale: Locale }) {
  const accentClass =
    item.accent === "violet"
      ? "border-[rgba(167,139,250,0.3)] bg-[linear-gradient(180deg,rgba(167,139,250,0.11),rgba(255,255,255,0.025))]"
      : "border-[rgba(125,211,252,0.3)] bg-[linear-gradient(180deg,rgba(125,211,252,0.09),rgba(255,255,255,0.025))]";

  return (
    <article className={`group rounded-[1.5rem] border p-6 transition hover:border-[color:var(--color-border-active)] hover:bg-[rgba(26,30,43,0.72)] ${accentClass}`}>
      <div className="flex flex-wrap gap-2">
        {item.meta.map((meta) => (
          <span key={meta} className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs text-[color:var(--color-muted)]">
            {meta}
          </span>
        ))}
      </div>
      <h3 className="mt-6 font-serif text-3xl leading-tight">{item.title}</h3>
      <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">{item.description}</p>
      <StartReadingButton locale={locale} source={item.source} pagePath={`/${locale}`} destinationPath={item.href} className="mt-7 inline-flex min-h-11 items-center rounded-full border border-[color:var(--color-border-active)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-foreground)] transition group-hover:bg-[rgba(167,139,250,0.12)]">
        {item.cta}
      </StartReadingButton>
    </article>
  );
}

function ToolLink({ tool, locale }: { tool: ToolCard; locale: Locale }) {
  return (
    <Link href={`/${locale}${tool.href}`} className="flex min-h-32 gap-4 rounded-[1.25rem] border border-[color:var(--color-border)] bg-[rgba(15,17,25,0.5)] p-5 transition hover:border-[color:rgba(125,211,252,0.35)] hover:bg-[rgba(26,30,43,0.72)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:rgba(125,211,252,0.3)] font-mono text-xs text-[color:var(--color-accent-secondary)]">
        {tool.icon}
      </span>
      <span>
        <span className="block text-base font-semibold">{tool.title}</span>
        <span className="mt-2 block text-sm leading-6 text-[color:var(--color-muted)]">{tool.description}</span>
      </span>
    </Link>
  );
}

function ReportPreview({ isZh }: { isZh: boolean }) {
  const rows = isZh
    ? [
        ["已确认的事实", "你们最近一次明确互动发生在三天前。"],
        ["你目前的判断", "你更担心的是停滞，而不是冲突本身。"],
        ["还不能确认", "对方是否已经做出最终决定。"],
        ["传统视角", "留连：事情暂缓，信息未齐。"],
        ["建议下一步", "先停止追问，整理一次可验证事实。"],
        ["停止条件", "出现贬低、威胁、持续失联时不再推进。"],
      ]
    : [
        ["Confirmed facts", "The last clear interaction happened three days ago."],
        ["Your current read", "The concern is more about stagnation than conflict."],
        ["Still unknown", "Whether the other person has made a final decision."],
        ["Traditional lens", "Pause: movement is slow and information is incomplete."],
        ["Suggested next step", "Stop chasing and list only verifiable facts first."],
        ["Stop conditions", "Do not advance if contempt, threats, or prolonged silence appears."],
      ];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(125,211,252,0.24)] bg-[rgba(20,23,34,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.26)]">
      <div className="grid border-b border-[color:var(--color-border)] px-5 py-4 sm:grid-cols-[160px_1fr]">
        <p className="font-mono text-xs tracking-[0.18em] text-[color:var(--color-accent-secondary)]">{isZh ? "脱敏样例" : "ANONYMIZED SAMPLE"}</p>
        <p className="mt-2 text-sm text-[color:var(--color-muted)] sm:mt-0">
          {isZh ? "结构先于结论，边界先于建议。" : "Structure before verdicts. Boundaries before advice."}
        </p>
      </div>
      <div className="divide-y divide-[color:var(--color-border)]">
        {rows.map(([label, text], index) => (
          <div key={label} className="grid gap-2 px-5 py-4 sm:grid-cols-[48px_180px_1fr] sm:items-start">
            <p className="font-mono text-xs text-[color:var(--color-secondary)]">0{index + 1}</p>
            <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">{label}</h3>
            <p className="text-sm leading-7 text-[color:var(--color-muted)]">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
