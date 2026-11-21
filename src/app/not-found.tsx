import Link from "next/link";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Section className="flex-1">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-4 text-4xl md:text-5xl">This place isn&apos;t on the map.</h1>
      <p className="mt-4 max-w-prose-narrow text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button asChild className="mt-stack">
        <Link href="/">Back to home</Link>
      </Button>
    </Section>
  );
}
