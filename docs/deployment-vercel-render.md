# Deploy: Vercel (frontends) + Render (API + PostgreSQL)

This guide assumes the **monorepo root** is connected to Git (GitHub/GitLab/Bitbucket). Hobby/free tiers have limits (cold starts, bandwidth); adjust as you grow.

## Architecture

| Piece | Host | Notes |
|--------|------|--------|
| Customer, Kitchen, Admin SPAs | **Vercel** (3 projects or 1 monorepo with 3 apps) | Build outputs static `dist/` |
| REST API | **Render** Web Service | Node process; set `PORT` from Render |
| PostgreSQL | **Render** managed Postgres | Use **Internal** URL for the API on Render |

Frontends call the API using `VITE_API_URL` (see `apps/*/src/config/env.ts`).

---

## Part 1 — Render PostgreSQL

1. In [Render Dashboard](https://dashboard.render.com) → **New** → **PostgreSQL**.
2. Name it (e.g. `qrmeal-db`), pick a region, choose the **Free** instance if available.
3. Create database. After provisioning, open the DB → **Connections**.
4. Copy **Internal Database URL** (recommended for the API running on Render in the same region).  
   - Format: `postgresql://user:password@host:5432/dbname`  
   - Keep this secret; you will paste it into the Web Service as `DATABASE_URL`.

---

## Part 2 — Render API (Web Service)

### 2.1 Create the service

1. **New** → **Web Service** → connect your Git repo.
2. **Root Directory**: `services/api`  
   (so Render only builds the API package.)
3. **Runtime**: Node (e.g. **20** or **22**).
4. **Build Command**:

   ```bash
   npm install && npx prisma generate
   ```

5. **Start Command**:

   ```bash
   npx prisma migrate deploy && npm run start
   ```

   This applies migrations on each deploy, then starts the server.

### 2.2 Environment variables (Web Service → **Environment**)

| Key | Value |
|-----|--------|
| `DATABASE_URL` | **Internal** Postgres URL from Part 1 |
| `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) — **not** the default dev secret |
| `NODE_ENV` | `production` |
| `PORT` | Usually **leave unset** — Render sets `PORT` automatically |

Optional: if installs omit devDependencies and `npm run start` fails (missing `tsx`), either set **Build** to `npm install` without production-only install, or move `tsx` to `dependencies` in `services/api/package.json`.

### 2.3 Deploy and get the API URL

1. Deploy. Wait until the service is **Live**.
2. Note the public URL, e.g. `https://qrmeal-api.onrender.com`.
3. Test: `GET https://your-api.onrender.com/health` — should return JSON with database connected.

**Seed (optional, once):** run locally against the **external** DB URL (from Render Postgres “External” connection), or use Render **Shell** with the same env:

```bash
cd services/api && npx prisma db seed
```

Use the external URL only from trusted networks; prefer one-off seed from CI or local with env file.

---

## Part 3 — Vercel (three frontends)

Repeat for **customer**, **kitchen**, and **admin**, or use Vercel monorepo detection (see below).

### Option A — Three separate Vercel projects (simplest)

For each app:

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import the same Git repo.
2. **Root Directory**:  
   - Customer: `apps/customer-web`  
   - Kitchen: `apps/kitchen-web`  
   - Admin: `apps/admin-web`
3. **Framework Preset**: Vite (or “Other” if needed).
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install` (default is fine for each app folder).

#### Environment variables (each project → **Settings** → **Environment Variables**)

| Name | Value | Environments |
|------|--------|---------------|
| `VITE_API_URL` | `https://your-api.onrender.com` (no trailing slash) | Production, Preview |

Redeploy after changing env vars.

### Option B — One Vercel project with multiple apps

Use Vercel’s [monorepo docs](https://vercel.com/docs/monorepos): add three “apps” in the dashboard with different root directories, or three projects linked to the same repo (same as Option A).

---

## Part 4 — Checklist

- [ ] Render Postgres created; `DATABASE_URL` on the Web Service uses **Internal** URL.
- [ ] API `/health` returns OK with database connected.
- [ ] All three Vercel projects have `VITE_API_URL` pointing to the **Render API URL** (HTTPS).
- [ ] Open each Vercel URL in the browser; customer/kitchen/admin should load and call the API.

---

## Important limitations (free tier)

### 1. Menu images (`/uploads`)

The API stores uploads under `services/api/uploads` on disk. On Render, **the filesystem is ephemeral**: files can be **lost on redeploy** or when the instance restarts.

**Options later:** Render **Persistent Disk** (paid), or **S3 / Cloudflare R2** / similar for production images.

### 2. Render free Web Service

The service **spins down after idle**; first request after sleep can take **30–60+ seconds**. Upgrade for always-on if needed.

### 3. CORS

The API uses open CORS (`cors()` with default). For stricter production rules, restrict `origin` to your three Vercel domains in `server.ts`.

### 4. Prisma migrations

Using `prisma migrate deploy` in the **Start Command** keeps the DB schema on deploy. Do **not** run `prisma migrate dev` on the server.

---

## Quick reference — URLs

| App | Vercel env |
|-----|------------|
| Customer | `VITE_API_URL=https://<your-api>.onrender.com` |
| Kitchen | same |
| Admin | same |

All three apps use the same `VITE_API_URL` value.
