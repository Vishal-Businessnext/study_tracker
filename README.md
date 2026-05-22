# Study Tracker

A full-stack study preparation tracking app built with **Next.js 14 (App Router)**, **MongoDB/Mongoose**, **Tailwind CSS**, **JWT auth**, and local file uploads.

## Features

- Email/password auth with JWT (HTTP-only cookies) + bcrypt
- Roles: `user` and `admin`, protected routes via `middleware.js`
- Study sessions: subject, chapter, notes, hours, productivity, datetime, tags, attachment
- Date guard: only **today (up to current time)** or **yesterday** allowed
- Local uploads to `public/uploads/` via Multer-style handler (formidable-free, uses Web FormData). Supports JPG/PNG/WEBP/PDF up to 5 MB, sanitized + unique filenames, drag-and-drop, image preview
- Dashboard with daily/weekly/monthly/yearly totals, streaks, goal progress, recent uploads, upcoming + overdue reminders
- Analytics: Line, Bar, Pie (Chart.js / react-chartjs-2) + heatmap calendar
- Goals (daily/weekly/monthly) with completion tracking
- Reminders/notifications (overdue highlighting)
- Admin dashboard: user list, search, inactive filter, recent uploads, totals
- Pomodoro timer, tags, search & filter, dark/light mode, toast notifications, loading skeletons, PDF export, responsive sidebar layout
- Zod input validation, in-memory rate limiting, file-type/size validation

## Folder Structure

```
app/
  (app)/                # Authenticated app routes (sidebar layout)
    dashboard/ sessions/ analytics/ goals/ reminders/
    uploads/ pomodoro/ profile/ admin/
  api/
    auth/{login,register,logout,me}/
    sessions/[id]/
    goals/[id]/
    notifications/[id]/
    uploads/
    reports/
    admin/{users,overview}/
  login/  register/  page.js (landing)
components/             # Sidebar, ThemeProvider, StatCard, Charts, FileUpload
hooks/                  # useMe
services/               # api.js fetch wrapper
lib/                    # db, auth, middleware, utils
models/                 # Mongoose schemas
public/uploads/         # Local file storage
scripts/seed.js         # Seed data
middleware.js           # Route protection
```

## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment (copy and edit)
   ```bash
   cp .env.example .env
   # set MONGODB_URI and a strong JWT_SECRET
   ```
3. Start MongoDB (local or Atlas), then seed demo data
   ```bash
   npm run seed
   ```
   Demo credentials:
   - Admin: `admin@example.com` / `admin123`
   - User:  `demo@example.com`  / `demo1234`
4. Run dev server
   ```bash
   npm run dev
   ```
   Open <http://localhost:3000>.

## API Overview

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account, sets cookie |
| POST | `/api/auth/login` | Login, sets cookie |
| POST | `/api/auth/logout` | Clear cookie |
| GET/PATCH | `/api/auth/me` | Current user / update profile |
| GET/POST | `/api/sessions` | List / create study session (date-restricted) |
| GET/PATCH/DELETE | `/api/sessions/:id` | Manage a session |
| GET/POST | `/api/uploads` | List / upload file (5 MB, jpg/png/webp/pdf) |
| GET/POST | `/api/goals` | List / create goals |
| PATCH/DELETE | `/api/goals/:id` | Update / delete |
| GET/POST | `/api/notifications` | Reminders |
| PATCH/DELETE | `/api/notifications/:id` | Manage reminder |
| GET | `/api/reports` | Aggregated dashboard data |
| GET | `/api/admin/users` | (admin) list/search users, inactive filter |
| GET | `/api/admin/overview` | (admin) global stats |

## Security Notes

- Passwords hashed with bcrypt; JWTs signed with `JWT_SECRET`, stored as HTTP-only `sameSite=lax` cookies.
- Server-side validation with **Zod** on all writable endpoints.
- File uploads validated for MIME type + size, filenames sanitized, stored under `public/uploads/` with timestamped + randomized names.
- Simple in-process rate limiter on auth endpoints. For production, replace with Redis-backed limiter and put the app behind HTTPS.
- Role-checked admin routes via `requireAuth(req, ['admin'])`.

## Production

```bash
npm run build
npm start
```

Set `NODE_ENV=production` and use a process manager (PM2, Docker, etc.). Mount `public/uploads/` to persistent storage.
