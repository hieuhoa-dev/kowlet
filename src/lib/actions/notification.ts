"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLinkPreview } from "link-preview-js";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/database";

type PreviewData = {
  title?: string;
  description?: string;
  images?: string[];
  favicons?: string[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function deriveNameFromUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname.includes("github.com") && pathname.split("/").length >= 3) {
      return pathname.replace(/^\//, "").replace(/\/$/, "");
    }
    return hostname.replace(/^www\./, "");
  } catch {
    return "Untitled";
  }
}

async function fetchPreview(url: string): Promise<PreviewData> {
  try {
    const preview = (await getLinkPreview(url, {
      followRedirects: "follow",
    })) as PreviewData;
    return preview;
  } catch {
    return {};
  }
}

export async function approveNotification(id: string, tagIds: string[] = []) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: notification, error: notifError } = await supabase
    .from("notification")
    .select("*")
    .eq("id", id)
    .single();

  if (notifError) throw new Error(notifError.message);
  if (!notification) return;

  const sourceUrl = (notification.url ?? notification.github_url ?? "").trim();
  if (!sourceUrl) throw new Error("Notification has no URL to approve.");

  const preview = await fetchPreview(sourceUrl);
  const name = preview.title?.trim() || deriveNameFromUrl(sourceUrl);
  const slug = slugify(name) || slugify(deriveNameFromUrl(sourceUrl));

  const { data: createdTech, error: createError } = await supabase
    .from("tech")
    .insert({
    name,
    slug,
    description: preview.description ?? null,
    url: notification.url ?? null,
    github_url: notification.github_url ?? null,
    og_title: preview.title ?? null,
    og_description: preview.description ?? null,
    og_image: preview.images?.[0] ?? null,
    favicon: preview.favicons?.[0] ?? null,
    })
    .select("id")
    .single();

  if (createError) throw new Error(createError.message);

  if (tagIds.length > 0 && createdTech?.id) {
    const rows = tagIds.map((tagId) => ({
      tag_id: tagId,
      tech_id: createdTech.id,
    }));

    const { error: tagError } = await supabase.from("tag_tech").insert(rows);
    if (tagError) throw new Error(tagError.message);
  }

  const { error: updateError } = await supabase
    .from("notification")
    .update({ status: "approved" })
    .eq("id", id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/admin/notification");
}

export async function rejectNotification(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("notification")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/notification");
}

export async function getAdminNotifications({
  status,
  page,
  limit,
}: {
  status: "all" | "pending" | "approved" | "rejected";
  page: number;
  limit: number;
}): Promise<{ notifications: Notification[]; total: number }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("notification")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const start = page * limit;
  const end = start + limit - 1;
  const { data, count, error } = await query.range(start, end);
  if (error) throw new Error(error.message);

  return { notifications: (data ?? []) as Notification[], total: count ?? 0 };
}
