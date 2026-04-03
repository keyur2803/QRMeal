# QRMEAL Runbook

## Project Structure

```
QRMEAL-Design/
├── apps/                          ← Frontend React apps
│   ├── customer-web/              (port 5173)
│   ├── kitchen-web/               (port 5174)
│   └── admin-web/                 (port 5175)
├── services/
│   └── api/                       ← Express + Prisma backend (port 4000)
├── infra/                         ← Docker Compose, deploy configs
├── docs/                          ← Product docs, API spec, design-system mockups
├── tsconfig.base.json             ← Shared TS config (all apps extend this)
└── package.json                   ← Monorepo workspace root
```

Each frontend follows: `config/ → types/ → api/ → lib/ → hooks/ → components/ → pages/`

Backend follows: `config/ → db/ → domain/ → repositories/ → services/ → middleware/ → routes/`

## Database

Use **one** of the following.

### A. Local PostgreSQL (no Docker)

1. Install [PostgreSQL](https://www.postgresql.org/download/windows/) (or `winget install PostgreSQL.PostgreSQL`) and note the port (default **5432**).
2. Create a role and database (see **DBeaver steps** below, or run in **psql** / pgAdmin as a superuser, e.g. `postgres`):
   ```sql
   CREATE USER qrmeal WITH PASSWORD 'qrmeal';
   CREATE DATABASE qrmeal OWNER qrmeal;
   ```
   Use a stronger password in real environments and put it in `DATABASE_URL`.

   **DBeaver (you already have it installed)**  
   - Open DBeaver → **Database** → **New Database Connection** → choose **PostgreSQL** → **Next**.  
   - **Host**: `localhost` · **Port**: `5432` (or the port you chose at install) · **Database**: `postgres` (default maintenance DB).  
   - **Authentication**: **Database Native** · **Username**: `postgres` (or your superuser) · **Password**: the password you set when installing PostgreSQL.  
   - **Test Connection** — if drivers are missing, let DBeaver download them — then **Finish**.  
   - In the navigator, right‑click your connection → **SQL Editor** → **New SQL Script**. Paste and run:
     ```sql
     CREATE USER qrmeal WITH PASSWORD 'qrmeal';
     CREATE DATABASE qrmeal OWNER qrmeal;
     ```
   - Optional: **New Database Connection** again with **Database** `qrmeal`, **Username** `qrmeal`, **Password** `qrmeal` to confirm login works.

   **Forgot the `postgres` password? (Windows)**  
   You can set a new one without knowing the old password:
   1. Stop the PostgreSQL service: **Win + R** → `services.msc` → find **postgresql** (name like `postgresql-x64-16`) → **Stop**.
   2. Open **`pg_hba.conf`** (often `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`). Back up the file, then find the line for **`127.0.0.1/32`** (IPv4 localhost). Change the last column from **`scram-sha-256`** or **`md5`** to **`trust`** for that line only. Save.
   3. **Start** the PostgreSQL service again.
   4. Connect with DBeaver (or `psql`) to `localhost` / database `postgres` / user **`postgres`** — leave the password **empty** or anything; auth is temporarily ignored for that host.
   5. Run: `ALTER USER postgres WITH PASSWORD 'your-new-password';` (pick a real password and remember it).
   6. **Revert** `pg_hba.conf` to **`scram-sha-256`** (or **`md5`**) as it was, save, and **restart** the PostgreSQL service once more.
   7. Connect in DBeaver using the **new** password.

3. Copy `services/api/.env.example` → `services/api/.env` and set `DATABASE_URL`, for example:
   ```
   DATABASE_URL="postgresql://qrmeal:qrmeal@localhost:5432/qrmeal"
   ```
   If your install uses a different user/password, adjust the URL accordingly.

### B. Docker Postgres (optional)

Compose maps the container to **host port 5433** so it does not conflict with a local PostgreSQL on 5432.

1. Set `DATABASE_URL` in `services/api/.env` to:
   ```
   postgresql://qrmeal:qrmeal@localhost:5433/qrmeal
   ```
2. Start Postgres: `docker compose -f infra/docker-compose.yml up -d`

### Apply schema and run API

From the repo root (after `DATABASE_URL` is set).

**`prisma migrate dev`** (the `db:migrate` script) needs a **shadow database**. If your DB user cannot create databases (`permission denied to create database` / P3014), use **deploy** instead, or grant the role the right to create DBs:

- **Option 1 — no extra Postgres privileges (recommended for `qrmeal` user):** apply existing migration files without a shadow DB:

  ```bash
  npm run db:migrate:deploy --workspace services/api
  npm run db:seed --workspace services/api
  ```

- **Option 2 — keep using `migrate dev`:** connect as a superuser (e.g. `postgres`) in DBeaver and run `ALTER USER qrmeal CREATEDB;`, then:

  ```bash
  npm run db:migrate --workspace services/api
  npm run db:seed --workspace services/api
  ```

Then start the API and frontends.

## Start Services

1. Ensure PostgreSQL is running and `services/api/.env` exists with a valid `DATABASE_URL` (see **Database** above).
2. Apply migrations and seed if you have not already (commands in **Apply schema and run API**).
3. Start API: `npm run dev:api`
4. Start frontends (each in a separate terminal):
   ```bash
   npm run dev:customer   # http://localhost:5173
   npm run dev:kitchen    # http://localhost:5174
   npm run dev:admin      # http://localhost:5175
   ```

## Verify Everything Compiles

```bash
npm run verify   # runs typecheck + build for all apps
```

## Health Checks

- API: `GET http://localhost:4000/health`
- DB connectivity is logged on API startup

## Production deploy (Vercel + Render)

See **[deployment-vercel-render.md](./deployment-vercel-render.md)** for step-by-step: PostgreSQL and API on Render, three SPAs on Vercel, env vars, and caveats.

## Incident Steps

1. Verify API health and recent deployments
2. Check database availability
3. Revert latest release if order creation/status is broken
4. Export logs and create postmortem
