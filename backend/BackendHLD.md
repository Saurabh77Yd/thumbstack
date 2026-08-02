# Personal Book Manager

## Backend High-Level Design Document

|                         |                                              |
| ----------------------- | -------------------------------------------- |
| **Document Type** | High-Level Design (HLD)                      |
| **Scope**         | Backend Only                                 |
| **Stack**         | Node.js, Express.js, MongoDB (Mongoose), JWT |
| **Consumer**      | Next.js frontend (via REST API)              |
| **Status**        | Pre-Development / Design Review              |

---

## 1. System Overview

### 1.1 Purpose

The Personal Book Manager is a single-user-scoped web application that allows an authenticated user to catalog books they own or intend to read, track reading progress, and view aggregate statistics about their personal library. This document defines the **backend architecture** that powers the system.

### 1.2 Scope

This HLD covers the backend service only: API design, data model, authentication strategy, and cross-cutting concerns (validation, error handling, security). Frontend implementation, UI/UX, and infrastructure provisioning are out of scope beyond what is necessary to describe integration boundaries.

### 1.3 Main Features

- User registration and authentication (JWT-based)
- CRUD operations on books, scoped per user
- Filtering by tag and reading status
- Dashboard with aggregate reading statistics

### 1.4 Functional Requirements

| ID   | Requirement                                                                         |
| ---- | ----------------------------------------------------------------------------------- |
| FR-1 | Users can sign up and log in                                                        |
| FR-2 | Users can log out (client-side token invalidation)                                  |
| FR-3 | Authenticated users can create, edit, delete, and view their own books              |
| FR-4 | Each book has a title, author, tags, and a reading status                           |
| FR-5 | Users can filter their book list by tag and/or reading status                       |
| FR-6 | Users can view dashboard statistics: total, reading, completed, want-to-read counts |
| FR-7 | Routes that expose or mutate book data must be protected by authentication          |

### 1.5 Non-Functional Requirements

| ID    | Requirement               | Notes                                                            |
| ----- | ------------------------- | ---------------------------------------------------------------- |
| NFR-1 | **Security**        | Passwords hashed, JWT-secured routes, no cross-user data leakage |
| NFR-2 | **Maintainability** | Layered architecture with clear separation of concerns           |
| NFR-3 | **Scalability**     | Stateless API, indexable queries, ready for pagination           |
| NFR-4 | **Consistency**     | Uniform request validation and response contracts                |
| NFR-5 | **Performance**     | Indexed lookups on`userId`, `status`, `tags`               |
| NFR-6 | **Portability**     | Environment-driven configuration, cloud-deployable               |

---

## 2. Architecture Overview

The backend follows a **layered MVC + Service architecture**. Each layer has a single responsibility, and requests flow strictly downward through the stack — no layer skips another.

```
                    ┌──────────────┐
                    │    Client    │
                    │ (Browser)    │
                    └──────┬───────┘
                           │  HTTPS
                           ▼
                    ┌──────────────┐
                    │   Next.js    │
                    │ (Frontend)   │
                    └──────┬───────┘
                           │  REST (JSON over HTTPS)
                           ▼
              ┌────────────────────────┐
              │   Express REST API     │
              │  (Routing + Middleware)│
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │ Authentication         │
              │ Middleware (JWT verify)│
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │      Controllers       │
              │(HTTP I/O orchestration)│
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │      Service Layer     │
              │     (Business logic)   │
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │   Repository / Models  │
              │   (Mongoose schemas)   │
              └───────────┬────────────┘
                          ▼
              ┌────────────────────────┐
              │        MongoDB         │
              └────────────────────────┘
```

**Request traversal:** the client (Next.js) issues a REST call → Express routes it to the matching handler chain → protected routes pass through JWT middleware, which verifies the token and attaches the authenticated user to the request → the controller extracts and shapes I/O only → the service layer executes business rules and calls the model layer → Mongoose executes the query against MongoDB → the response is shaped and serialized back up the chain to the client.

Each layer only knows about the layer directly beneath it. Controllers never touch Mongoose directly; services never touch `req`/`res`. This isolation is what keeps the codebase testable and replaceable layer-by-layer.

---

## 3. High-Level Component Breakdown

| Layer                   | Responsibility                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Routes**        | Declare URL paths, HTTP methods, and the middleware/controller chain for each endpoint. No logic lives here.                                                  |
| **Middleware**    | Cross-cutting request processing: JWT verification, request validation, error normalization, security headers.                                                |
| **Controllers**   | Translate HTTP requests into service calls and service results into HTTP responses. Own status codes and response shape — nothing else.                      |
| **Services**      | Contain business logic: ownership checks, status transitions, dashboard aggregation rules, password hashing/token issuance orchestration. Framework-agnostic. |
| **Models**        | Mongoose schemas and data-access methods. Define shape, constraints, and indexes for`User` and `Book`.                                                    |
| **Validation**    | Schema-based request validation (body/params/query) executed before controllers run.                                                                          |
| **Configuration** | Centralized environment variable loading (DB URI, JWT secret, port, expiry) — no scattered`process.env` reads.                                             |
| **Utilities**     | Shared, stateless helpers: JWT sign/verify wrappers, password hash helpers, standardized response formatter, async error wrapper.                             |

**Communication rule:** Route → Middleware → Controller → Service → Model → Database, and the response travels back up the same path unmodified in structure. No layer reaches two levels down (e.g., a controller never imports a Mongoose model directly).

---

## 4. High-Level Folder Structure

```
src/
│
├── config/            # Environment loading, DB connection config, constants wiring
├── controllers/        # auth.controller.js, book.controller.js, dashboard.controller.js
├── middleware/          # auth.middleware.js, error.middleware.js, validate.middleware.js
├── models/              # user.model.js, book.model.js (Mongoose schemas)
├── routes/              # auth.routes.js, book.routes.js, dashboard.routes.js, index.js
├── services/             # auth.service.js, book.service.js, dashboard.service.js
├── validators/           # auth.validator.js, book.validator.js (schema definitions)
├── utils/                # jwt.util.js, password.util.js, apiResponse.util.js, asyncHandler.util.js
├── constants/             # readingStatus.enum.js, httpStatusCodes.js, messages.js
├── database/               # connection.js (Mongoose connect + lifecycle handling)
├── app.js                    # Express app assembly: middleware, routes, error handler
└── server.js                  # Process entry point: loads config, starts HTTP listener
```

| Folder           | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `config/`      | Single source of truth for environment-driven settings       |
| `controllers/` | Thin HTTP adapters — no business logic                      |
| `middleware/`  | Auth guard, centralized error handler, validation runner     |
| `models/`      | Data schema, field constraints, indexes                      |
| `routes/`      | Endpoint-to-handler wiring, grouped by domain                |
| `services/`    | Business rules, orchestration, ownership enforcement         |
| `validators/`  | Input contracts, independent of controllers                  |
| `utils/`       | Reusable, stateless helper functions                         |
| `constants/`   | Enums and fixed values referenced across layers              |
| `database/`    | Connection bootstrap and teardown                            |
| `app.js`       | Wires middleware/routes without starting a server (testable) |
| `server.js`    | Boots`app.js` and binds to a port                          |

---

## 5. Request Flow

All flows follow the same shape; only the service-layer logic differs.

**Signup**

```
Client → POST /auth/signup → Validation Middleware → Controller
   → Service (hash password, create user, issue JWT) → Model → MongoDB → Response
```

**Login**

```
Client → POST /auth/login → Validation Middleware → Controller
   → Service (verify credentials, issue JWT) → Model → MongoDB → Response
```

**Get Books (with filters)**

```
Client → GET /books?status=&tag= → JWT Middleware → Controller
   → Service (build query scoped to userId) → Model → MongoDB → Response
```

**Add Book**

```
Client → POST /books → JWT Middleware → Validation Middleware → Controller
   → Service (attach userId, apply defaults) → Model → MongoDB → Response
```

**Update Book**

```
Client → PUT /books/:id → JWT Middleware → Validation Middleware → Controller
   → Service (verify ownership, apply update) → Model → MongoDB → Response
```

**Delete Book**

```
Client → DELETE /books/:id → JWT Middleware → Controller
   → Service (verify ownership, remove) → Model → MongoDB → Response
```

**Dashboard**

```
Client → GET /dashboard → JWT Middleware → Controller
   → Service (aggregate counts scoped to userId) → Model → MongoDB → Response
```

The ownership check (`book.userId === req.user.id`) is enforced in the **service layer** for every book mutation and read, not in the controller, so the rule is applied consistently regardless of entry point.

---

## 6. Database Design

### 6.1 User Collection

| Field         | Type     | Purpose                                  |
| ------------- | -------- | ---------------------------------------- |
| `_id`       | ObjectId | Primary key                              |
| `name`      | String   | Display name                             |
| `email`     | String   | Login identifier, unique                 |
| `password`  | String   | Bcrypt hash, never returned in responses |
| `createdAt` | Date     | Audit trail                              |
| `updatedAt` | Date     | Audit trail                              |

**Indexes:** unique index on `email` — enforces one account per email and makes login lookups O(log n).

### 6.2 Book Collection

| Field         | Type                    | Purpose                                          |
| ------------- | ----------------------- | ------------------------------------------------ |
| `_id`       | ObjectId                | Primary key                                      |
| `userId`    | ObjectId (ref:`User`) | Owning user — enforces per-user data isolation  |
| `title`     | String                  | Book title                                       |
| `author`    | String                  | Book author                                      |
| `tags`      | [String]                | Free-form categorization, supports filtering     |
| `status`    | String (enum)           | `want_to_read` \| `reading` \| `completed` |
| `createdAt` | Date                    | Used for "recent books" ordering                 |
| `updatedAt` | Date                    | Audit trail                                      |

**Indexes:**

- Compound index on `{ userId: 1, status: 1 }` — accelerates dashboard counts and status-filtered lists, the two most frequent query shapes.
- Index on `{ userId: 1, tags: 1 }` — accelerates tag filtering.

**Relationship:** One `User` → Many `Books`, modeled via `userId` reference on `Book` (not embedding), since books are queried, filtered, and paginated independently of the user document and can grow unbounded.

---

## 7. Entity Relationship

```
┌───────────────────┐          1         N   ┌───────────────────┐
│       User        │ ─────────────────────▶│       Book        │
├───────────────────┤                        ├───────────────────┤
│ _id               │                        │ _id               │
│ name              │                        │ userId (FK → User)│
│ email             │                        │ title             │
│ password          │                        │ author            │
│ createdAt         │                        │ tags[]            │
│ updatedAt         │                        │ status            │
└───────────────────┘                        │ createdAt         │
                                             │ updatedAt         │
                                             └───────────────────┘
```

---

## 8. API Summary

### Authentication APIs

| Method | Endpoint             | Purpose                        | Auth Required | Module |
| ------ | -------------------- | ------------------------------ | ------------- | ------ |
| POST   | `/api/auth/signup` | Register a new user            | No            | Auth   |
| POST   | `/api/auth/login`  | Authenticate and issue JWT     | No            | Auth   |
| POST   | `/api/auth/logout` | Invalidate session client-side | Yes           | Auth   |

### Book APIs

| Method | Endpoint           | Purpose                                                 | Auth Required | Module |
| ------ | ------------------ | ------------------------------------------------------- | ------------- | ------ |
| GET    | `/api/books`     | List user's books (supports`status`, `tag` filters) | Yes           | Book   |
| POST   | `/api/books`     | Add a new book                                          | Yes           | Book   |
| PUT    | `/api/books/:id` | Edit an existing book                                   | Yes           | Book   |
| DELETE | `/api/books/:id` | Remove a book                                           | Yes           | Book   |

### Dashboard APIs

| Method | Endpoint           | Purpose                        | Auth Required | Module    |
| ------ | ------------------ | ------------------------------ | ------------- | --------- |
| GET    | `/api/dashboard` | Aggregate stats + recent books | Yes           | Dashboard |

---

## 9. Authentication & Authorization

**Signup Flow:** validate input → check email uniqueness → hash password with bcrypt → persist user → issue JWT → return token + minimal user profile.

**Login Flow:** validate input → fetch user by email → compare password with bcrypt → issue JWT on match → return token + minimal user profile.

**JWT Generation:** signed with a server-side secret (`JWT_SECRET`), payload limited to `userId` (no sensitive data), short-to-moderate expiry (e.g., 24h) configured via environment variable.

**Password Hashing:** bcrypt with a sufficient salt round count (10–12); plaintext passwords are never logged or stored.

**JWT Verification:** the auth middleware extracts the token, verifies signature and expiry, and attaches the decoded user identity to `req.user`. Invalid/expired tokens short-circuit with `401` before reaching the controller.

**Protected Routes:** every `/books` and `/dashboard` route is wrapped by the auth middleware; `/auth/signup` and `/auth/login` are the only public endpoints.

**Authorization:** beyond authentication, the service layer enforces resource-level authorization — a user may only read/mutate `Book` documents where `userId` matches `req.user.id`. This is a data-ownership check, not a role-based one, since the application is single-tenant per user.

**Logout Strategy:** JWTs are stateless, so logout is handled client-side by discarding the token. No server-side session/blacklist store is introduced for v1 — this keeps the API stateless and horizontally scalable. (A token-blacklist or short-lived-access + refresh-token pattern is a documented future enhancement, not a v1 requirement.)

**Token Storage — Authorization Header vs. HttpOnly Cookie:**

| Option                                   | Chosen               |
| ---------------------------------------- | -------------------- |
| `Authorization: Bearer <token>` header | ✅**Selected** |
| HttpOnly Cookie                          | Not selected         |

**Justification:** the frontend is a decoupled Next.js application consuming a pure REST API, not server-rendering pages that need cookie-based session continuity. The Authorization header keeps the API stateless, avoids CORS/cookie complexity across origins during development and deployment, and matches conventional REST API design for token-based auth. Cookie-based storage is reconsidered only if CSRF-sensitive server-rendered flows are introduced later.

---

## 10. Validation Strategy

| Operation      | Validated Fields                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signup         | `name` (required), `email` (format, required), `password` (min length, required)                                                                                    |
| Login          | `email` (format, required), `password` (required)                                                                                                                     |
| Create Book    | `title` (required), `author` (required), `tags` (array of strings, optional), `status` (must be one of the enum values, optional — defaults to `want_to_read`) |
| Update Book    | Same as create, all fields optional but at least one must be present                                                                                                      |
| Reading Status | Restricted to enum:`want_to_read`, `reading`, `completed` — rejected otherwise                                                                                     |
| Tags           | Array of non-empty strings, deduplicated and trimmed                                                                                                                      |

**Library:** **Joi** (or **Zod**) is recommended over `express-validator` for this project — schema-first validators keep validation rules declarative, colocated in `validators/`, and reusable independent of Express's request object, which keeps the validation layer testable in isolation from HTTP.

Validation executes as middleware **before** the controller runs; failures short-circuit with a `400` and a structured error body, so controllers can assume input is already well-formed.

---

## 11. Error Handling Strategy

A single **global error-handling middleware** (registered last in `app.js`) catches all errors forwarded via `next(err)`, including those from async route handlers via a shared `asyncHandler` wrapper — no scattered `try/catch` per controller.

| Error Type           | Source                                        | HTTP Status |
| -------------------- | --------------------------------------------- | ----------- |
| Validation Error     | Validators                                    | 400         |
| Authentication Error | Auth middleware (missing/invalid/expired JWT) | 401         |
| Authorization Error  | Service layer (ownership mismatch)            | 403         |
| Not Found            | Service layer (invalid book id)               | 404         |
| Database Error       | Mongoose (cast errors, connection issues)     | 400 / 500   |
| Unexpected Error     | Anywhere uncaught                             | 500         |

**Standard API Response Format:**

Success:

```
{
  "success": true,
  "data": { ... },
  "message": "Books fetched successfully"
}
```

Error:

```
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

This uniform envelope lets the Next.js frontend branch on `success` alone, regardless of endpoint.

---

## 12. Security Considerations

| Concern             | Mitigation                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Password storage    | bcrypt hashing, never stored/returned in plaintext                                                                                                               |
| Token lifetime      | Short-to-moderate JWT expiry, configurable via env                                                                                                               |
| Secrets             | All secrets (`JWT_SECRET`, `MONGO_URI`) in environment variables, never committed                                                                            |
| HTTP headers        | `helmet` middleware for secure default headers                                                                                                                 |
| Cross-origin access | `cors` configured to allow only the known Next.js origin                                                                                                       |
| Input validation    | Schema validation on every write endpoint                                                                                                                        |
| NoSQL Injection     | Mongoose schema typing + validation rejects operator-injection payloads (e.g.,`{ "$gt": "" }`) in string fields                                                |
| XSS                 | No raw HTML rendering server-side; output is JSON only — payload sanitization applied on free-text fields (`title`, `author`, `tags`) as defense in depth |
| Rate Limiting       | Not in v1; documented as a future enhancement (`express-rate-limit` on `/auth/*`)                                                                            |
| Transport security  | HTTPS enforced at deployment/proxy layer                                                                                                                         |

---

## 13. Dashboard Logic

Dashboard statistics are derived entirely from the authenticated user's own `Book` documents — no cross-user data is ever touched.

- **Total Books** — count of all documents where `userId` matches the current user.
- **Reading Count** — count where `status = reading`.
- **Completed Count** — count where `status = completed`.
- **Want To Read Count** — count where `status = want_to_read`.
- **Recent Books** — the user's books sorted by `createdAt` descending, limited to a small set (e.g., 5), for a quick-glance list.

All counts are computed in a single grouped aggregation scoped by `userId`, rather than four separate queries, to minimize round-trips to MongoDB. The compound `{ userId, status }` index (Section 6.2) makes this aggregation efficient at the scale this application targets.

---

## 14. Design Decisions

| Choice                  | Rationale                                                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Express.js**    | Minimal, unopinionated, well-understood middleware model — ideal for a REST API of this size without framework overhead.                                                                                |
| **MongoDB**       | Book records are naturally document-shaped (variable tags, evolving fields) and don't require multi-table joins; schema flexibility suits iterative feature growth.                                      |
| **Mongoose**      | Adds schema enforcement, validation hooks, and indexing declarations on top of MongoDB's flexibility — gives structure without losing document-model benefits.                                          |
| **JWT**           | Stateless auth fits a decoupled SPA/REST frontend, requires no server-side session store, and scales horizontally without sticky sessions.                                                               |
| **MVC**           | Well-known separation of routing/handling from data — easy for reviewers and future contributors to navigate.                                                                                           |
| **Service Layer** | Keeps business rules (ownership checks, status logic, aggregation) out of controllers, making them independently testable and reusable across future entry points (e.g., a future CLI or GraphQL layer). |
| **REST APIs**     | Matches the assignment's client (Next.js) consumption pattern; resource-oriented endpoints are simple to document, test, and version.                                                                    |

---

## 15. Scalability Considerations

- **Pagination** — `/books` should accept `page`/`limit` query params once library sizes grow beyond a single page; not required functionally at current scale but the schema and indexes already support it.
- **Filtering** — tag/status filters are index-backed (Section 6.2), keeping filtered queries efficient as data grows.
- **Sorting** — default sort by `createdAt` uses an existing index path; additional sort keys (title, author) can be added on demand.
- **Database Indexing** — compound indexes on `{ userId, status }` and `{ userId, tags }` keep the two dominant query patterns (list + dashboard) fast without full collection scans.
- **Caching (future)** — dashboard counts are a natural caching candidate once usage grows, since they don't need to be real-time to the millisecond.
- **Redis (future)** — candidate for token blacklisting (logout invalidation) and/or dashboard cache, not required for v1.
- **Cloud Deployment** — the API is stateless (no in-memory session), so it can run behind a load balancer with multiple instances without sticky sessions.
- **Horizontal Scaling** — stateless JWT auth + MongoDB Atlas (managed, independently scalable) means additional API instances can be added without coordination overhead.

This is scoped realistically for a small production application — these are noted as **future-ready**, not built speculatively into v1.

---

## 16. Deployment Overview

```
   Browser
      │  HTTPS
      ▼
   Next.js  (Vercel / Node host)
      │  REST (JSON over HTTPS)
      ▼
   Express API  (Render / Railway / EC2 / App Service)
      │  MongoDB Wire Protocol (TLS)
      ▼
   MongoDB Atlas (Managed Cluster)
```

**Required Environment Variables:**

| Variable           | Purpose                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `PORT`           | Port the Express server binds to                                           |
| `MONGO_URI`      | MongoDB Atlas connection string                                            |
| `JWT_SECRET`     | Secret used to sign/verify JWTs                                            |
| `JWT_EXPIRES_IN` | Token lifetime (e.g.,`24h`)                                              |
| `CORS_ORIGIN`    | Allowed frontend origin                                                    |
| `NODE_ENV`       | `development` / `production` toggle for logging, error verbosity, etc. |

---

## 17. Assumptions

- Books belong to exactly one user; there is no shared or collaborative library in v1.
- No file uploads (e.g., cover images) are part of the current scope.
- The application is single-tenant per user — no organizations, teams, or roles.
- Reading status is a fixed three-value enum; no custom statuses in v1.
- Tags are free-text, user-defined strings, not a separate managed taxonomy/collection.
- Email is the sole login identifier; no social login/OAuth in v1.
- The frontend and backend are deployed as separate services communicating over REST.

---

## 18. Future Enhancements

- Full-text book search (title/author)
- Favorites / bookmarking
- Ratings and reviews
- Reading goals and progress tracking
- Cover image uploads
- Notifications (e.g., reading reminders)
- Usage analytics
- Data export (CSV/JSON)

---

## 19. Summary

This architecture separates concerns cleanly across routing, request handling, business logic, and data access, so each layer can be understood, tested, and modified in isolation. Ownership-scoped queries and indexed access patterns keep the design **secure** and **performant** at the scale the assignment targets, while stateless JWT authentication keeps the API **horizontally scalable** without additional infrastructure. The MVC + Service Layer structure, standardized response/error contracts, and schema-based validation make the codebase **maintainable** and straightforward for another engineer to extend — new resources (e.g., "Favorites" or "Reviews") can be added as a parallel route/controller/service/model set without touching existing modules. Combined, these choices produce a backend that is appropriately scoped for a hiring assignment while reflecting patterns suitable for a real, small-scale production service.
