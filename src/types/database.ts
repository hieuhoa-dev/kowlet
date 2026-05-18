export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// ─── Row types ────────────────────────────────────────────────

export interface TagCategory {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    sort_order: number;
    created_at: string;
}

export interface Tag {
    id: string;
    name: string;
    icon: string | null;
    category_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface TagTech {
    id: string;
    tag_id: string;
    tech_id: string;
}

export interface Tech {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    github_url: string | null;
    url: string | null;
    og_image: string | null;
    og_title: string | null;
    og_description: string | null;
    favicon: string | null;
    bookmark_count: number;
    created_at: string;
    updated_at: string;
    // joined
    tags?: Tag[];
}

export interface Notification {
    id: string;
    user_id: string;
    status: "pending" | "approved" | "rejected";
    url: string | null;
    github_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Bookmark {
    id: string;
    user_id: string;
    tech_id: string;
    created_at: string;
    updated_at: string;
}

export interface Profile {
    id: string;
    role: "user" | "admin";
    created_at: string;
    updated_at: string;
}

// ─── Grouped tags for sidebar ─────────────────────────────────
export interface TagGroup {
    category: TagCategory;
    tags: Tag[];
}
