"use server";

import { cookies } from "next/headers";
import { getLinkPreview } from "link-preview-js";
import { createClient } from "@/lib/supabase/server";

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

export async function approveNotification(id: string) {
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

  const { error: createError } = await supabase.from("tech").insert({
    name,
    slug,
    description: preview.description ?? null,
    url: notification.url ?? null,
    github_url: notification.github_url ?? null,
    og_title: preview.title ?? null,
    og_description: preview.description ?? null,
    og_image: preview.images?.[0] ?? null,
    favicon: preview.favicons?.[0] ?? null,
  });

  if (createError) throw new Error(createError.message);

  const { error: updateError } = await supabase
    .from("notification")
    .update({ status: "approved" })
    .eq("id", id);

  if (updateError) throw new Error(updateError.message);
}

export async function rejectNotification(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("notification")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
