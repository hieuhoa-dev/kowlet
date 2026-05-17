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
- Display saved technologies
- Search technologies
- Filter by tags

### 3. Contribution Request
Users can submit:
- website URL
- GitHub repository URL

The request will be sent to admins for review using Supabase Realtime.

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
- Fetch preview metadata (Server Action)
- Generate tags using AI (optional)
---

# Server Actions

Used for:
- submit contribution requests
- approve/reject notifications
- create/update/delete technologies
- fetch preview metadata
- AI tag generation
- 
# Routing Structure

```txt
/app
├── page.tsx
├── save
│   └── page.tsx (if not login, show login component)
├── admin
│   ├── page.tsx
│   └── notification/page.tsx
```
Protected Routes:
- /save
- /admin/*

# Database Schema
- tag: id, name (text, unique), created_at, updated_at
- tag_tech: id, tag_id, tech_id
- tech: id, name, slug, description, github_url, star, url, created_at, updated_at
- notification: id, user_id,status, url, github_url, created_at, updated_at
- bookmark: id, user_id, tech_id, created_at, updated_at

# Authentication

Supabase Auth:
- Login
- Register
- Logout

Roles:
- user
- admin

# Skill
Use if design admin  
- skill data-table-filters
