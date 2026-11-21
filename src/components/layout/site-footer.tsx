import Link from "next/link";

import { DEMO_NOTICE, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

import { Container } from "./container";
import { NAV_ITEMS } from "./nav-items";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-stone-100">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-prose-narrow">
          <p className="font-display text-2xl tracking-tight">{SITE_NAME}</p>
          <p className="mt-2 text-muted-foreground">{SITE_TAGLINE}</p>
          <p className="mt-6 text-sm text-muted-foreground">
            {DEMO_NOTICE} HomeMe is a portfolio demo: the development, apartments, prices and
            availability are fictional.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
