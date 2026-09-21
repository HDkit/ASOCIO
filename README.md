<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="ASOCIO Logo" />
</p>

<h1 align="center">ASOCIO</h1>

<p align="center">
  A production-grade social platform backend built with <a href="https://nestjs.com">NestJS</a>, MongoDB, and TypeScript.
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-v22.12.0-339933?logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nestjs.com"><img src="https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs&logoColor=white" alt="NestJS" /></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-7-47a248?logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="https://github.com/HDkit/ASOCIO/actions"><img src="https://img.shields.io/github/actions/workflow/status/HDkit/ASOCIO/ci-cd.yml?branch=master&label=CI%2FCD" alt="CI/CD" /></a>
  <a href="https://eslint.org"><img src="https://img.shields.io/badge/lint-eslint-4B32C3?logo=eslint&logoColor=white" alt="ESLint" /></a>
  <a href="https://prettier.io"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4?logo=prettier&logoColor=white" alt="Prettier" /></a>
  <img src="https://img.shields.io/badge/license-UNLICENSED-informational" alt="License" />
</p>

---

## About

ASOCIO is a REST API for a social platform: users, friendships, posts, comments, reactions, real-time notifications, and events. It is built on NestJS with MongoDB (Mongoose), JWT-based authentication, CASL row-level authorization, Zod-validated environment configuration, and i18n support (English & Vietnamese).

- **API base path:** `/api/v1` (global prefix `api`, URI versioning)
- **API docs:** Swagger UI served from a static spec at `/api-docs`
- **Node.js:** `>= v22.12.0` (see `.nvmrc`)

## Features

### Authentication (`/auth`)
- JWT access + refresh token flow with dedicated passport strategies (`access-jwt`, `refresh-jwt`)
- Login with **email or phone** + password (bcrypt-hashed)
- Registration and silent refresh
- Google OAuth 2.0 login & callback (`passport-google-oauth20`)

### Users (`/client/users`)
- Profile view (self / others), user list
- Onboarding setup (`setup` & `setup/google`) to assign the default `user` role
- Avatar upload, soft-delete/deactivate, online status, sports with player levels

### Relationships (`/client/users`)
- Friend system built on a `none` / `friend` / `blocked` state
- Send / cancel / accept / deny requests, un-friend, block / unblock

### Posts (`/client/posts`)
- Social posts with 3 types: `FILES` (file embeds), `EVENT` (event embed), `SHARED` (share of another post)
- Multi-file uploads, delete-on-update cleanup
- Visibility levels: private / public / friends / limited / excluded
- Cursor-paginated feed, sharing via `parentPostId`
- CASL row-level authorization for ownership & visibility

### Comments (`/client/posts`)
- Nested replies (`rootId` / `targetId`) with file attachments
- Per-comment reaction counts and transactional delete-self-and-descendants

### Reactions (`/client/posts`)
- Generic reactions on posts & comments (upsert / unreact, cursor-paginated list, counts)
- Unique `userId + targetId` constraint

### Events (`/client/events`)
- Event CRUD with multipart cover uploads
- Member management (`ORGANIZER` / `GUEST` roles), join, invite, share (creates a post embedding the event)
- Cursor-paginated search across events & members, transactional writes

### Notifications (`/notifications`)
- In-app notifications stored in MongoDB, pushed **real-time via Server-Sent Events (SSE)**
- Types: `FRIEND_REQUEST`, `FRIEND_ACCEPTED`, `REACTED`, `COMMENTED`, `EVENT_INVITE`
- Cursor-paginated list and mark-as-read
- Fired through `@nestjs/event-emitter`

### Platform concerns
- **Security:** global JWT guard (`@Public` escape hatch), `@Roles` and priority-based `@PriorityRole` guards, bcrypt hashing, rate limiting (60 req / 60s)
- **Authorization:** CASL ability factory over Mongoose query filters
- **Observability:** Winston logging, global exception filters (HTTP, Mongo, Mongoose, custom), response transformation interceptor
- **Reliability:** Mongo transaction sessions via a shared DataService, Zod-validated env config
- **i18n:** `nestjs-i18n` with `en` / `vi` locales (fallback `en`)
- **CI/CD:** GitHub Actions — lint, test, build on every push; Docker image publish on `master`

## Tech Stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Framework  | [NestJS 11](https://nestjs.com) + TypeScript 5.8                        |
| Database   | [MongoDB 7](https://www.mongodb.com) via [Mongoose 8](https://mongoosejs.com) |
| Auth       | `@nestjs/jwt`, passport (JWT + Google OAuth 2.0)                       |
| Authz      | [CASL](https://casl.js.org) (`@casl/ability`, `@casl/mongoose`)        |
| Validation | `class-validator`, `class-transformer`, [Zod](https://zod.dev) (env)   |
| Real-time  | Server-Sent Events + `@nestjs/event-emitter`                           |
| Logging    | Winston (`nest-winston`)                                               |
| Uploads    | ImageKit client-side upload (private key)                              |
| Tooling    | SWC builder, ESLint, Prettier, Husky, lint-staged, Jest                |

## Project Structure

```
src/
├── app.module.ts            # root module: global filters/guards/interceptors
├── main.ts                  # bootstrap, global prefix, validation pipe, Swagger UI
├── common/                  # decorators, filters, guards, interceptors, middlewares
├── configs/                 # Zod-validated env config (config, database, jwt)
├── i18n/                    # en / vi locale files
├── modules/                 # feature modules
│   ├── admin/
│   ├── auth/
│   ├── comment/
│   ├── dev/                 # RBAC test routes (development only)
│   ├── event/
│   ├── notification/
│   ├── post/
│   ├── reaction/
│   ├── relationship/
│   ├── router/              # URL wiring: /auth, /notifications, /admin, /client/*, /dev
│   └── user/
├── shared/modules/          # CASL, DataService (tx sessions), FileHost, Logger, SSE
└── router/                  # global routing configuration
docs/                        # openapi.json + coding conventions
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                          | Required | Description                          | Default |
| --------------------------------- | -------- | ------------------------------------ | ------- |
| `NODE_ENV`                        | ✅        | `development` or `production`        | —       |
| `PORT`                            | ❌        | HTTP server port                     | `3000`  |
| `DATABASE_URI`                    | ✅        | MongoDB connection string            | —       |
| `JWT_SECRET`                      | ✅        | Access token signing secret          | —       |
| `JWT_REFRESH_SECRET`              | ✅        | Refresh token signing secret         | —       |
| `JWT_ACCESS_TOKEN_EXPIRATION`     | ❌        | Access token TTL                     | `15m`   |
| `JWT_REFRESH_TOKEN_EXPIRATION`    | ❌        | Refresh token TTL                    | `7d`    |
| `GOOGLE_OA2_CLIENT_ID`            | ✅        | Google OAuth 2.0 client ID           | —       |
| `GOOGLE_OA2_CLIENT_SECRET`        | ✅        | Google OAuth 2.0 client secret       | —       |
| `IMGKIT_API_PRIVATE_KEY`          | ✅        | ImageKit private API key (uploads)   | —       |

> All env vars are validated at startup with a Zod schema — the app will refuse to boot with missing/invalid values.

## Getting Started

### Prerequisites

- **Node.js** `>= v22.12.0` (recommend using `nvm` with the pinned `.nvmrc`)
- **MongoDB** `7.x` — either a local instance or via Docker

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# edit .env and provide DATABASE_URI, JWT secrets, Google OAuth and ImageKit keys
```

### 3. Run the app

```bash
# development (watch mode, SWC builder)
npm run start:dev

# production
npm run build
npm run start:prod
```

The server starts at `http://localhost:3000` (or the configured `PORT`):
- API: `http://localhost:3000/api/v1`
- Swagger UI docs: `http://localhost:3000/api-docs`

### Using Docker (API + MongoDB)

```bash
cp .env.example .env
docker compose up --build
```

This starts:
- **nestjs_app** — the API on `http://localhost:3000`
- **mongodb** — MongoDB 7 on port `28017`

### Development-only routes

When `NODE_ENV=development`, the `DevModule` is registered and enables RBAC test endpoints under `/api/v1/dev` (`/admin-only`, `/moderator-and-admin`, `/all-users`, `/gte-moderator`).

## Available Scripts

| Script               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `npm run start`      | Run compiled `dist/main` in production mode          |
| `npm run start:dev`  | Watch mode with SWC builder (development)            |
| `npm run start:debug`| Debug + watch mode (development)                     |
| `npm run start:prod` | Run compiled `dist/main` in production               |
| `npm run build`      | Build with SWC (`nest build --builder swc`)          |
| `npm run format`     | Prettier over `src` and `test`                       |
| `npm run lint`       | ESLint with `--fix` on `src`, `apps`, `libs`, `test` |
| `npm run test`       | Unit tests (Jest)                                    |
| `npm run test:watch` | Tests in watch mode                                  |
| `npm run test:cov`   | Tests with coverage                                  |
| `npm run test:e2e`   | e2e tests (`test/jest-e2e.json`)                     |
| `npm run test:debug` | Debug tests with ts-node                             |

## Tests

```bash
# unit tests
npm run test

# watch mode
npm run test:watch

# coverage
npm run test:cov

# e2e
npm run test:e2e
```

Husky runs `lint-staged` (prettier + eslint) and the test suite before every commit.

## API Documentation

The OpenAPI 3.0 spec is maintained in `docs/openapi.json` and served via Swagger UI at [`/api-docs`](http://localhost:3000/api-docs). Requests require a Bearer token obtained from the `/auth` endpoints.

Also see:

- `docs/CONVENTION.md` — entity / schema typing conventions
- `docs/CODE_STYLE.md` — code style guide (decorators, ordering)

## Contributions

1. Fork the repo and create a branch from `master`
2. Make your changes
3. Ensure `npm run lint`, `npm run test`, and `npm run build` pass
4. Open a pull request (use the provided PR template)

## License

UNLICENSED — private project. See `package.json`.