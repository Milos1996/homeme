import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Centred content column with the site gutter. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-content px-gutter", className)} {...props} />;
}
