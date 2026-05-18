"use client";

import { AppSidebar } from "@/components/custom-ui/app-sidebar";
import { ContributeDialog } from "@/components/custom-ui/contribute-dialog";
import { DetailTech } from "@/components/custom-ui/detail-tech";
import { TechCard } from "@/components/custom-ui/tech-card";
import { TopNav } from "@/components/custom-ui/top-nav";
import { SidebarInset } from "@/components/ui/sidebar";
import { toggleBookmark } from "@/lib/actions/bookmark";
import { getTechs } from "@/lib/actions/tech";
import type { Tech } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface HomeFeedProps {
  initialTechs: Tech[];
  tags: { id: string; name: string }[];
  initialBookmarkedIds: string[];
  initialSearch: string;
  initialSelectedTags: string[];
  userId: string | null;
}

export function HomeFeed({
  initialTechs,
  tags,
  initialBookmarkedIds,
  initialSelectedTags,
  userId,
}: HomeFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(initialBookmarkedIds),
  );
  const [selectedTags, setSelectedTags] =
    useState<string[]>(initialSelectedTags);
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialTechs.length === 20);
  const [loading, setLoading] = useState(false);

  // Sync tag filter with URL
  const handleTagToggle = useCallback(
    (tagId: string) => {
      const next = selectedTags.includes(tagId)
        ? selectedTags.filter((t) => t !== tagId)
        : [...selectedTags, tagId];
      setSelectedTags(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next.length > 0) {
        params.set("tags", next.join(","));
      } else {
        params.delete("tags");
      }
      router.replace(`/?${params.toString()}`);
    },
    [selectedTags, searchParams, router],
  );

  const handleTagClear = useCallback(() => {
    setSelectedTags([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    router.replace(`/?${params.toString()}`);
  }, [searchParams, router]);

  // Reload when searchParams change (search or tags)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
    setSelectedTags(tags);
    setPage(0);
    setHasMore(true);
    getTechs({ search: q, tags }).then((data) => {
      setTechs(data);
      setHasMore(data.length === 20);
    });
  }, [searchParams]);

  // Infinite scroll load more
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const q = searchParams.get("q") ?? "";
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
    const next = page + 1;
    const more = await getTechs({ search: q, tags, page: next });
    setTechs((prev) => [...prev, ...more]);
    setPage(next);
    setHasMore(more.length === 20);
    setLoading(false);
  };

  // Bookmark toggle
  const handleBookmark = async (techId: string) => {
    if (!userId) {
      router.push("/bookmark");
      return;
    }
    // Optimistic update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(techId)) next.delete(techId);
      else next.add(techId);
      return next;
    });
    await toggleBookmark(techId);
  };

  return (
    <>
      <AppSidebar
        tags={tags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onTagClear={handleTagClear}
      />

      <SidebarInset className="flex flex-col">
        <TopNav onContribute={() => setContributeOpen(true)} />

        <main className="flex-1 p-6">
          {/* Hero Section */}
          <section className="mb-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
              {/* Left: ASCII Logo */}
              <div className="relative max-w-[320px] lg:max-w-[390px] overflow-hidden shrink-0">
                <pre className="text-[11px] lg:text-[13px] tracking-[-1px] leading-[125%] text-muted-foreground/30 select-none whitespace-pre font-[family-name:var(--font-geist-mono)]">
                  {`████████╗███████╗ ██████╗██╗  ██╗
╚══██╔══╝██╔════╝██╔════╝██║  ██║
   ██║   █████╗  ██║     ███████║
   ██║   ██╔══╝  ██║     ██╔══██║
   ██║   ███████╗╚██████╗██║  ██║
   ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝`}
                </pre>
                <pre className="absolute top-0 left-0 text-[11px] lg:text-[13px] tracking-[-1px] leading-[125%] text-foreground select-none whitespace-pre font-[family-name:var(--font-geist-mono)]">
                  {`████████ ███████  ██████ ██   ██
   ██    ██      ██      ██   ██
   ██    █████   ██      ███████
   ██    ██      ██      ██   ██
   ██    ███████  ██████ ██   ██`}
                </pre>
              </div>

              {/* Right: Description */}
              <div className="flex flex-col gap-3 pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Collection of Useful Technologies
                </p>
                <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                  Discover, save and share the best developer tools, libraries,
                  websites and GitHub repositories — curated by the community.
                </p>
              </div>
            </div>
          </section>

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
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="rounded-full border border-border px-6 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </SidebarInset>

      {/* Detail modal */}
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
