"use client";

import { AppSidebar } from "@/components/custom-ui/app-sidebar";
import { ContributeDialog } from "@/components/custom-ui/contribute-dialog";
import { DetailTech } from "@/components/custom-ui/detail-tech";
import { TechCard } from "@/components/custom-ui/tech-card";
import { TopNav } from "@/components/custom-ui/top-nav";
import { SidebarInset } from "@/components/ui/sidebar";
import { toggleBookmark } from "@/lib/actions/bookmark";
import type { TagGroup, Tech } from "@/types/database";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";

interface BookmarkFeedProps {
  initialTechs: Tech[];
  tagGroups: TagGroup[];
  initialBookmarkedIds: string[];
  initialSearch: string;
  initialSelectedTags: string[];
  userId: string;
}

function matchesSearch(tech: Tech, query: string) {
  const value = query.toLowerCase();
  return [
    tech.name,
    tech.description,
    tech.url,
    tech.github_url,
    tech.og_title,
    tech.og_description,
  ]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(value));
}

export function BookmarkFeed({
  initialTechs,
  tagGroups,
  initialBookmarkedIds,
  initialSearch,
  initialSelectedTags,
}: BookmarkFeedProps) {
  const [search] = useQueryState(
    "q",
    parseAsString.withDefault(initialSearch ?? ""),
  );
  const [selectedTags, setSelectedTags] = useQueryState(
    "tags",
    parseAsArrayOf(parseAsString).withDefault(initialSelectedTags),
  );

  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(initialBookmarkedIds),
  );
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);

  const filteredTechs = useMemo(() => {
    const query = search.trim();
    const selected = selectedTags;

    return techs.filter((tech) => {
      if (selected.length > 0) {
        const techTagIds = tech.tags?.map((tag) => tag.id) ?? [];
        if (!selected.some((tagId) => techTagIds.includes(tagId))) {
          return false;
        }
      }

      if (query) {
        return matchesSearch(tech, query);
      }

      return true;
    });
  }, [techs, search, selectedTags]);

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

  const handleBookmark = async (techId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(techId)) next.delete(techId);
      else next.add(techId);
      return next;
    });

    await toggleBookmark(techId);

    setTechs((prev) => prev.filter((tech) => tech.id !== techId));
    if (selectedTech?.id === techId) {
      setSelectedTech(null);
    }
  };

  return (
    <>
      <AppSidebar
        tagGroups={tagGroups}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onTagClear={handleTagClear}
      />

      <SidebarInset className="flex flex-col">
        <TopNav onContribute={() => setContributeOpen(true)} />

        <main className="flex-1 p-6">
          <section className="mb-8">
            <h1 className="text-2xl font-bold">Your bookmarks</h1>
            <p className="text-sm text-muted-foreground">
              {filteredTechs.length} saved technologies
            </p>
          </section>

          {filteredTechs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="text-muted-foreground">No bookmarks found.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTechs.map((tech) => (
                <TechCard
                  key={tech.id}
                  tech={tech}
                  isBookmarked={bookmarkedIds.has(tech.id)}
                  onBookmark={handleBookmark}
                  onClick={setSelectedTech}
                />
              ))}
            </div>
          )}
        </main>
      </SidebarInset>

      <DetailTech
        tech={selectedTech}
        items={filteredTechs}
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
