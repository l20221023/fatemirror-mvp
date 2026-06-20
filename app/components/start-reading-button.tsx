import { startReading } from "../actions";
import type { Locale } from "../../lib/i18n";

type StartReadingButtonProps = {
  children: React.ReactNode;
  className: string;
  locale: Locale;
  pagePath: string;
  source: string;
  destinationPath?: string;
};

export function StartReadingButton({
  children,
  className,
  locale,
  pagePath,
  source,
  destinationPath = "/reading/love",
}: StartReadingButtonProps) {
  const action = startReading.bind(null, locale, source, pagePath, destinationPath);

  return (
    <form action={action}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
