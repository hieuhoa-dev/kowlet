import { getTechs, type SortOption } from "@/lib/actions/tech";
import { getUserBookmarks } from "@/lib/actions/bookmark";
import { getTagGroups } from "@/lib/actions/tags";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { HomeFeed } from "./home-feed";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tags?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const selectedTags = params.tags
    ? params.tags.split(",").filter(Boolean)
    : [];
  const sort = (params.sort ?? "newest") as SortOption;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [techs, tagGroups, bookmarkedIds] = await Promise.all([
    getTechs({ search, tags: selectedTags, sort }),
    getTagGroups(),
    user ? getUserBookmarks(user.id) : Promise.resolve([]),
  ]);

  return (
    <HomeFeed
      initialTechs={techs}
      tagGroups={tagGroups}
      initialBookmarkedIds={bookmarkedIds}
      initialSearch={search}
      initialSort={sort}
      initialSelectedTags={selectedTags}
      userId={user?.id ?? null}
    />
  );
}
