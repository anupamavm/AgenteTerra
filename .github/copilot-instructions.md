Universal Real Estate Stack: Repository Instructions
Architecture & Technology Stack
Web App: Next.js App Router (TypeScript, Tailwind CSS, Server Actions).
ORM & DB: Drizzle ORM connected to PostgreSQL 16 with PostGIS 3.4 (`geometry(Point, 4326)`).
Message Broker: Redis 7 (leveraging `ioredis` in Next.js and `go-redis` in Go).
Background Engine: Standalone Go worker binary processing asynchronous payloads from Redis queues.
Storage: Self-hosted MinIO container (S3-compatible object store).
Engineering Guardrails & Strict Rules
Zero BaaS Dependencies: Exclude all managed backend-as-a-service libraries, platforms, and third-party authentication abstractions (No Supabase, Firebase, AWS Amplify, or hosted Auth providers).
Region-Agnostic Core: Keep database schemas, financial numbers, and spatial metrics completely parameterizable. Support multiple sizing units (`sqft`, `perch`, `sqm`, `acre`) and arbitrary global currencies (`USD`, `EUR`, `LKR`, `AED`, etc.).
Asynchronous Offloading: Never execute long-running GIS computations, external geocoding, or heavy file pipelines inline within Next.js Server Actions or API routes. Dispatch structured job payloads directly into the Redis queue (`enrichment_queue`).
PostGIS Spatial Integrity: Execute radius calculations and geo-fencing via `ST_DWithin` utilizing explicit geography casting and SRID 4326 (`ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography`).
Spatial Indexing: Maintain spatial GIST indexes on all PostGIS geometry columns to guarantee sub-millisecond bounding box and radius queries.

---

Phased Implementation Roadmap
Phase 1: Core Classifieds & Marketplace Launch
Implement Next.js App Router layout, design system (Tailwind CSS), self-hosted user registration/session handling, and ad posting workflows.
Build advanced search and filtering components supporting land dimensions (Perches, Square Feet, Square Meters, Acres) and road width parameters.
Deploy containerized infrastructure (`postgres`, `redis`, `minio`) via Docker Compose optimized for a standard $10–$20 VPS node.
Phase 2: Asynchronous Enrichment & Map Integrations
Wire Next.js action producers to push background tasks into Redis upon property creation.
Build out the Go worker daemon (`go-redis` + `lib/pq`) to handle concurrent blocking queue consumption (`BLPop`).
Integrate external mapping and spatial APIs (e.g., routing services, distance metrics to highways or critical infrastructure) asynchronously inside background routines, persisting computed metadata back to PostgreSQL.
Phase 3: Analytical Aggregations & Market Indexing
Implement scheduled background scripts or cron jobs to compute rolling statistical indexes (e.g., daily price-per-perch/sqft benchmarks across regions).
Store structured trend indicators to power interactive market charts and historical price movement dashboards.
Phase 4: AI Dossiers & Automated Reporting
Extract enriched property listings, spatial footprints, and regional pricing aggregates from PostgreSQL.
Stream structured datasets to LLM endpoints (Claude / OpenAI) to generate comprehensive, downloadable AI buyer reports and automated property dossiers.
