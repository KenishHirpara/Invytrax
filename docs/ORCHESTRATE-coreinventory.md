# /orchestrate — CoreInventory Build Plan

> **Plan Basis:** `docs/PLAN-coreinventory-prd.md`
> **Stack:** Next.js 14 + TypeScript + tRPC + Drizzle ORM + PostgreSQL (Neon) + shadcn/ui + TanStack Query + NextAuth v5
> **Protocol:** 3-Wave Sequential Dispatch with Tribunal gate between each wave.

---

## Phase A — Planning ✅ COMPLETE

- `project-planner` → `docs/PLAN-coreinventory-prd.md` written and approved
- No existing codebase — greenfield project, `explorer-agent` not required.

---

## Phase B — Implementation Waves

### Wave 1 — Foundation (Database + Auth + Security Baseline)

**Agents:** `database-architect` (primary) + `security-auditor` (parallel)  
**Tribunal Gate:** `/tribunal-database` + `/tribunal-backend`

#### `database-architect` Dispatch Payload
```json
{
  "agent": "database-architect",
  "task": "Design and implement the complete Drizzle ORM schema for CoreInventory",
  "stack": "Drizzle ORM + PostgreSQL (Neon Serverless) + TypeScript",
  "context_summary": "CoreInventory is a web-based IMS. All stock data is location-aware. Every stock movement must be immutably ledger-logged with product, quantity delta, source/dest location, user, timestamp, and linked document reference.",
  "deliverables": [
    "schema.ts — All tables: users, roles, warehouses, locations, products, categories, receipts, receipt_lines, deliveries, delivery_lines, transfers, transfer_lines, adjustments, stock_ledger, stock_per_location, reorder_rules",
    "relations.ts — Drizzle relational map",
    "migrations/ — Initial migration SQL files",
    "seed.ts — Dev seed data (2 warehouses, 10 products, 2 users)"
  ],
  "key_rules": [
    "stock_per_location: composite PK (product_id, location_id). Never a global stock total.",
    "stock_ledger: IMMUTABLE. No UPDATE or DELETE allowed. INSERT only. Enforced at DB level via trigger or application rule.",
    "All operations follow status machine: draft → waiting → ready → done | canceled. Stock only changes on 'done'.",
    "user_id + timestamp on every ledger entry — never nullable"
  ]
}
```

#### `security-auditor` Dispatch Payload
```json
{
  "agent": "security-auditor",
  "task": "Define auth security model and NextAuth v5 configuration for CoreInventory",
  "stack": "NextAuth v5 + Drizzle ORM + PostgreSQL + tRPC",
  "context_summary": "Two roles: Manager (full access) and Staff (scoped to assigned warehouses only). Auth: email/password + OTP password reset. Sessions must carry role and assigned warehouse IDs.",
  "deliverables": [
    "auth.ts — NextAuth v5 config: credentials provider + session strategy",
    "session.d.ts — Extended session type to include role and warehouseIds[]",
    "middleware.ts — Route protection by role (Manager vs Staff)",
    "otp-reset.ts — OTP generation + expiry logic for password reset flow"
  ],
  "key_rules": [
    "Passwords hashed with bcrypt (≥12 rounds)",
    "OTP expires in 10 minutes, single-use",
    "JWT must include: userId, role, warehouseIds[]",
    "Staff can ONLY query resources within their assigned warehouse IDs — enforced in tRPC context, not just UI"
  ]
}
```

**Wave 1 Done When:**
- [ ] Drizzle migrations run successfully against Neon PostgreSQL
- [ ] All tables created with correct constraints and indexes
- [ ] User can sign up, log in, and session role is returned correctly
- [ ] OTP password reset flow functional end-to-end
- [ ] `/tribunal-database` passes schema review

---

### Wave 2 — Backend API + Frontend Core

> **Prerequisite:** Wave 1 Tribunal gate passed.

**Agents:** `backend-specialist` + `frontend-specialist` (parallel)  
**Tribunal Gate:** `/tribunal-backend` + `/tribunal-frontend`

#### `backend-specialist` Dispatch Payload
```json
{
  "agent": "backend-specialist",
  "task": "Implement all tRPC routers and business logic for CoreInventory",
  "stack": "tRPC + Drizzle ORM + Next.js 14 App Router + NextAuth v5",
  "context_summary": "CoreInventory has 7 operation domains per the PRD. Key rule: stock only updates on document validation. Ledger is immutable and logged on every state change. Scope must be enforced at the tRPC context level for Staff role.",
  "deliverables": [
    "server/routers/products.ts — CRUD, stock per location query, reorder rules",
    "server/routers/warehouses.ts — CRUD warehouses + sub-locations",
    "server/routers/receipts.ts — Create, update status, validate (increments stock + logs ledger)",
    "server/routers/deliveries.ts — Create, pick/pack/validate (decrements stock + logs ledger)",
    "server/routers/transfers.ts — Create, validate (moves location metadata + logs ledger)",
    "server/routers/adjustments.ts — Create, validate (delta sync + logs ledger)",
    "server/routers/ledger.ts — Read-only ledger query with all filters",
    "server/routers/dashboard.ts — Aggregated KPI queries (total products, low stock, pending ops)",
    "server/context.ts — tRPC context: session, role, warehouse scope enforcement"
  ],
  "key_rules": [
    "Stock mutation ONLY via validated document transition (status → done). Never a direct stock update endpoint.",
    "Every validate() mutation must: 1) Update document status, 2) Mutate stock_per_location, 3) INSERT into stock_ledger — all in a DB transaction.",
    "Staff role: inject warehouse filter via context, do not rely on client to pass it.",
    "All SQL via Drizzle — no raw string interpolation."
  ]
}
```

#### `frontend-specialist` Dispatch Payload
```json
{
  "agent": "frontend-specialist",
  "task": "Implement all UI screens for CoreInventory using the design specifications in the PRD",
  "stack": "Next.js 14 App Router + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query + tRPC client",
  "context_summary": "CoreInventory has 11 distinct views per the PRD UI/UX spec. The design is clean, light-background with dark sidebar, indigo primary (#4F46E5), status pills (green/amber/red), paginated data tables across all list views.",
  "deliverables": [
    "app/(auth)/login — Login card with email/password + SSO/Google buttons",
    "app/(auth)/reset — OTP password reset flow",
    "app/(app)/dashboard — KPI cards + Receipt/Delivery operation summary cards + filters",
    "app/(app)/products — Product list table with SKU, category, on-hand qty, status pill",
    "app/(app)/products/new — Create product form (General Info + Stock per Location + Reorder Rules)",
    "app/(app)/inventory/stock — Stock view with editable ON HAND inputs + bottom KPI cards",
    "app/(app)/operations/receipts — Receipts list with filters + status pills",
    "app/(app)/operations/receipts/[id] — Receipt detail form with line items + validate action",
    "app/(app)/operations/delivery — Delivery list with tabs (All, Pending, In Transit, Completed)",
    "app/(app)/operations/delivery/[id] — Delivery detail with right sidebar timeline + product lines",
    "app/(app)/move-history — Ledger table with full filter bar + status legend",
    "app/(app)/settings/warehouse — Warehouse settings with add form + existing warehouses grid",
    "components/ui/status-pill.tsx — Reusable status pill component",
    "components/ui/data-table.tsx — Reusable paginated table with sort/filter",
    "components/layout/sidebar.tsx — App sidebar navigation"
  ],
  "key_rules": [
    "Use shadcn/ui as the base component library — do NOT reinvent primitives",
    "All server data via tRPC + TanStack Query — no direct fetch() calls in components",
    "Status pills: DONE=green, READY=blue, DRAFT=gray, CANCELED=red, WAITING=amber",
    "Sidebar active state must reflect current route",
    "Tables must be paginated — no infinite scroll for list views"
  ]
}
```

**Wave 2 Done When:**
- [ ] All 8 tRPC routers implemented and callable
- [ ] Document state transitions (draft → done) trigger stock updates and ledger entries in transaction
- [ ] All 11 screens render correctly with live tRPC data
- [ ] Role-based access enforced: Staff cannot access Manager-only routes
- [ ] `/tribunal-backend` passes API review
- [ ] `/tribunal-frontend` passes UI review

---

### Wave 3 — Testing + Final Validation

> **Prerequisite:** Wave 2 Tribunal gates passed.

**Agents:** `test-engineer` (primary)  
**Tribunal Gate:** Human Gate (final sign-off)

#### `test-engineer` Dispatch Payload
```json
{
  "agent": "test-engineer",
  "task": "Write and run integration + E2E tests for all CoreInventory operation flows",
  "stack": "Vitest (unit/integration) + Playwright (E2E) + Next.js 14",
  "context_summary": "CoreInventory is an IMS with immutable ledger. The most critical paths are: receipt validation increments stock, delivery validation decrements stock, adjustment syncs delta — all inside DB transactions. Every validated operation must have a corresponding ledger entry.",
  "deliverables": [
    "tests/unit/ledger.test.ts — Unit test: every stock mutation logs an immutable ledger entry",
    "tests/unit/stock-transaction.test.ts — Unit test: validate() runs stock mutation + ledger insert atomically",
    "tests/integration/receipts.test.ts — Integration: Create receipt → validate → confirm stock_per_location incremented",
    "tests/integration/deliveries.test.ts — Integration: Create delivery → validate → confirm stock_per_location decremented",
    "tests/integration/transfers.test.ts — Integration: Transfer → validate → confirm location metadata updated",
    "tests/integration/adjustments.test.ts — Integration: Adjustment → validate → confirm delta applied",
    "tests/e2e/auth.spec.ts — E2E: login, logout, OTP reset",
    "tests/e2e/receipt-flow.spec.ts — E2E: full receipt creation → validation → dashboard KPI update",
    "tests/e2e/delivery-flow.spec.ts — E2E: full delivery pick → pack → validate flow"
  ],
  "key_rules": [
    "Every test that mutates stock MUST assert a corresponding ledger entry exists",
    "Use test DB (in-memory or Neon branch) — never the production DB",
    "E2E tests use Playwright with unique test user per spec file to avoid state bleed",
    "Success metric: ≥95% coverage on all router handlers"
  ]
}
```

**Wave 3 Done When:**
- [ ] All unit tests pass
- [ ] All integration tests pass (stock mutations + ledger entries verified)
- [ ] All E2E flows pass (auth, receipt, delivery)
- [ ] Coverage ≥ 95% on router handlers
- [ ] Human Gate: User reviews final output and approves

---

## Cross-Wave Context Summary (Shared)

> This summary is injected into every worker dispatch as `context_summary` baseline.

```
CoreInventory — Web-based IMS for SMBs.
Stack: Next.js 14 + TypeScript + tRPC + Drizzle ORM + PostgreSQL (Neon) + shadcn/ui + TanStack Query + NextAuth v5.
Roles: Manager (full access) | Staff (scoped to assigned warehouses).
Stock rule: location-aware. stock_per_location table. Never a global total.
Ledger rule: immutable. INSERT only. Every stock change = one ledger row.
Document lifecycle: draft → waiting → ready → done | canceled.
Stock mutation: ONLY on transition to 'done'. All in DB transaction.
```

---

## Failure Protocol

| Failure | Action |
|---|---|
| Worker fails after 3 retries | HALT — report via `⚠️ Agent Failure Report` |
| Security scan fails | HALT all subsequent steps |
| Any test regression in Wave 3 | Return to Wave 2, isolate failing module |
| Tribunal rejects output | Worker reruns with Tribunal feedback as constraint |

---

## Ready to Execute?

```
✅ Orchestration plan ready: docs/ORCHESTRATE-coreinventory.md

Approve Wave 1 to begin?
  → Wave 1: database-architect + security-auditor
  → Tribunal: /tribunal-database + /tribunal-backend
```
