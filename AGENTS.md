# AGENT.md

## Project Overview

TechStack Hub is a modern full-stack web application for discovering, saving, and managing useful technologies, developer tools, websites, and GitHub repositories.

The platform allows users to:
- Browse technologies/tools
- Search and filter by tags
- Save favorite technologies
- Submit technology contributions
- Preview website metadata automatically

Admins can:
- Manage technologies
- Review contribution requests
- Monitor realtime notifications

---

# Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Zustand
- nuqs (query string state management)

## Backend
- Supabase
    - Auth
    - PostgreSQL Database
    - Realtime
    - Storage

## Additional Libraries
- link-preview-js
- React Hook Form
- Zod
- TanStack Query (optional)

---

# Main Features

## Public/User Features

### 1. Technology Feed (`/`)
- Display technologies as cards 
- Infinite scrolling / lazy loading
- Search by:
    - name
    - description
    - url
- Filter by tags
- Preview website metadata
- Save favorite technologies
- Server-side fetch for initial technologies and tags

### 2. Saved Technologies (`/bookmark`)
- If user is **not logged in**: show login UI inline on the page (do not redirect)
- Display saved technologies
- Search technologies
- Filter by tags

### 3. Contribution Request
Users can submit at least one information fields in a single request:
- website URL
- GitHub repository URL

The request will be sent to admins via:
- Supabase Realtime (live notification in admin panel)
- Email notification

After admin **rejects**: no notification is sent to the user.

---

# Admin Features

## 1. Admin Dashboard (`/admin`)
Technology management dashboard:
- Create technology
- Update technology
- Delete technology
- View technologies in table format

## 2. Contribution Notifications (`/admin/notification`)
Realtime contribution request management:
- Receive realtime requests
- Display requests in table format
- Open detail sheet/modal
- Approve or reject requests

When approved:
- Automatically create a technology record
- Fetch preview metadata via Server Action (OG image, title, description) and **save to `tech` table**
---

# Server Actions

Used for:
- submit contribution requests
- approve/reject notifications
- create/update/delete technologies
- fetch preview metadata (only on contribution approval)

# Routing Structure

```txt
/app
├── page.tsx
├── bookmark
│   └── page.tsx (if not logged in, show login UI inline)
├── admin
│   ├── page.tsx
│   └── notification/page.tsx
```
Protected Routes:
- /bookmark (soft-protected: shows login UI inline)
- /admin/*

# Database Schema
- tag: id, name (text, unique), created_at, updated_at
- tag_tech: id, tag_id, tech_id
- tech: id, name, slug, description, github_url, **bookmark_count** (int, count from bookmark table), url, og_image, og_title, og_description, favicon, created_at, updated_at
- notification: id, user_id, status, url, github_url, created_at, updated_at
- bookmark: id, user_id, tech_id, created_at, updated_at
- profile: id (references auth.users), role (text: 'user' | 'admin'), created_at, updated_at

# Authentication

Supabase Auth:
- Login
- Register
- Logout

Roles are managed via a separate **`profile`** table:
- `profile.role = 'user'` — regular user
- `profile.role = 'admin'` — admin

Role is checked server-side (Server Action / middleware) by querying the `profile` table.

# UI / UX Layout

## Layout Structure

* **Sidebar (Desktop):** Contains tag filters and navigation links.
* **Sidebar → Drawer (Mobile):** The sidebar collapses into a bottom or side drawer navigation.
* **Search Input:** Features a **500ms debounce** to optimize performance.

---

## Layout Breakdown

### 🖥️ Header (Hero Section)

Divided into an **asymmetric 2-column layout**:

* **Left Column (Branding):** * A large-sized **"TechStackHub"** logo using a chunky/display font with a double-border effect for visual emphasis.
* *Example (Design inspired by skills.sh but with customized content):*



```html
<div class="relative max-w-[320px] lg:max-w-[390px] overflow-hidden"><pre class="text-[12px] lg:text-[15px] tracking-[-1px] leading-[125%] text-(--ds-gray-700) select-none whitespace-pre font-[family-name:'Fira_Mono']">███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝</pre><pre class="absolute top-0 left-0 text-[12px] lg:text-[15px] tracking-[-1px] leading-[125%] text-foreground select-none whitespace-pre font-[family-name:'Fira_Mono']">
███████ ██   ██ ██ ██      ██      ███████
██      ██  ██  ██ ██      ██      ██
███████ █████   ██ ██      ██      ███████
     ██ ██  ██  ██ ██      ██           ██
███████ ██   ██ ██ ███████ ███████ ███████
                                           </pre></div>

```

* **Sub-slogan below:** `"COLLECTION OF USEFUL TECHNOLOGIES"` rendered in a fully capitalized sans-serif font.
* **Right Column (Introduction):**
* A short paragraph explaining the product. It utilizes a light gray **secondary text color** to reduce visual weight compared to the main logo, establishing a cleaner visual hierarchy.



---

### ⚙️ Quick Actions (Action & Integrations Section)

Divided into two distinct functional areas:

* **Left Side ("Contribute" Button):** [Insert action details here]
* **Right Side ("Bookmark" Button):** [Insert integration details here]

---

### 🔍 Search Bar

* **Minimalist Design:** Features a borderless input layout that only uses a bottom accent line (`border-bottom`) rather than a full bounding box.
* **UX Enhancements:** Includes a magnifying glass icon on the left and a `/` keyboard shortcut hint on the right (a highly popular and intuitive UX pattern for developer platforms).

## Technology Card
- Clicking a card opens a **detail sheet/modal** (renders `detail-tech.tsx`)

# Skill
Use if design admin
- skill data-table-filters
