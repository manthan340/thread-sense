# Thread Sense

Personal style closet: upload garments to MinIO, tag them with controlled taxonomies, and keep everything scoped to your account.

## Stack

- **apps/web** — Next.js (App Router)
- **apps/api** — NestJS + Prisma
- **PostgreSQL** — users, auth tokens, image metadata/tags
- **MinIO** — image object storage
- **Mailpit** — local SMTP inbox for verification / password-reset emails

## Quick start

### 1. Start infrastructure

```bash
npm run docker:up
```

> Uses `docker-compose`. Postgres is published on **5433** to avoid clashing with a local Postgres on 5432.

| Service    | URL / port                                      |
|------------|--------------------------------------------------|
| Postgres   | `localhost:5433` (user/pass/db: `thread`/`thread`/`thread_sense`) |
| MinIO API  | http://localhost:9000                            |
| MinIO UI   | http://localhost:9001 (`minioadmin` / `minioadmin`) |
| Mailpit UI | http://localhost:8025                            |

### 2. Install & migrate

```bash
npm install
cp apps/api/.env.example apps/api/.env   # or use the committed local .env template values from .env.example
npm run prisma:generate
npm run prisma:migrate
```

From `apps/api`, the migrate command is interactive the first time; use:

```bash
npm run prisma:migrate -w @thread-sense/api -- --name init
```

### 3. Run apps

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Auth flows

Locally, `SKIP_EMAIL_VERIFICATION=true` (default in `.env.example`) marks new users verified and allows login without Mailpit.

1. **Register** at `/register` — then **log in** at `/login`.
2. **Forgot password** → Mailpit reset link → `/reset-password`.

To exercise the full email flow, set `SKIP_EMAIL_VERIFICATION=false`, then use Mailpit for verify / resend.

## Closet flows

After login:

1. Upload an image (`jpeg` / `png` / `webp`, max 5MB).
2. Optionally set taxonomies: category, color, season, occasion, style, material, pattern, formality.
3. Browse your closet and edit tags.

Images are stored in MinIO under `closet/<userId>/…`. Tags and ownership live in PostgreSQL.

## API overview

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | no | Sends verification email unless skipped |
| POST | `/auth/login` | no | Requires verified email unless skipped |
| GET | `/auth/me` | JWT | Current user |
| POST | `/auth/verify-email` | no | `{ token }` |
| POST | `/auth/resend-verification` | no | `{ email }` |
| POST | `/auth/forgot-password` | no | `{ email }` |
| POST | `/auth/reset-password` | no | `{ token, password }` |
| GET | `/taxonomies` | no | Enum option lists |
| POST | `/images/upload` | JWT | multipart `file` + optional tags |
| GET | `/images` | JWT | Current user's items |
| PATCH | `/images/:id/tags` | JWT | Partial tag update |

## Workspace scripts

```bash
npm run docker:up
npm run docker:down
npm run dev
npm run dev:api
npm run dev:web
npm run prisma:generate
npm run prisma:migrate
```
