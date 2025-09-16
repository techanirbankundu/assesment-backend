## T-Model Architecture for Multi-Industry App (Design Draft)

This document proposes a T-Model architecture: one shared horizontal base (auth, profile, payments, shared UI) plus multiple vertical industry layers (Tour, Travel, Logistics) with their own UI and business logic. It focuses on architecture, data model, routing, maintainability, and outlines for three dashboards. Implementation is intentionally deferred until requirements are finalized.

---

### 1) Goals and Non-Goals
- **Goals**:
  - **Single codebase** with a strong base layer to avoid duplication.
  - **Industry-specific verticals**: Tour, Travel, Logistics (and extensible to Others).
  - **Configurable routing** to correct dashboard based on user profile’s `industryType`.
  - **Maintainability**: clear boundaries, shared components/services, minimal coupling.
- **Non-Goals**:
  - Full feature implementation for each industry.
  - Final UI/UX and complete data schemas for industry features.

---

### 2) High-Level T-Model
- **Base Layer (Horizontal Bar)**
  - Cross-cutting concerns: authentication, authorization, RBAC, logging, error handling, metrics.
  - Shared domain features: user profile, payments/billing, notifications, audit, file uploads.
  - Shared UI: layout shell, navigation primitives, design system components, data fetching utilities.
  - Shared backend services: `AuthService`, `UserService`, `PaymentService`, `NotificationService`.

- **Vertical Layers (Industry-Specific Columns)**
  - Encapsulated dashboards and business logic for each industry.
  - Separate routing namespaces and service modules per industry.
  - Clear dependency rule: verticals can depend on base, but base must not depend on verticals.

---

### 3) Data Model: Industry Selection
Add `industryType` to the user profile. Stored on the backend, editable in the profile UI.

- **Backend (DB/Schema)**
  - Column: `users.industry_type` ENUM('tour','travel','logistics','others') or VARCHAR with check.
  - Default: `others` (safe fallback).
  - Migration sketch:
    - Add column nullable with default `others`.
    - Backfill existing nulls to `others`.
    - Add constraint or enum type.

- **Backend (API)**
  - Update profile endpoint to accept `industryType`.
  - Validation: allow only ['tour','travel','logistics','others'].
  - Audit changes to profile updates.

- **Frontend**
  - Add dropdown selector on profile page.
  - Persist via existing profile update API.
  - Store in auth context/session to enable client-side routing decisions.

---

### 4) Routing Strategy to Industry Dashboards
Two complementary options (choose both for robustness):

1) **Server-Side Redirect (Preferred primary)**
   - On login (backend `authRoutes.js`), after token issuance, the client requests `/dashboard`.
   - Backend returns a 302 to `/dashboard/{industry}` or includes industry in JWT claims for the frontend to route.
   - Pros: secure, consistent; avoids client flashing wrong page.

2) **Client-Side Routing (Next.js)**
   - Frontend `dashboard/page.tsx` reads `industryType` from session/context and programmatically routes to `/dashboard/tour`, `/dashboard/travel`, `/dashboard/logistics`, or `/dashboard/others`.
   - Use a guard hook to redirect unauthenticated users to `/login`.

**Fallback**
 - If `industryType` missing or unrecognized: route to `/dashboard/others`.

---

### 5) Frontend Architecture (Next.js)
- **Foldering (proposal)**
  - `src/app/dashboard/page.tsx` → lightweight router/redirector only.
  - `src/app/dashboard/[industry]/page.tsx` → industry-specific entry.
  - `src/components/industry/` → shared primitives for verticals.
  - `src/components/ui/` → base design system (already present).

- **Shared code**
  - Auth context (`contexts/AuthContext.tsx`) exposes `user.industryType`.
  - `hooks/useAuth.ts` provides `isAuthenticated`, `user`, and utilities.
  - `lib/api.ts` provides typed API calls for profile update.

- **Industry modules** (examples)
  - `tour`: booking calendar, package management, vendor management, revenue glance.
  - `travel`: itinerary builder, flight/hotel search integrations, PNR management.
  - `logistics`: shipment tracking, fleet status, warehouse inventory, SLA alerts.

---

### 6) Backend Architecture (Express + Drizzle)
- **Base services** in `backend/services/` remain industry-agnostic.
- **Industry services**
  - Add directory per industry if/when business logic diverges, e.g., `services/tour/BookingService.js`.
  - Route grouping: `routes/dashboardRoutes.js` can branch by industry or delegate to sub-routers.
- **Auth/JWT**
  - Include `industryType` claim in JWT (non-authoritative; source of truth is DB).
- **Middleware**
  - `dashboardMiddleware.js` can verify access and normalize `req.industry`.

---

### 7) Maintainability Principles
- One-way dependency: base → no vertical imports.
- Shared utilities/components live in base; verticals compose them.
- Feature flags/gradual rollout for vertical features.
- Consistent error handling and logging across layers.
- Testing: unit tests at base, feature tests per vertical.

---

### 8) Security & Authorization
- Authenticate uniformly via base auth.
- Authorize with roles and industry context: e.g., `role=manager` in `industry=logistics`.
- Log sensitive actions; rate-limit profile updates.

---

### 9) Wireframe Outlines (Placeholder Content)

- **Tour Dashboard**
  - KPI cards: Upcoming tours, Booked seats, Revenue MTD.
  - Calendar: tour schedule with capacity.
  - List: active packages, quick edit CTA.
  - Alerts: low-capacity tours, pending vendor invoices.

- **Travel Dashboard**
  - KPI cards: Itineraries in progress, Confirmed trips, Conversion rate.
  - Widgets: itinerary builder shortcut, supplier search.
  - Feed: booking confirmations, changes, cancellations.
  - Integrations: flight/hotel search status.

- **Logistics Dashboard**
  - KPI cards: Active shipments, On-time %, Exceptions.
  - Map: fleet locations, route heatmap.
  - Table: warehouse inventory snapshots.
  - Alerts: SLA breaches, delayed pickups.

- **Others Dashboard (Fallback)**
  - Minimal: welcome, profile completion, quick links.

---

### 10) Data Flow: Industry Selection
1. User opens Profile → selects `Industry Type` (Tour/Travel/Logistics/Others).
2. Frontend calls `PATCH /api/profile` with `{ industryType }`.
3. Backend validates and persists to `users.industry_type`.
4. On next login or refresh, auth context contains `industryType`.
5. Visiting `/dashboard` redirects to `/dashboard/{industryType}`.

---

### 11) Migration & Rollout Plan
- v1: Add column, backend acceptance, and fallback routing to `others`.
- v2: Add profile UI selector (feature-flagged).
- v3: Introduce vertical routes with placeholder screens.
- v4: Gradually add industry-specific services and permissions.

---

### 12) Risks & Mitigations
- Risk: Base layer coupling to verticals → enforce boundaries and lint rules.
- Risk: Inconsistent behavior across verticals → shared contract tests and UX guidelines.
- Risk: Route sprawl → constrained routing scheme `/dashboard/{industry}`.
- Risk: Data model churn → start with flexible VARCHAR and migrate to ENUM later.

---

### 13) Open Questions
- Do industries require different roles/permissions by default?
- Are there cross-industry shared entities (e.g., vendors) with divergent rules?
- Which integrations per industry are in scope v1 vs later?


