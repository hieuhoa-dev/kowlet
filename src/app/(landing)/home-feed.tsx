"use client";

import { AppSidebar } from "@/components/custom-ui/app-sidebar";
import { ContributeDialog } from "@/components/custom-ui/contribute-dialog";
import { DetailTech } from "@/components/custom-ui/detail-tech";
import { TechCard } from "@/components/custom-ui/tech-card";
import { TopNav } from "@/components/custom-ui/top-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset } from "@/components/ui/sidebar";
import { toggleBookmark } from "@/lib/actions/bookmark";
import { getTechs, type SortOption } from "@/lib/actions/tech";
import type { TagGroup, Tech } from "@/types/database";
import { useRouter } from "next/navigation";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";

interface HomeFeedProps {
  initialTechs: Tech[];
  tagGroups: TagGroup[];
  initialBookmarkedIds: string[];
  initialSearch: string;
  initialSelectedTags: string[];
  initialSort: SortOption;
  userId: string | null;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  most_bookmarked: "Most bookmarked",
};

const SORT_KEYS: SortOption[] = ["newest", "oldest", "most_bookmarked"];

export function HomeFeed({
  initialTechs,
  tagGroups,
  initialBookmarkedIds,
  initialSearch,
  initialSelectedTags,
  initialSort,
  userId,
}: HomeFeedProps) {
  const router = useRouter();
  const [search] = useQueryState(
    "q",
    parseAsString.withDefault(initialSearch ?? ""),
  );
  const [selectedTags, setSelectedTags] = useQueryState(
    "tags",
    parseAsArrayOf(parseAsString).withDefault(initialSelectedTags),
  );
  const [sort, setSort] = useQueryState<SortOption>(
    "sort",
    parseAsStringEnum(SORT_KEYS).withDefault(initialSort),
  );

  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(initialBookmarkedIds),
  );
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialTechs.length === 20);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Tag toggle — sync with URL
  const handleTagToggle = useCallback(
    (tagId: string) => {
      const next = selectedTags.includes(tagId)
        ? selectedTags.filter((t) => t !== tagId)
        : [...selectedTags, tagId];
      setSelectedTags(next);
    },
    [selectedTags, setSelectedTags],
  );

  const handleTagClear = useCallback(() => {
    setSelectedTags([]);
  }, [setSelectedTags]);

  // Sort change — sync with URL
  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSort(value);
    },
    [setSort],
  );

  // Reload khi searchParams thay đổi (search, tags, sort)
  useEffect(() => {
    setPage(0);
    setHasMore(true);

    getTechs({ search, tags: selectedTags, sort }).then((data) => {
      setTechs(data);
      setHasMore(data.length === 20);
    });
  }, [search, selectedTags, sort]);

  // Infinite scroll load more
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const next = page + 1;
    const more = await getTechs({
      search,
      tags: selectedTags,
      sort,
      page: next,
    });
    setTechs((prev) => [...prev, ...more]);
    setPage(next);
    setHasMore(more.length === 20);
    setLoading(false);
  }, [hasMore, loading, page, search, selectedTags, sort]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Bookmark toggle
  const handleBookmark = async (techId: string) => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      next.has(techId) ? next.delete(techId) : next.add(techId);
      return next;
    });
    await toggleBookmark(techId);
  };

  return (
    <>
      <AppSidebar
        tagGroups={tagGroups}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onTagClear={handleTagClear}
        showUser={Boolean(userId)}
      />

      <SidebarInset className="flex flex-col">
        <TopNav onContribute={() => setContributeOpen(true)} />

        <main className="flex-1 p-6">
          {/* Hero */}
          <section className="mb-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
              <div className="relative font-mono text-[11px] leading-[125%] lg:text-[13px] font-[family-name:var(--font-geist-mono)]">
                {/* Background Layer (Muted) */}
                <pre className="text-muted-foreground/30 whitespace-pre select-none ">
                  {`████████╗███████╗  ██████╗██╗  ██╗
╚══██╔══╝██╔════╝ ██╔════╝██║  ██║
   ██║   █████╗   ██║     ███████║
   ██║   ██╔══╝   ██║     ██╔══██║
   ██║   ███████╗ ╚██████╗██║  ██║
   ╚═╝   ╚══════╝  ╚═════╝╚═╝  ╚═╝`}
                </pre>

                {/* Foreground Layer (Highlight) */}
                <pre className="absolute top-0 left-0 text-foreground whitespace-pre select-none ">
                  {`████████ ███████   ██████ ██   ██ 
   ██    ██       ██      ██   ██ 
   ██    █████    ██      ███████ 
   ██    ██       ██      ██   ██ 
   ██    ███████   ██████ ██   ██ 
                                 `}
                </pre>
              </div>
              <div className="flex flex-col gap-3 pt-1">
                <p className="text-2xl font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Collection of Useful Technologies
                </p>
                <p className="max-w-xl text-xl text-muted-foreground leading-relaxed">
                  Discover, save and share the best developer tools, libraries,
                  websites and GitHub repositories — curated by the community.
                </p>
              </div>
            </div>
          </section>

          {/* Sort bar */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-base font-medium">
              List technologies:{" "}
              <span className="text-muted-foreground">
                {techs.length > 0 ? `${techs.length}+ technologies` : ""}
              </span>
            </p>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="h-8 w-[170px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {SORT_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tech Grid */}
          {techs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="text-muted-foreground">No technologies found.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {techs.map((tech) => (
                  <TechCard
                    key={tech.id}
                    tech={tech}
                    isBookmarked={bookmarkedIds.has(tech.id)}
                    onBookmark={handleBookmark}
                    onClick={setSelectedTech}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <div
                    ref={loadMoreRef}
                    className="text-sm text-muted-foreground"
                  >
                    {loading ? "Loading..." : "Loading more..."}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </SidebarInset>

      <DetailTech
        tech={selectedTech}
        items={techs}
        onClose={() => setSelectedTech(null)}
        onNavigate={setSelectedTech}
      />

      <ContributeDialog
        open={contributeOpen}
        onOpenChange={setContributeOpen}
      />
    </>
  );
}
