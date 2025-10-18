import type { Component } from "vue";
import { Gauge, KeySquare, ShieldCheck, Users } from "lucide-vue-next";

export type NavItem = {
  title: string;
  to: string;
  icon: Component;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    to: "/dashboard",
    icon: Gauge,
  },
  {
    title: "Users",
    to: "/users",
    icon: Users,
  },
  {
    title: "Roles",
    to: "/roles",
    icon: ShieldCheck,
  },
  {
    title: "Permissions",
    to: "/permissions",
    icon: KeySquare,
  },
];
