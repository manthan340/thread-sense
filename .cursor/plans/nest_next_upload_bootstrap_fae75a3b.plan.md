---
name: Nest Next Upload Bootstrap
overview: Bootstrap a NestJS + Next.js monorepo for Thread Sense with JWT auth, MinIO storage, PostgreSQL metadata, and eight controlled tag taxonomies (category, color, season, occasion, style, material, pattern, formality) on a user-scoped closet UI. AI auto-tagging is deferred.
todos:
  - id: root-workspace
    content: Create npm workspaces root, Docker Compose for MinIO + PostgreSQL, .gitignore, env examples, concurrent dev scripts
    status: pending
  - id: nest-auth
    content: NestJS AuthModule — register/login, bcrypt, JWT strategy/guard, User model in Prisma
    status: pending
  - id: nest-images
    content: NestJS ImagesModule — MinIO upload, Image model with 8 taxonomy enums, JWT-protected upload/list/PATCH tags, GET /taxonomies
    status: pending
  - id: next-web
    content: Next.js auth pages, upload/edit forms with taxonomy selects, closet list showing all tags
    status: pending
  - id: readme
    content: Document install, Docker, migrate, auth + taxonomy tagging flow
    status: completed
isProject: false
---

# Thread Sense: NestJS + Next.js Closet Bootstrap (Auth + Taxonomies + MinIO + PostgreSQL)

## Goal

Scaffold a monorepo where a user can:

1. **Register / log in** (email + password, JWT)
2. Upload a clothing image (stored in **MinIO**), owned by that user
3. Manually tag it with **eight controlled taxonomies**
4. Browse **their** closet with those tags visible

Auth: **email/password + JWT** in NestJS `AuthModule`.

AI auto-tagging remains out of scope (same taxonomy fields will be reusable by an agent later).

## Repo layout

```
thread-sense/
  apps/
    api/          # NestJS (Auth, Images, Taxonomies, MinIO, Prisma)
    web/          # Next.js (auth + closet + taxonomy selects)
  docker-compose.yml
  package.json
  .env.example
  README.md
  .gitignore
```

Use **npm workspaces**. Package manager: npm.

## Storage split


| Concern              | Store                                  |
| -------------------- | -------------------------------------- |
| Image bytes          | MinIO (`closet/<userId>/<uuid>.<ext>`) |
| Users + tag metadata | PostgreSQL via Prisma                  |


## Local infra

**MinIO** — `9000` / console `9001`; bucket `thread-sense`; **presigned GET URLs**.

**PostgreSQL** — `localhost:5432`; `DATABASE_URL=postgresql://user:pass@localhost:5432/thread_sense`.

## Tag taxonomies

Each image has **one value per taxonomy** (single-select). Values are **Prisma enums** (controlled vocabulary), all **nullable** so upload can succeed with partial tagging; user can complete tags via PATCH.


| Taxonomy  | Field       | Example values                                                                                                                 |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Category  | `category`  | `tops`, `bottoms`, `dresses`, `outerwear`, `shoes`, `accessories`, `bags`, `activewear`                                        |
| Color     | `color`     | `black`, `white`, `gray`, `navy`, `blue`, `green`, `red`, `pink`, `yellow`, `orange`, `brown`, `beige`, `purple`, `multicolor` |
| Season    | `season`    | `spring`, `summer`, `fall`, `winter`, `all_season`                                                                             |
| Occasion  | `occasion`  | `casual`, `work`, `formal`, `party`, `date`, `travel`, `sport`                                                                 |
| Style     | `style`     | `minimal`, `classic`, `streetwear`, `boho`, `preppy`, `athleisure`, `vintage`                                                  |
| Material  | `material`  | `cotton`, `linen`, `wool`, `silk`, `denim`, `leather`, `synthetic`, `knit`                                                     |
| Pattern   | `pattern`   | `solid`, `striped`, `checked`, `floral`, `printed`, `graphic`, `other`                                                         |
| Formality | `formality` | `very_casual`, `casual`, `smart_casual`, `business`, `formal`                                                                  |


Shared constants live in the API (e.g. `apps/api/src/taxonomies/taxonomy.constants.ts`) and are exposed via `GET /taxonomies` so the web app renders selects from one source of truth. DTO validation accepts only enum values.

## Data models (Prisma)

```prisma
enum Category { tops bottoms dresses outerwear shoes accessories bags activewear }
enum Color { black white gray navy blue green red pink yellow orange brown beige purple multicolor }
enum Season { spring summer fall winter all_season }
enum Occasion { casual work formal party date travel sport }
enum Style { minimal classic streetwear boho preppy athleisure vintage }
enum Material { cotton linen wool silk denim leather synthetic knit }
enum Pattern { solid striped checked floral printed graphic other }
enum Formality { very_casual casual smart_casual business formal }

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  images       Image[]
}

model Image {
  id        String     @id @default(uuid())
  key       String     @unique
  mimeType  String
  size      Int
  category  Category?
  color     Color?
  season    Season?
  occasion  Occasion?
  style     Style?
  material  Material?
  pattern   Pattern?
  formality Formality?
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([userId])
}
```

## Backend (`apps/api`)

### AuthModule

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- bcrypt + Passport JWT; `JwtAuthGuard`
- Env: `JWT_SECRET`, `JWT_EXPIRES_IN`

### Taxonomies

- `GET /taxonomies` — public or JWT-protected; returns `{ category: [...], color: [...], ... }` for UI selects

### ImagesModule + StorageModule

- All image routes require JWT; user-scoped
- `POST /images/upload` — multipart `file` + optional taxonomy fields → MinIO + `Image` row
- `GET /images` — current user's images + presigned URLs + all tag fields
- `PATCH /images/:id/tags` — partial update of any taxonomy fields (owner only)
- Validate MIME `jpeg`/`png`/`webp`, max ~5MB; taxonomy values against enums
- CORS for `http://localhost:3000`

## Frontend (`apps/web`)

- `/register`, `/login`; JWT in `localStorage`; Bearer on API calls
- Upload form: file picker + 8 taxonomy `<select>`s (options from `GET /taxonomies`), empty = unset
- Closet list: thumbnails + tag chips for set taxonomies
- Edit tags: same 8 selects → `PATCH /images/:id/tags`
- Logout clears token
- Env: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- UI minimal/functional

## Root scripts

- `npm run docker:up` / `docker:down`
- `npm run dev` — api + web
- Prisma migrate in README

## Out of scope (deferred)

- AI auto-tagging agent
- Multi-select per taxonomy (e.g. multiple colors)
- Custom/user-defined tag values outside the enums
- OAuth / refresh tokens / httpOnly cookies
- Email verification, password reset
- Outfit recommendations
- Filter/search by taxonomy (list shows tags; filtering can follow)

## Data flow

```mermaid
sequenceDiagram
  participant User
  participant Web as NextJs_web
  participant Api as NestJs_api
  participant MinIO as MinIO_S3
  participant DB as PostgreSQL

  User->>Web: Register or login
  Web->>Api: POST /auth/register or login
  Api->>DB: Create or find User
  Api-->>Web: accessToken
  Web->>Api: GET /taxonomies
  Api-->>Web: Enum option lists
  User->>Web: Upload image plus taxonomy selects
  Web->>Api: POST /images/upload with Bearer JWT
  Api->>MinIO: PutObject closet/userId/uuid.ext
  Api->>DB: Insert Image with userId and tags
  Api-->>Web: id url taxonomies
  User->>Web: Edit tags
  Web->>Api: PATCH /images/id/tags
  Api->>DB: Update taxonomy fields
  Api-->>Web: Updated image
```



## Implementation order

1. Root workspace + Docker Compose (MinIO + PostgreSQL) + env examples
2. NestJS: Prisma `User` + `Image` + 8 enums, AuthModule
3. NestJS: `GET /taxonomies`, StorageModule, JWT-protected ImagesModule
4. Next.js: auth + upload/edit with taxonomy selects + closet list
5. README: Docker, migrate, register → upload → tag walkthrough

