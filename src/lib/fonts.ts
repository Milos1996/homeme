import { Fraunces, Inter } from "next/font/google";

/** Display serif for headings and editorial moments. Exposed as `--font-fraunces` → `font-display`. */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Clean UI sans for body copy and interface. Exposed as `--font-inter` → `font-sans`. */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
