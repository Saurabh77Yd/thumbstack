# Personal Book Manager — Frontend High-Level Design

**Author:** Saurabh Yadav
**Document Type:** Frontend High-Level Design (HLD)
**Stack:** Next.js 15+ (App Router), Tailwind CSS, TanStack Query, Context API
**Companion Document:** Backend HLD (Node.js + Express + JWT)

---

## 1. System Overview

### Purpose

A single-user Personal Book Manager that lets a reader track books across three reading states, organize them with tags, and view an at-a-glance dashboard of reading activity. This document covers the **frontend architecture only**; the backend is a pre-built Express REST API with JWT authentication.

### Scope

Client-side application responsible for authentication UX, book CRUD, filtering, dashboard aggregation display, and all rendering/state/API-integration concerns. Business logic (validation rules, data persistence, auth issuance) lives in the backend and is out of scope here.

### User Goals

- Sign up / log in securely and stay authenticated across sessions.
- Add, edit, delete, and browse books with minimal friction.
- Understand reading progress at a glance via the dashboard.
- Filter the book list quickly by tag or status.

### Functional Requirements (Recap)

- **Auth:** Signup, Login, Logout, protected route redirection.
- **Books:** Add, Edit, Delete (with confirmation), List.
- **Status:** Want to Read 📖 / Reading 📘 / Completed ✅ — visual badges, inline update.
- **Filtering:** By tag, by status.
- **Dashboard:** Total count, status-wise counts, book list with inline status update.

### Non-Functional Requirements

- **Performance:** Fast initial paint via Server Components; minimal client JS shipped.
- **Responsiveness:** Mobile-first, fluid across breakpoints (phone → desktop).
- **Accessibility:** Semantic HTML, keyboard-navigable forms/modals, ARIA on interactive widgets.
- **SEO:** Not a priority for protected pages (behind auth), but public pages (login/signup) should still be crawlable and fast.
- **Maintainability:** Clear separation of concerns, typed contracts (TypeScript), predictable folder structure.

---

## 2. Frontend Architecture Overview

The frontend is a layered system: presentation (App Router pages/components) → API abstraction (typed client) → backend REST service.

```
                    ┌────────────────────────┐
                    │        Browser         │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   Next.js App Router    │
                    │ ┌──────────────────────┐│
                    │ │ Server Components    ││  ← initial HTML, layout shells,
                    │ │ (pages, layouts)     ││    non-interactive data reads
                    │ └──────────────────────┘│
                    │ ┌──────────────────────┐│
                    │ │ Client Components    ││  ← forms, modals, filters,
                    │ │ (interactive islands)││    status toggles, TanStack Query
                    │ └──────────────────────┘│
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   API Layer (lib/api)   │  ← fetch wrapper, interceptors,
                    │  typed request/response │    error normalization
                    └───────────┬─────────────┘
                                │  HTTPS + Authorization header
                    ┌───────────▼─────────────┐
                    │  Backend REST API       │
                    │  (Express + JWT + Mongo)│
                    └─────────────────────────┘
```

**Key decisions embedded in this diagram** (detailed in later sections):

- Server Components render page shells and static structure; Client Components own anything stateful or interactive (forms, filters, mutations).
- Auth state is held client-side in a lightweight Context (session/user object), with the JWT itself managed via the API layer — see Section 10 for the storage decision.
- All backend communication funnels through a single API layer, never called ad hoc from components.

---

## 3. Rendering Strategy

| Concern                      | Approach                                                      | Reasoning                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Public pages (Login, Signup) | Server Component shell + Client form island                   | Fast first paint, SEO-friendly shell, interactivity scoped to the form only                                                    |
| Dashboard                    | Server Component shell + Client data widgets (TanStack Query) | Dashboard stats are user-specific and frequently revalidated; client-side fetching with caching is more valuable here than SSR |
| Books List                   | Server Component shell + Client list/filter island            | Filtering and inline status updates require client interactivity; static chrome (headers, layout) stays server-rendered        |
| Add/Edit Book                | Client Component (form-heavy)                                 | Entirely interactive: validation, tag input, submission — no SEO or static-content benefit from SSR                           |

**Rationale:** Since every data-bearing page is behind authentication, SEO is not a driver for those routes — the App Router split here is optimized for **performance (minimal client JS) and clear ownership of interactivity**, not search indexing. Server Components render static layout/navigation chrome once on the server and are never re-shipped as JS; Client Components are deliberately scoped to the smallest "island" that needs state, event handlers, or browser APIs (localStorage/cookies, TanStack Query cache). This keeps the client bundle lean and avoids hydrating markup that never changes.

Trade-off accepted: because dashboard/book data is fetched client-side via TanStack Query rather than server-fetched, there is a brief loading state on first visit per session — mitigated by skeleton loaders and query caching (Section 8) so subsequent navigations feel instant.

---

## 4. Application Structure

**Public Area** — Login, Signup. No shell chrome (navbar/sidebar); centered, minimal auth layout.

**Protected Area** — Dashboard, Books list, Add/Edit Book. Wrapped in a shared app shell (Navbar + optional Sidebar) and guarded by route protection (Section 10).

**Shared Layout** — Root layout (fonts, global styles, providers), Auth layout (public), Dashboard layout (protected shell: Navbar, content container).

**Shared Components** — Design-system primitives (Button, Input, Modal, Badge), and cross-cutting states (Loading, Error, Empty) used consistently across Books and Dashboard so the UI never shows ad hoc spinners or bespoke error text.

---

## 5. Route Structure

```
app/
  layout.tsx                     # Root layout: fonts, global providers
  page.tsx                       # Redirects to /login or /dashboard based on auth

  (auth)/
    layout.tsx                   # Minimal centered layout, no navbar
    login/
      page.tsx
    signup/
      page.tsx

  (dashboard)/
    layout.tsx                   # App shell: Navbar, auth guard
    dashboard/
      page.tsx
    books/
      page.tsx                   # Book list + filters
      new/
        page.tsx                 # Add book (dedicated page, see Section 13)
      [id]/
        edit/
          page.tsx                # Edit book
```

**Route groups** `(auth)` and `(dashboard)` split layouts without affecting the URL path — each gets its own `layout.tsx` so the public and protected areas never share navbar/shell markup or auth-guard logic. **Nested layouts** let the dashboard shell (Navbar, guard) wrap all protected pages once, rather than repeating it per page. **Dynamic segment** `[id]` scopes the edit route to a specific book.

| Page       | Route                | Auth Required | Rendering Type                     |
| ---------- | -------------------- | ------------- | ---------------------------------- |
| Login      | `/login`           | No            | Server shell + Client form         |
| Signup     | `/signup`          | No            | Server shell + Client form         |
| Dashboard  | `/dashboard`       | Yes           | Server shell + Client widgets      |
| Books List | `/books`           | Yes           | Server shell + Client list/filters |
| Add Book   | `/books/new`       | Yes           | Client (form-heavy)                |
| Edit Book  | `/books/[id]/edit` | Yes           | Client (form-heavy)                |

---

## 6. High-Level Folder Structure

```
app/                    # Routes, layouts, route groups (Section 5)
components/
  ui/                   # Design-system primitives: Button, Input, Modal, Badge, Spinner, EmptyState
  auth/                 # LoginForm, SignupForm
  dashboard/            # DashboardStats, BookTable, FilterBar
  books/                # BookForm, TagSelector, DeleteModal, BookCard, StatusBadge
  layout/               # Navbar, Sidebar, AppShell
hooks/                  # useBooks, useDashboardStats, useAuth, useDebounce
lib/
  api/                  # Centralized fetch client, endpoint modules, interceptors
  validation/           # Zod schemas
  utils/                # Formatting, class-name helpers
context/                # AuthContext (session/user, login/logout actions)
types/                  # Book, User, ApiResponse, filter/status enums
constants/              # Status enum labels/icons, route paths, query keys
styles/                 # globals.css, Tailwind config extensions
proxy.ts                # Edge-level auth guard — Next.js 16 renamed Middleware to Proxy (Section 10)
```

**Purpose summary:** `app/` is routing only — pages stay thin and delegate to `components/`. `lib/api` is the single point of contact with the backend (Section 9). `context/` holds only global auth/session state; everything else server-derived lives in TanStack Query, and everything ephemeral (UI toggles) lives in local component state (Section 8). `constants/` centralizes the status→icon/label mapping so `StatusBadge` and dashboard counts never drift out of sync.

---

## 7. Component Architecture

**Authentication**

- `LoginForm` — email/password inputs, submit handler, inline validation errors.
- `SignupForm` — registration fields, client-side validation before API call.

**Dashboard**

- `DashboardStats` — renders total + per-status counts as calm summary tiles.
- `BookCard` — mobile-friendly single-book summary with status badge.
- `BookTable` — desktop tabular view of books with inline status control.
- `FilterBar` — tag and status filter controls, debounced.
- `StatusBadge` — icon + label for Want to Read / Reading / Completed, reused everywhere status is shown.

**Book Management**

- `BookForm` — shared form for Add and Edit (title, author, tags, status).
- `TagSelector` — multi-tag input/select with add-new capability.
- `DeleteModal` — confirmation dialog before delete mutation fires.

**Common UI**

- `Button`, `Input` — styled primitives with consistent focus/disabled states.
- `Modal` — accessible dialog (focus trap, ESC to close) used by `DeleteModal` and any future overlays.
- `Spinner` — loading indicator for async boundaries.
- `Badge` — generic label chip (tags use this; status uses `StatusBadge`, which composes it).
- `EmptyState` — consistent "no books yet" / "no results" messaging across list and filtered views.

---

## 8. State Management Strategy

Three distinct categories of state, each handled by the tool best suited to it:

| State Category             | Examples                                               | Tool                           | Why                                                                                                              |
| -------------------------- | ------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Global (session)** | Current user, auth status                              | Context API                    | Small, low-frequency-update, app-wide — Context is sufficient without Redux/Zustand overhead                    |
| **Server state**     | Book list, dashboard stats                             | TanStack Query                 | Handles caching, background revalidation, loading/error states, and mutation-triggered refetching out of the box |
| **Local/UI state**   | Filter selections, modal open/close, form field values | `useState` / React Hook Form | Ephemeral, component-scoped, no need to lift beyond where it's used                                              |

**Why Context + TanStack Query over alternatives:** The assignment explicitly asks to justify this pairing rather than defaulting to it. Redux/Zustand would add ceremony for what is, here, a single global value (the session) — Context handles that cleanly. For book/dashboard data, plain Context or `useState` would force manual cache invalidation, loading flags, and refetch-on-mutation logic; TanStack Query provides this natively (query keys, `invalidateQueries` on mutation success, stale-while-revalidate) and is the industry-standard fit for REST-backed CRUD screens like this one. SWR was considered as an alternative but TanStack Query's richer mutation API (optimistic updates, granular cache control) better fits the inline-status-update and delete-confirmation interactions in this app.

**Caching/revalidation strategy:**

- Books list and dashboard stats are fetched under distinct query keys (`['books', filters]`, `['dashboard-stats']`).
- On any mutation (create/update/delete/status change), the relevant queries are invalidated so the list and dashboard stay consistent without manual state syncing.
- Filter changes produce new query keys, so TanStack Query caches each filter combination independently, making repeated filter toggles instant on revisit within the session.

---

## 9. API Integration Layer

All backend communication is funneled through a single client in `lib/api/`, never called directly from components — this keeps request shaping, auth headers, and error handling in one place.

- **Centralized client:** A thin fetch wrapper configured with the backend base URL (from environment variable), exposing typed methods per resource (e.g., `booksApi.list()`, `booksApi.create()`).
- **Token attachment:** The wrapper attaches the `Authorization: Bearer <token>` header on every request (see Section 10 for why header-based over cookie-based here).
- **Token expiry:** A response interceptor watches for `401` responses, clears the local session (Context + stored token), and redirects to `/login`. No silent refresh flow in v1 (Section 22) — expiry is treated as a hard logout.
- **Error normalization:** All API errors are mapped to a consistent shape (`{ message, status, fieldErrors? }`) before reaching components, so UI error handling (toasts, form field errors) doesn't need to branch on raw backend response shapes.

---

## 10. Authentication Flow (Frontend Perspective)

**Signup:** `SignupForm` validates client-side (Zod) → API layer posts credentials → on success, backend returns JWT + user → token stored, `AuthContext` populated → redirect to `/dashboard`.

**Login:** Same flow as signup, minus registration fields.

**Logout:** Clear stored token → clear `AuthContext` → redirect to `/login`. TanStack Query cache is also cleared to avoid leaking the previous user's data into a subsequent session.

**Route protection — both layers, deliberately:**

- `proxy.ts` (Next.js 16 renamed Middleware to Proxy — functionality is unchanged) performs an edge-level check before a protected route even renders, redirecting unauthenticated requests to `/login` — this prevents a flash of protected content. Since the JWT itself is held client-side (Authorization header, not a cookie), this check is necessarily *optimistic*: it reads a lightweight non-httpOnly flag cookie set alongside login/logout, not the token itself.
- The `(dashboard)` layout additionally performs a client-side guard via `AuthContext`, covering the case where auth state changes during a client-side navigation (e.g., token expires mid-session) — this is the authoritative check.

Using both is intentional, not redundant: proxy protects the initial request/navigation boundary (UX only); the client guard is the actual source of truth, consistent with Next.js's own guidance that Proxy should not be used as a full session management solution.

**JWT storage decision: Authorization header with in-memory/Context-held token (not httpOnly cookie).**
Justification: the backend is a separately deployed Express API (Section 21), which makes cross-origin cookie handling (`SameSite`, `Secure`, CORS credential config) meaningfully more complex than attaching a bearer token per request. Since this is a single-user personal tool with no XSS-sensitive third-party scripts in scope, the header approach is chosen for simplicity and to match the REST API's stateless JWT design. This is a deliberate trade-off — Section 18 covers the resulting XSS exposure and mitigations.

---

## 11. UI Data Flow (Key Actions)

The common pattern for all data actions:

```
User → Page/Component → TanStack Query hook → API Layer → Backend
                                                              │
User ← UI Re-render ← Query Cache Update ← Response ─────────┘
```

**Create/Update Book:** Same pattern, using a `useMutation` hook; on success, `invalidateQueries(['books'])` and `['dashboard-stats']` trigger automatic refetch so the list and dashboard reflect the change without manual state wiring.

**Delete Book (differs by one step):**

```
User clicks delete → DeleteModal opens (confirmation) → User confirms
   → useMutation fires → API Layer → Backend → success
   → invalidate ['books'] + ['dashboard-stats'] → list re-renders → modal closes
```

The confirmation step is the only structural deviation from the shared pattern — it exists specifically to prevent accidental data loss on a destructive action.

---

## 12. Navigation Flow

```
Login → Dashboard → Books (list) → Edit Book → Save → Dashboard
                        │
                        └→ Add Book → Save → Books (list)
```

From the Dashboard, a user can also update a book's status inline without leaving the page (Section 1), which re-renders both the list widget and the status counts via the shared query-invalidation mechanism (Section 8).

---

## 13. Page-Level Design Breakdown

**Login** — Purpose: authenticate returning users. Key elements: email/password fields, submit button, link to Signup, inline error messaging.

**Signup** — Purpose: create a new account. Key elements: registration fields, client-side validation feedback, link to Login.

**Dashboard** — Purpose: at-a-glance reading overview. Key elements: total + status-wise count tiles (`DashboardStats`), book list with inline status control, empty state for new users with zero books.

**Books (list)** — Purpose: browse and manage the full collection. Key elements: `FilterBar` (tag/status), `BookTable`/`BookCard` (responsive), per-row edit/delete actions, empty/loading states.

**Add/Edit Book** — Purpose: create or modify a book entry. Key elements: `BookForm` (title, author, `TagSelector`, status selector), save/cancel actions.

**Modal vs. dedicated page for Add/Edit:** Dedicated pages (`/books/new`, `/books/[id]/edit`) were chosen over modals. A book entry involves multiple fields (including a tag selector) — a full page gives it room to breathe, supports direct linking/bookmarking to an edit URL, and avoids the accessibility complexity of a large in-modal form (focus trapping, scroll-locking a tall form). Modals are reserved in this design for lightweight, single-purpose interactions — specifically the delete confirmation.

---

## 14. Form Handling & Validation

- **Form library: React Hook Form** — uncontrolled-input model minimizes re-renders on keystroke, which matters for the tag-selector-heavy `BookForm`; its minimal API also keeps `LoginForm`/`SignupForm` lightweight.
- **Validation schema: Zod** — schemas are defined once per form (`lib/validation/`) and shared between React Hook Form's resolver and TypeScript types (via `z.infer`), so validation rules and types never drift apart.
- **Client vs. backend validation:** Zod schemas mirror backend validation rules for immediate feedback, but backend validation remains the source of truth. Field-level errors returned by the API (Section 9's normalized `fieldErrors`) are mapped back onto the corresponding React Hook Form fields, so server-side rejections (e.g., duplicate detection) surface in the same UI position as client-side errors.

---

## 15. Error Handling Strategy

- **Global error boundary:** A root-level `error.tsx` catches unhandled render errors and shows a calm fallback UI rather than a crash screen.
- **API errors:** Surfaced via toast/snackbar for transient failures (e.g., failed mutation), keeping the user on the current page.
- **401/403:** Handled centrally in the API layer's response interceptor (Section 9) — auto-clears session and redirects to `/login`, rather than each component handling auth errors individually.
- **Network failures & empty states:** Every data-bearing view (`BookTable`, `DashboardStats`) has explicit loading, error, and empty renders using the shared `Spinner` and `EmptyState` components, so no view is ever left blank without explanation.

---

## 16. UI/UX & Responsive Design

- **Design tone:** Minimal, whitespace-driven, calm — no dense tables-of-everything or competing visual accents; status badges are the primary color/iconography carriers, everything else stays neutral.
- **Design tokens:** Spacing scale, neutral color palette, and the three status colors are defined once in `tailwind.config` so every component (badges, buttons, cards) draws from the same tokens rather than ad hoc values.
- **Mobile-first responsive approach:** Book list renders as `BookCard` stacks on narrow viewports and switches to `BookTable` at desktop breakpoints — same underlying data, layout adapts via Tailwind responsive classes rather than separate data-fetching logic.
- **Accessibility:** Semantic HTML (`<nav>`, `<table>` where tabular, `<form>`), ARIA labels on icon-only controls (status toggle, delete), full keyboard navigation through forms and the confirmation modal (focus trap, ESC-to-close).

---

## 17. Performance Considerations

- Server Components render static shell/layout once, shipping no JS for non-interactive chrome (Section 3).
- Add/Edit Book forms and `DeleteModal` are lazy-loaded (`next/dynamic`) since they're not needed on initial list/dashboard paint.
- Filter inputs are debounced (`useDebounce`) to avoid firing a query on every keystroke.
- `StatusBadge`, `BookCard`, and table rows are memoized where list length makes re-render cost non-trivial, preventing full-list re-renders on a single inline status change.

---

## 18. Security Considerations (Frontend Scope)

- **Token storage trade-off (Section 10):** Authorization-header storage avoids cross-origin cookie complexity but is more XSS-exposed than an httpOnly cookie. Mitigation: strict avoidance of `dangerouslySetInnerHTML`, no unsanitized third-party script inclusion, and keeping the dependency surface small — acceptable risk for a single-user personal tool, called out explicitly as a decision rather than an oversight.
- **XSS prevention:** React's default escaping covers rendered book/tag content; no raw HTML injection points exist in this design.
- **CSRF:** Not applicable under the header-based token model (CSRF is primarily a cookie-auth concern) — noted here to make clear the trade-off was considered, not missed.
- **Environment variables:** Only `NEXT_PUBLIC_API_BASE_URL` is exposed to the client bundle; no secrets are ever prefixed `NEXT_PUBLIC_`.
- **Client bundle hygiene:** No API keys, backend internals, or user data beyond the current session are ever embedded in client-shipped code.

---

## 19. Design Decisions

- **Next.js App Router over Pages Router:** Native support for route groups and nested layouts maps directly onto the public/protected split (Section 5); Server/Client Component granularity gives finer control over what ships as JS than the Pages Router's page-level-only model.
- **Tailwind CSS:** Utility-first styling enables the token-driven, consistent design tone (Section 16) without maintaining a separate CSS/component-library layer, and keeps styling co-located with markup for a small, focused component set.
- **Context API (session) + TanStack Query (server state):** Justified in full in Section 8 — right-sized tools for a small global-state surface and REST-backed CRUD data, avoiding both under-tooling (manual cache/loading logic) and over-tooling (Redux for one value).
- **React Hook Form + Zod:** Justified in Section 14 — re-render efficiency and a single shared source of truth for validation rules and types.

---

## 20. Scalability & Future Considerations

- **Large lists:** Current design assumes a personal-scale collection; pagination or infinite scroll on `/books` is a straightforward addition once list size warrants it, layering onto the existing TanStack Query setup via cursor/page query keys.
- **Design system growth:** The `components/ui/` primitives and Tailwind token layer are structured to absorb new components without restructuring existing ones.
- **Dark mode / i18n:** Both are additive to the token-based Tailwind setup (dark variant classes, string externalization) rather than architectural changes.
- **Caching evolution:** If multi-device sync or offline support is later required, TanStack Query's persistence plugins provide a natural upgrade path from the current in-memory cache.

---

## 21. Deployment Overview

```
Browser → Vercel (Next.js hosting) → Express API (separate deployment) → MongoDB Atlas
```

Frontend and backend are deployed independently, communicating over HTTPS via the base URL configured per environment.

**Required frontend environment variables:**

- `NEXT_PUBLIC_API_BASE_URL` — backend REST API base URL, environment-specific (dev/staging/prod).

---

## 22. Assumptions

- Single authenticated user per account; no multi-user collaboration or sharing.
- No offline mode — the app assumes an active network connection.
- No file uploads in v1 (no book cover images).
- No real-time sync across devices/tabs beyond standard query cache behavior within a session.
- Backend enforces all authoritative validation and authorization; frontend validation is a UX convenience layer only.

---

## 23. Future Enhancements

- Full-text search across titles/authors.
- Book cover images (would introduce file upload handling).
- Reading progress tracker (page/percent complete).
- Reading goals (e.g., books-per-year targets).
- Dark mode.
- Notifications/reminders.
- PWA/offline support.

---

## 24. Summary

This architecture separates concerns cleanly along three axes: rendering (Server Components for static chrome, Client Components for interactivity), state (global session via Context, server data via TanStack Query, ephemeral UI state locally), and integration (a single typed API layer mediating all backend communication). Route groups and nested layouts keep public and protected areas structurally isolated without duplicating guard logic, while a small, token-driven component library keeps the "intuitive, elegant, quietly powerful" design tone consistent as the app grows. The result is a frontend that is maintainable (clear folder/component boundaries), performant (minimal shipped JS, cached server state), accessible (semantic markup, keyboard/ARIA support throughout), and positioned to scale in both data volume and feature scope without architectural rework.
