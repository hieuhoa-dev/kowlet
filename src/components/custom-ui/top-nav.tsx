"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

interface TopNavProps {
    onContribute: () => void;
}

export function TopNav({ onContribute }: TopNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString());
                if (value) {
                    params.set("q", value);
                } else {
                    params.delete("q");
                }
                router.replace(`${pathname}?${params.toString()}`);
            }, 500);
        },
        [pathname, router, searchParams]
    );

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />

            {/* Search */}
            <div className="relative flex flex-1 items-center gap-2 border-b border-border pb-0.5">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search technologies..."
                    defaultValue={searchParams.get("q") ?? ""}
                    onChange={handleSearch}
                    className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
                    /
                </kbd>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="outline" onClick={onContribute}>
                    Contribute
                </Button>
            </div>
        </header>
    );
}
