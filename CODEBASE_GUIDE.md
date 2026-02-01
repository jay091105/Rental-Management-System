# Rental Management System — Codebase Guide

> Concise, developer-focused reference for the repository. Use this as the single source of truth for architecture, workflows, run/test instructions, and where to change behavior.

Status: up-to-date as of 2026-02-01.

---

## Table of contents
- Project summary
- Quick start (dev)
- High-level architecture
- Important folders & files (quick map)
- Backend details (models, controllers, routes, utils)
- Frontend details (App Router, services, key components)
- Realtime & lifecycle (Order → Pickup → Return → Invoice → Payment)
- Invoicing (auto-generation + PDF + download)
- Testing strategy & how to run tests
- Common issues & troubleshooting
- Security & permissions
- CI / deploy notes
- Contribution checklist & recommended next work

---

## Project summary
- Stack: Node.js + Express + Mongoose (MongoDB) backend; Next.js (App Router) + React + TypeScript frontend; Tailwind CSS.
- Purpose: marketplace-style rental system supporting quotation → order → pickup → return → invoicing → payments with realtime order timeline (SSE).
- Design goals: DB-level reservation checks, backward-compatible APIs, small-step realtime (in-process EventEmitter), progressive test coverage.

---

## Quick start (developer)
Prereqs: Node 18+ recommended, MongoDB (local or Docker), pnpm/npm

1. Backend
   - cd `backend`
   - cp `.env.example` `.env` (fill MONGO_URI, JWT_SECRET)
   - npm install
   - npm run dev
2. Frontend
   - cd `frontend`
   - npm install
   - npm run dev
3. Tests
   - Backend unit tests: from repo root `npm --prefix backend test`
   - Frontend unit/e2e: frontend test commands (Playwright planned)

Quick dev tip: on Windows, avoid keeping the repo inside OneDrive (Next.js .next lockfile can cause `Access denied`).

---

## High-level architecture
- Backend (Express + Mongoose)
  - Models: `Order`, `Invoice`, `Product`, `Payment`, `Quotation`, `Rental`, `Pickup`, `Return`, `User`, `Notification`
  - Controllers: per-resource controllers in `backend/controllers/*`
  - Routes: mounted under `/api/*` (see `backend/routes`)
  - Utilities: reservation checks (`backend/utils/availability.js`), realtime emitter (`backend/utils/events.js`), PDF generator (`backend/utils/generateInvoicePDF.js`)
- Frontend (Next.js App Router)
  - Pages: `frontend/app/*` (app router layout + nested routes)
  - Services: `frontend/services/api.ts` — centralized API wrapper + tolerant response parsing
  - Contexts: `frontend/context/*` (auth + order context)
  - Components: small, focused UI pieces in `frontend/components`
- Realtime
  - In-process EventEmitter → SSE endpoint at `/api/orders/:id/stream` → client EventSource with reconnect/backoff
  - Note: not cluster-safe — consider Redis pub/sub for production

---

## Important files (quick map)
- Project root: `package.json`, `instruction.md`, `todo.md`
- Backend: `backend/server.js`, `backend/routes/*`, `backend/controllers/*`, `backend/models/*`, `backend/utils/*`
- Frontend: `frontend/app/*`, `frontend/components/*`, `frontend/services/api.ts`, `frontend/context/AuthContext.tsx`
- Tests: `backend/tests/*`, `frontend/tests/*`

Refer to `FOLDER_STRUCTURE.md` for a full tree.

---

## Backend — key concepts & where to change behavior
- Order creation: `backend/controllers/orderController.js` (request-time reservation checks via `utils/availability`) — safe place to change lifecycle rules.
- Reservation check (DB-level): `backend/utils/availability.js` — uses Mongo overlap aggregation.
- Pickup/Return lifecycle: `orderController.markPickup` / `markReturn` create `Pickup` / `Return` records and update `order.statusHistory`.
- Realtime events: `backend/utils/events.js` (singleton EventEmitter); order stream endpoint in `orderController.streamOrder`.
- Invoice handling:
  - Model: `backend/models/Invoice.js` (indexed on `order`, `vendor`, `customer`)
  - Controller: `backend/controllers/invoiceController.js` (create/get/download + authorization checks)
  - Auto-generation: `orderController.createInvoiceFromOrder(order)` — idempotent and invoked after order creation
  - PDF generation: `backend/utils/generateInvoicePDF.js` (returns stream built with pdfkit)
  - Download route: `GET /api/invoices/:id/download` (authorization: renter/vendor/admin)
- Notifications: `backend/models/Notification.js` + calls in relevant controllers (rental, payment, invoice); console fallback kept for dev.

---

## Frontend — key concepts & where to change behavior
- App Router pages live in `frontend/app/` (e.g., `properties/[id]/page.tsx`, `orders/[id]/page.tsx`, `provider/orders/page.tsx`).
- API wrapper: `frontend/services/api.ts` — tolerant of multiple server response envelopes; add new client endpoints here (e.g., `invoiceService.download(id)`).
- Auth: `frontend/context/AuthContext.tsx` — central auth + role-based redirects; use `useAuth()` for role gating.
- Realtime UI: order detail subscribes to SSE (`/api/orders/:id/stream`) and merges timeline updates into `order.timeline`.
- UI patterns: provider actions are gated by role checks in the page components; prefer server-driven status updates and timeline merging for correctness.

---

## Invoicing (what was added and where to look) 💡
- Auto invoice creation on order creation: `backend/controllers/orderController.createOrder` now calls `createInvoiceFromOrder(order)` (idempotent).
- Invoice model extended: `backend/models/Invoice.js` now includes `subtotal`, `taxAmount`, `totalAmount`, `securityDeposit`, `amountPaid`, `balanceDue`, `paymentStatus` and indexes.
- PDF generation stream: `backend/utils/generateInvoicePDF.js` (pdfkit) — returns a stream suitable for piping to Express response.
- Download endpoint: `GET /api/invoices/:id/download` implemented with strict authorization in `invoiceController.downloadInvoice`.
- Frontend download helpers: `frontend/services/api.ts` (invoiceService.download) + UI buttons in `frontend/app/orders/*` and `frontend/app/provider/orders/*`.
- Tests: new unit tests added under `backend/tests/` covering auto-generation, idempotency, and download authorization.

---

## API (selected endpoints)
- POST /api/orders — create order (now auto-creates invoice when applicable)
- GET /api/orders/:id — get order + timeline
- GET /api/orders/:id/stream — SSE order updates
- PATCH /api/orders/:id/status — update status (provider/admin)
- POST /api/orders/:id/pickup — provider marks pickup
- POST /api/orders/:id/return — provider marks return
- POST /api/invoices — create invoice (provider)
- GET /api/invoices/my — list invoices for current user
- GET /api/invoices/:id — get invoice
- GET /api/invoices/:id/download — download invoice PDF (renter/vendor/admin)

---

## Testing
- Unit tests: Jest in `backend/tests` — run `npm --prefix backend test`.
- Existing coverage: order lifecycle (including pickup/return), invoice/payment flows covered by unit tests; Playwright E2E planned for full renter→provider→realtime flow.
- New tests added: `invoiceAutoGeneration.test.js` (creates invoice on order create + idempotency) and download auth tests in `invoiceController.test.js`.

---

## Common issues & troubleshooting
- Windows + OneDrive: Next.js dev server may fail with `.next` lockfile Access Denied — move repo outside OneDrive.
- Missing local MongoDB: many tests and dev flows require Mongo; use Docker or `mongodb-memory-server` for CI.
- Realtime: current EventEmitter is in-process — not cluster-safe. Use Redis pub/sub for multi-instance deployments.

---

## Security & permissions
- All API routes are protected with `protect` middleware. Role checks enforced where required (order/invoice actions).
- Invoice download enforces: renter of order, provider of order, or admin.
- Do not expose raw DB IDs in logs in production.

---

## Deployment & CI notes
- Add `pdfkit` to backend production image (already added to `backend/package.json`).
- CI: add a job that runs backend unit tests (Mongo-backed or mongodb-memory-server), and a Playwright job for critical E2E.

---

## Recommended next work (short list)
1. Add Playwright E2E for renter→provider→SSE→invoice→download (high priority). ✅ planned
2. Replace in-process realtime with Redis pub/sub for multi-instance reliability.
3. Add invoice PDF visual regression snapshots to CI.
4. Implement invoice PDF templating (brandable headers) and add localization support.

---

## How to contribute (developer checklist)
- Create a feature branch: `feature/<short-desc>`
- Add/modify unit tests for every backend change
- Keep API response shapes backward-compatible
- Run `npm --prefix backend test` and `npm --prefix frontend test` locally before PR
- Include migration/backfill if changing data shapes (see `scripts/backfill-orphan-orders.js`)

---

## Quick reference — where to edit common items
- Change reservation rules: `backend/utils/availability.js`
- Order lifecycle behavior: `backend/controllers/orderController.js`
- Invoice PDF layout: `backend/utils/generateInvoicePDF.js`
- Frontend API envelopes & parsing: `frontend/services/api.ts`
- Provider UI: `frontend/app/provider/orders/page.tsx`

---

## Final checklist (status)
- [x] Request-time Order creation ✅
- [x] DB-level reservation checks ✅
- [x] SSE realtime pipeline ✅
- [x] Pickup & Return lifecycle ✅
- [x] Auto invoice generation on order creation ✅
- [x] Invoice PDF generation + secure download ✅
- [x] Frontend download buttons (renter + provider) ✅
- [x] Unit tests for invoice auto-generation & download auth ✅

---

If you want, I can now:
- open a PR with these docs + code changes, and include a PR description and reviewers; or
- add the Playwright E2E that covers the full renter→provider→invoice download flow.

