"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Bookmark, Command, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/nav-user";
import type { TagGroup } from "@/types/database";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bookmark", label: "Bookmarks", icon: Bookmark },
];

interface AppSidebarProps {
  tagGroups: TagGroup[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  onTagClear: () => void;
  showUser?: boolean;
}

export function AppSidebar({
  tagGroups,
  selectedTags,
  onTagToggle,
  onTagClear,
  showUser = true,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const groups = React.useMemo(
    () => tagGroups.filter((group) => group.tags.length > 0),
    [tagGroups],
  );

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
          {showUser && (
            <NavUser
              user={{
                name: "Guest",
                email: "guest@techstackhub.dev",
                avatar: "/avatars/shadcn.jpg",
              }}
            />
          )}
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              Filter by Category
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
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="flex flex-col px-2 pb-4">
                  {groups.length === 0 && (
                    <div className="px-2 py-4 text-sm text-muted-foreground">
                      No tags found.
                    </div>
                  )}
                  <Accordion type="multiple" className="w-full">
                    {groups.map((group) => (
                      <AccordionItem
                        key={group.category.id}
                        value={group.category.id}
                      >
                        <AccordionTrigger className="px-2 py-2 text-sm">
                          <span className="flex items-center gap-2">
                            <span>{group.category.name}</span>
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[10px]"
                            >
                              {group.tags.length}
                            </Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="flex flex-col gap-2 px-2">
                            {group.tags.map((tag) => {
                              const isActive = selectedTags.includes(tag.id);
                              return (
                                <label
                                  key={tag.id}
                                  className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-sidebar-accent"
                                >
                                  <span className="flex items-center gap-2">
                                    <Checkbox
                                      checked={isActive}
                                      onCheckedChange={() =>
                                        onTagToggle(tag.id)
                                      }
                                    />
                                    <span>{tag.name}</span>
                                  </span>
                                  {isActive && (
                                    <Badge
                                      variant="secondary"
                                      className="h-4 px-1 text-[10px]"
                                    >
                                      ✓
                                    </Badge>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
