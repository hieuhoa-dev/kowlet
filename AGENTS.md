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
- **Sidebar** (desktop): contains tag filters + navigation links
- **Sidebar → Drawer** (mobile): sidebar collapses into a bottom/side drawer
- search input with **500ms debounce**
- Bố cục chi tiết (Layout Breakdown)
Phần Header (Hero Section)
Được chia thành 2 cột không đối xứng (Asymmetric 2-column layout):

Cột trái (Thương hiệu): Logo "TechStackHub" kích thước lớn, font chữ dạng khối dày (Chunky/Display font) có viền kép tạo điểm nhấn.
Đây là 1 vd: (thiết kế lấy cảm hứng từ skill.sh nhưng thay đổi nội dung)
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

Slogan phụ bên dưới: "COLLECTION OF USEFUL TECHNOLOGIES" bằng font chữ không chân (Sans-serif) viết hoa hoàn toàn.

Cột phải (Giới thiệu):

Đoạn văn ngắn giải thích sản phẩm. Chữ màu xám nhẹ (Secondary text color) để giảm bớt độ nổi bật so với logo, giúp phân cấp thị giác tốt hơn.

Phần Tương tác nhanh (Action & Integrations)
Chia làm 2 khu vực chức năng rõ ràng:

Bên trái nút ("Contribute"):

Bên phải nút ("Bookmark"): 


Thanh tìm kiếm (Search Bar): * Thiết kế tối giản: Chỉ gồm một đường kẻ ngang phía dưới (Border-bottom), không có khung viền bao quanh.

Có icon kính lúp bên trái và gợi ý phím tắt / ở góc phải (một pattern UX rất phổ biến cho dev

## Technology Card
- Clicking a card opens a **detail sheet/modal** (renders `detail-tech.tsx`)

# Skill
Use if design admin
- skill data-table-filters
