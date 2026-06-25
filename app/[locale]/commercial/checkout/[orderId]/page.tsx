import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SandboxCheckoutButton } from "../../../../components/commercial/sandbox-checkout-button";
import { getCommercialOrder } from "../../../../../lib/commercial/order-service";
import { getCommercialPriceLabel } from "../../../../../lib/commercial/pricing";
import { getCommercialProduct } from "../../../../../lib/commercial/products";
import { getDictionary, hasLocale } from "../../../../../lib/i18n";

type CommercialCheckoutPageProps = PageProps<"/[locale]/commercial/checkout/[orderId]">;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CommercialCheckoutPage(props: CommercialCheckoutPageProps) {
  const { locale, orderId } = await props.params;
  if (!hasLocale(locale) || !orderId) notFound();

  const dict = getDictionary(locale);
  const order = await getCommercialOrder(orderId);
  if (!order) notFound();

  const product = getCommercialProduct(order.productCode);
  const amountLabel = getCommercialPriceLabel(order.productCode);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <Link href={`/${locale}/reading/advice`} className="text-sm text-[color:var(--color-muted)]">
          {locale === "zh" ? "返回 Advice" : "Back to Advice"}
        </Link>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
          Sandbox checkout
        </p>
        <h1 className="mt-4 font-serif text-4xl">{product.name}</h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
          {product.description}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Metric label="Order" value={order.id} />
          <Metric label="Status" value={order.status} />
          <Metric label="Amount" value={amountLabel} />
        </div>
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/14 bg-black/10 p-5">
          <p className="text-sm leading-7 text-[color:var(--color-muted)]">
            {locale === "zh"
              ? "这是沙箱支付页面。点击下方按钮会生成带签名的 webhook 事件，并把订单推进到 paid/entitled 状态。"
              : "This is a sandbox checkout page. The button below generates a signed webhook event and advances the order to paid / entitled state."}
          </p>
          <SandboxCheckoutButton locale={locale} orderId={order.id} />
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
      <p className="text-xs text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-2 break-all text-sm text-[color:var(--color-foreground)]">{value}</p>
    </div>
  );
}
