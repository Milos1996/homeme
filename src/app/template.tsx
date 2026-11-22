import { PageTransition } from "@/components/layout/page-transition";

/** Re-mounts on every navigation, so each route gets the page transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
