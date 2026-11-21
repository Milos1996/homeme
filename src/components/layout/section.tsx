import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./container";

/** Vertical page section with generous, token-driven spacing. */
export function Section({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-section", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}
