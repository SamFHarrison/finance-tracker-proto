"use client";

import { cn } from "@/lib/utils/cn";
import { H3 } from "@/components/ui";
import {
  ChartPie,
  ClipboardList,
  Sprout,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface TabBarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface TabBarProps {
  tabs?: TabBarItem[];
  className?: string;
}

const defaultTabs: TabBarItem[] = [
  {
    href: "/",
    label: "Budget",
    icon: ClipboardList,
  },
  {
    href: "/analysis",
    label: "Analysis",
    icon: ChartPie,
  },
  {
    href: "/growth",
    label: "Growth",
    icon: Sprout,
  },
  {
    href: "/settings",
    label: "Profile",
    icon: UserRound,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TabBar({ tabs = defaultTabs, className }: TabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main tabs"
      className={cn(
        "fixed bottom-0 w-full pb-6 border-t bg-background text-foreground",
        className,
      )}
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isActivePath(pathname, tab.href);

          return (
            <li key={tab.href} className="flex">
              <Link
                href={tab.href}
                className="relative flex w-full flex-col items-center gap-2 px-2 pb-3 pt-2"
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-6" aria-hidden />
                <H3 className="m-0 border-0 p-0 text-xs leading-none tracking-normal">
                  {tab.label}
                </H3>
                <span
                  className={cn(
                    "absolute bottom-0 h-1 w-8 rounded-full bg-primary transition-opacity duration-100",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
