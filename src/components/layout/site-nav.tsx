"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DEMO_NOTICE, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { isNavItemActive, NAV_ITEMS } from "./nav-items";

const linkBase =
  "rounded-full px-3 py-2 text-sm transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Primary navigation: inline links on desktop, a slide-in sheet on small screens. */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    linkBase,
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
            <Menu aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-background">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">{SITE_NAME}</SheetTitle>
            <SheetDescription>{DEMO_NOTICE}</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile">
            <ul className="flex flex-col gap-1 px-4">
              {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        linkBase,
                        "block py-3 text-base",
                        active ? "bg-accent text-accent-foreground" : "text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
