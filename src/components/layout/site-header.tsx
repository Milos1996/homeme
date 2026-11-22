import Link from "next/link";

import { SITE_NAME } from "@/lib/constants";

import { Container } from "./container";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <Container className="flex h-header items-center justify-between">
        <Link
          href="/"
          className="tap-target rounded-sm font-display text-xl tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {SITE_NAME}
          <span className="sr-only"> home</span>
        </Link>
        <SiteNav />
      </Container>
    </header>
  );
}
