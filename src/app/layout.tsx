import type { Metadata } from "next";

import { fontDisplay, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  title: "HomeMe",
  description: "Find a place to call yours.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(fontSans.variable, fontDisplay.variable, "h-full")}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
