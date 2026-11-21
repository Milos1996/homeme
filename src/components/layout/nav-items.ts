import { FEATURED_PROJECT_SLUG } from "@/lib/constants";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Path prefix that marks this item as current. Defaults to an exact match on `href`. */
  readonly activePrefix?: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Explore building",
    href: `/projects/${FEATURED_PROJECT_SLUG}`,
    activePrefix: "/projects/",
  },
  { label: "About", href: "/#about" },
];

/** True when `pathname` belongs to `item`. Anchor links (e.g. "/#about") are never "current". */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.href.includes("#")) return false;
  return item.activePrefix ? pathname.startsWith(item.activePrefix) : pathname === item.href;
}
