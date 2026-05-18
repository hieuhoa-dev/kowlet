"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Bookmark, Command, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/nav-user";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bookmark", label: "Bookmarks", icon: Bookmark },
];

interface AppSidebarProps {
  tags: { id: string; name: string }[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  onTagClear: () => void;
}

export function AppSidebar({
  tags,
  selectedTags,
  onTagToggle,
  onTagClear,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const [filter, setFilter] = React.useState("");

  const visibleTags = React.useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [filter, tags]);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">TechStack Hub</span>
                    <span className="truncate text-xs">Explore</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      tooltip={{ children: label, hidden: false }}
                      onClick={() => setOpen(true)}
                      isActive={pathname === href}
                      className="px-2.5 md:px-2"
                      asChild
                    >
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: "Guest",
              email: "guest@techstackhub.dev",
              avatar: "/avatars/shadcn.jpg",
            }}
          />
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              Filter by Tag
            </div>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onTagClear}
              >
                Clear
              </Button>
            )}
          </div>
          <SidebarInput
            placeholder="Search tags..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="flex flex-col px-2">
                  {visibleTags.length === 0 && (
                    <div className="px-2 py-4 text-sm text-muted-foreground">
                      No tags found.
                    </div>
                  )}
                  {visibleTags.map((tag) => {
                    const isActive = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => onTagToggle(tag.id)}
                        className="flex w-full items-center justify-between border-b border-sidebar-border px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <span>{tag.name}</span>
                        {isActive && (
                          <Badge
                            variant="secondary"
                            className="h-4 px-1 text-[10px]"
                          >
                            ✓
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
