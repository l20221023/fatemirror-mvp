import { startLoveReading } from "../actions";
import type { Locale } from "../../lib/i18n";

type StartReadingButtonProps = {
  children: React.ReactNode;
  className: string;
  locale: Locale;
  pagePath: string;
  source: string;
};

export function StartReadingButton({
  children,
  className,
  locale,
  pagePath,
  source,
}: StartReadingButtonProps) {
  const action = startLoveReading.bind(null, locale, source, pagePath);

  return (
    <form action={action}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
