# AgenteTerra

Universal real-estate listings and location services built with Next.js, PostgreSQL/PostGIS, Redis, MinIO, and a Go background worker.

## Phase 1 Status

The first classifieds workflow is implemented:

- Browse property listings with URL-based filters for minimum perches, maximum square feet, and minimum road width.
- Register and log in with a password-protected account.
- Publish an ad with location, size, access, price, and currency details.
- Queue newly published listings for background enrichment through Redis.

After pulling the Phase 1 schema changes, run `npm run db:migrate` once before starting the app.

## Prerequisites

- Node.js and npm
- Docker Desktop with Docker Compose
- Go (only needed to run the background worker)

## Feature Configuration

Copy `.env.example` to `.env.local` and switch features with `true` or `false` values. Phase 1 features are enabled by default; future features are disabled until their implementation is ready.

```powershell
Copy-Item .env.example .env.local
```

| Variable                   | Default | Controls                                     |
| -------------------------- | ------- | -------------------------------------------- |
| `FEATURE_LISTING_SEARCH`   | `true`  | Perches, square feet, and road-width filters |
| `FEATURE_USER_ACCOUNTS`    | `true`  | Registration, login, and sessions            |
| `FEATURE_LISTING_POSTING`  | `true`  | Authenticated ad publishing                  |
| `FEATURE_PROPERTY_IMAGES`  | `true`  | Property photos stored in MinIO              |
| `FEATURE_REDIS_ENRICHMENT` | `true`  | Queueing listing enrichment jobs             |
| `FEATURE_MAPS`             | `false` | Future maps and accessibility features       |
| `FEATURE_ANALYTICS`        | `false` | Future market analytics                      |
| `FEATURE_AI_REPORTS`       | `false` | Future buyer reports                         |

## Quick Start (PowerShell)

Run these commands from the repository root:

```powershell
cd D:\monqio\AgenteTerra
npm install
docker compose up -d

$env:DATABASE_URL = "postgres://postgres:change-me@localhost:5432/realestate?sslmode=disable"
$env:REDIS_URL = "redis://localhost:6379"
$env:AUTH_SECRET = "replace-this-with-a-long-random-value"

npm run db:migrate
npm run dev
```

Open http://localhost:3000 after Next.js starts.

The `DATABASE_URL` assignment is required in each new PowerShell terminal. It matches the default PostgreSQL credentials in `docker-compose.yml`.

## Roles and Listing Permissions

New accounts receive the `user` role. Users can create listings, manage their own listings from **Your listings**, and browse the full marketplace. Admins can manage every listing at `/admin`.

To grant the first admin, register that account, then run this database command from the repository root, replacing the email:

```powershell
docker compose exec -T postgres psql -U postgres -d realestate -c "UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';"
```

Role changes are only made through the database by an operator; registration forms cannot grant admin access. Apply migrations before promoting an account.

## Run the Worker

The worker processes jobs from Redis and updates enriched listings. Start it in a second PowerShell terminal while the infrastructure is running:

```powershell
cd D:\monqio\AgenteTerra\worker
$env:DATABASE_URL = "postgres://postgres:change-me@localhost:5432/realestate?sslmode=disable"
$env:REDIS_URL = "redis://localhost:6379"
$env:AUTH_SECRET = "replace-this-with-a-long-random-value"

go run .
```

## Useful Commands

Run from the repository root:

```powershell
npm run dev       # Start the Next.js development server
npm run build     # Create a production build
npm run start     # Start the production build
npm run db:migrate
npm run db:generate
docker compose ps
docker compose logs postgres
```

Load sample listings for UI development:

```powershell
Get-Content -Raw db/seed.sql | docker compose exec -T postgres psql -U postgres -d realestate
```

The seed is idempotent by listing title, so it can be run again without duplicating the sample rows.

## Local Services

| Service            | URL or address        | Default credentials         |
| ------------------ | --------------------- | --------------------------- |
| Next.js            | http://localhost:3000 | -                           |
| PostgreSQL/PostGIS | `localhost:5432`      | `postgres` / `change-me`    |
| Redis              | `localhost:6379`      | -                           |
| MinIO API          | http://localhost:9000 | `minioadmin` / `minioadmin` |
| MinIO console      | http://localhost:9001 | `minioadmin` / `minioadmin` |

Property photos use the local MinIO bucket configured by `S3_BUCKET`. The listing form uses MapLibre with OpenFreeMap tiles and Photon reverse geocoding: click the map, edit the coordinates, or use the browser location button. The server rejects coordinates outside valid latitude/longitude ranges.

## Troubleshooting

### `npm run db:migrate` exits immediately

Set `DATABASE_URL` in the same terminal before running the migration:

```powershell
$env:DATABASE_URL = "postgres://postgres:change-me@localhost:5432/realestate?sslmode=disable"
npm run db:migrate
```

If the database is not ready yet, check its status and logs:

```powershell
docker compose ps
docker compose logs postgres
```

Then retry the migration after PostgreSQL reports that it is ready.

### Restart local infrastructure

To stop containers while preserving their data:

```powershell
docker compose down
```

To remove containers and their stored data, including the database:

```powershell
docker compose down -v
```
