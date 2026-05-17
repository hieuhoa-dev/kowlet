"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bookmark, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/bookmark", label: "Bookmark", icon: Bookmark },
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

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-border px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    TechStack Hub
                </span>
            </SidebarHeader>

            <SidebarContent>
                {/* Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton asChild isActive={pathname === href}>
                                        <Link href={href}>
                                            <Icon className="h-4 w-4" />
                                            <span>{label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Tag filters */}
                <SidebarGroup>
                    <div className="flex items-center justify-between px-2 py-1">
                        <SidebarGroupLabel className="p-0">Filter by Tag</SidebarGroupLabel>
                        {selectedTags.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-1 py-0 text-xs text-muted-foreground"
                                onClick={onTagClear}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    <SidebarGroupContent>
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="flex flex-col gap-0.5 px-2">
                                {tags.map((tag) => {
                                    const isActive = selectedTags.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => onTagToggle(tag.id)}
                                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <span>{tag.name}</span>
                                            {isActive && (
                                                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
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
    );
}
