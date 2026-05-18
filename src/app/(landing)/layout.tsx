"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
