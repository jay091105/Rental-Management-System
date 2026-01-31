# instruction.md — Remaining Work (Detailed Tasks & Acceptance)
# Rental Management System
# Scope: After auth + basic rentals API completion

> This document expands each phase into concrete backend and frontend tasks, API contracts, model fields, acceptance criteria, and tests. Follow conservative changes only — prioritize safety and maintaining existing auth flow.

## ✅ Completed (DO NOT REWORK)
- Auth: register/login, role-based redirect
- Role selection (renter | provider)
- Client-side auth validation
- Rentals API (create, list, status update)
- Rental status enum implemented
- Basic lint/type cleanup

---

## 🏠 PHASE 2 — Properties / Listings (CORE)
Goal: Full CRUD for properties with role-based access and validation.

Tasks (Backend):
- Ensure Product model includes: title, description, pricePerHour, pricePerDay, pricePerMonth, availableUnits (number), location, images[], category, deliveryCharges, deposit, owner (ref to User), status ('available'|'rented').
- Add validation in `productController.js` and model (required fields, numeric checks).
- Protect create/update/delete endpoints with `protect` + `authorize('provider','admin')` and verify `req.user._id === product.owner` for updates/deletes.
- Add ownership check middleware helper (small, reusable function).
- Ensure endpoints return standardized responses: { success, data, message }.

Tasks (Frontend):
- Provider: add/Edit Property forms (`/properties/add`, `/properties/[id]/edit`) calling `propertyService.create` and `propertyService.update`.
- Renter: Ensure listings view (`/properties`) and details (`/properties/[id]`) consume backend fields (pricePerDay/Month/Hour, availableUnits, deliveryCharges).
- Show validation errors from server on the form UI.

Acceptance Criteria:
- Provider can create, update, delete their properties; renters cannot access provider-only routes (receive 403).
- Required field validation prevents invalid saves.
- Property list shows correct price fields and status.

Tests:
- Unit tests for `productController.create`/`update` (validation + ownership reject).
- E2E test: Provider creates property → visible in listings; Renter views property details.

---

## 📆 PHASE 3 — Rental Business Rules
Goal: Enforce booking rules, ensure lifecycle moves, prevent double booking.

Tasks (Backend):
- On rental creation (`POST /api/rentals`):
  - Validate startDate < endDate.
  - Check overlapping rentals for product: query rentals with overlapping date ranges and active/approved statuses; reject if overlap.
  - Enforce availableUnits if product tracks units (decrement on approved).
- Add status transition rules in `rentalController.updateStatus`:
  - Allowed transitions only (e.g., pending -> approved/rejected; approved -> active; active -> completed; pending -> cancelled by renter).
- Implement scheduled job (cron or background task) or a simple on-request check to transition statuses based on current date (approved->active when startDate reached; active->completed when endDate passed). Keep minimal: provide an endpoint `POST /api/rentals/cron/advance` for now and add a TODO to run via cron / worker later.

Tasks (Frontend):
- Property detail: prevent rental creation when product not available or dates invalid (client-side validation before POST).
- Show clear status labels in rentals list with allowed actions (cancel request if pending, provider can approve/reject).

Acceptance Criteria:
- Backend rejects overlapping rental creation with 409 Conflict and clear message.
- Only valid transitions are accepted; invalid attempts return 400.
- Scheduled transition endpoint moves statuses for eligible rentals.

Tests:
- Unit tests for overlap detection and status transition rules.
- E2E: Create two overlapping requests as different renters → second should fail.

---

## 💳 PHASE 4 — Payments
Goal: Handle payments after approval and ensure rentals activate only on successful payment.

Tasks (Backend):
- Add `Payment` model: { rental: ref Rental, renter: ref User, provider: ref User, amount: Number, status: 'pending'|'paid'|'failed', transactionDate: Date, meta: Object }.
- Create `paymentController` with endpoints:
  - `POST /api/payments` (create payment record, optionally call mock gateway)
  - `POST /api/payments/:id/mock` (simulate success/failure for testing)
  - `GET /api/payments/:renterId` (renter payment history)
- Hook payments into rental workflow:
  - When provider approves a rental, create a payment record (status 'pending') and return payment id.
  - On payment success, mark payment 'paid', then change rental status to 'active' if startDate reached; otherwise mark as 'approved' until startDate.
  - If payment fails, rental remains `approved` but cannot become `active` until payment is paid. Optionally set `paymentRequired: true` on rental.

Tasks (Frontend):
- After approval, show payment UI to renter with mock gateway; call `POST /api/payments/:id/mock` to simulate outcome.
- Show payment history in renter dashboard.

Acceptance Criteria:
- Payment attached to rental and renter/provider; successful payment updates both payment and rental statuses.
- If payment fails, rental cannot activate.

Tests:
- Unit tests for `paymentController` and payment -> rental linkage.
- E2E: Approve rental -> process mock payment -> rental becomes active on start date.

---

## ⭐ PHASE 5 — Reviews & Ratings
Goal: Allow reviews only after completed rentals and show aggregated scores.

Tasks (Backend):
- Extend `Review` controller to verify rental completion and ensure single review per rental.
- Validate rating (1-5). Store review linked to rental/product and user.
- Recompute `Product.averageRating` and `Product.numOfReviews` on each review create/update/delete.

Tasks (Frontend):
- Allow review UI only on completed rentals/pages and prevent repeat reviews for same rental.
- Show average rating and review list on product detail page.

Acceptance Criteria:
- Attempts to review non-completed rentals return 403.
- Average rating updates correctly.

Tests:
- Unit tests for review guard (rental completion), rating validation.
- E2E: Complete rental -> submit review -> rating/summaries update.

---

## 📊 PHASE 6 — Dashboards (ROLE-BASED)
Goal: Dashboard surfaces the key information per role.

Provider APIs/UI:
- `GET /api/provider/properties` → properties owned by provider.
- `GET /api/provider/rentals` → rentals requested for provider's properties (filterable by status).
- UI: Provider dashboard lists properties and pending requests with approve/reject buttons.

Renter APIs/UI:
- `GET /api/renter/rentals` (or `/api/rentals/my`) -> active + history.
- UI: Renter dashboard shows active rentals, history, payment status, and review actions.

Admin APIs/UI:
- Admin pages to list users, properties, rentals; add ability to disable user.

Acceptance Criteria:
- Dashboards show real data tied to the authenticated user and respect role-based access.

Tests:
- E2E: Provider sees their properties and can approve a rental; renter sees updated status.

---

## 🧾 Orders / Invoices / Quotations (New - started)
Goal: Add ordering and billing flows for providers and renters.

Notes:
- Minimal backend models `Order` and `Invoice` created to start the workflow (create/get/update status).
- Frontend: placeholder pages added (`/orders`, `/quotations`, `/invoices`) and navbar links; wiring the full flow (forms, approvals, invoice generation) is next.

Acceptance criteria:
- Providers can view orders for their products.
- Providers can create invoices for orders; renters can view invoices related to their orders.
- Orders and invoices included in e2e flows in Phase 8.

---

## 🔐 PHASE 7 — Security & Robustness
Goal: Harden API, improve token handling, and standardize error responses.

Tasks:
- Add token expiry handling in `auth` middleware: detect expired token and return 401 with standardized body.
- Add central error-handling middleware that returns { success: false, message, errors?: [] }.
- Add a small helper to auto-logout on frontend when a 401 is received (current `axios` response interceptor already clears token — add redirect to /login behavior).
- Consider migration plan for httpOnly refresh tokens (design doc + TODO item — do not implement immediately).

Acceptance Criteria:
- 401 responses from backend cause frontend to clear auth and redirect to /login.
- Errors are standardized across controllers.

STATUS: Partially implemented ✅
- Backend: token expiry handling added in `middleware/auth.js` and a central `middleware/errorHandler.js` added which standardizes error responses and maps `TokenExpiredError` to { success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' }.
- Frontend: `lib/axios.ts` response interceptor now clears auth, broadcasts a `logout` event across tabs, and redirects to `/login?expired=1` for expired tokens.
- AuthContext: listens for `logout` storage events and handles auto-logout.
- Tests: unit tests added for protect middleware (`tests/protectMiddleware.test.js`) and `errorHandler` (`tests/errorHandler.test.js`).

Next steps / TODOs:
- Design doc and plan for httpOnly refresh tokens and token rotation.
- Add integration/e2e test to verify full logout and redirect behavior on expired token.

---

## 🧪 PHASE 8 — Testing
Goal: Add unit and e2e coverage for core flows.

Unit Tests:
- Controllers: auth, products, rentals, payments, reviews.
- Business rules: overlap detection, status transitions, payment gating.

E2E (Playwright):
- Register → Login → Redirect to appropriate dashboard
- Provider creates property → Renter creates rental → Provider approves → Renter pays → Rental becomes active/completed → Renter submits review
- Unauthorized access checks (protected routes)

CI:
- Add GitHub Actions workflow to run: lint, type-check, unit tests, and Playwright e2e (optional gated on main branch).

---

## 🚀 PHASE 9 — Finalization
Goal: Ship a robust release: tests, docs, pipeline.

Tasks:
- Finalize API documentation (OpenAPI minimal doc or README listing endpoints & required fields).
- Add environment variable docs and local dev instructions.
- Add GitHub Actions for `push to main` and PR checks.

Completion Criteria (detailed):
- Full rental → payment → review lifecycle works in e2e tests.
- Role-based access enforced at route & UI levels.
- Dashboards present accurate live data for each role.
- No unused routes/pages exist; lint/type checks pass in CI.

---

## Implementation notes & conservative rules
- Make minimal, incremental changes; do not rewrite large parts at once.
- Add unit tests where logic is added to enforce safety.
- Keep endpoints backward compatible where possible; deprecate safely when necessary.
- Document all API changes in README or a new `docs/api.md`.

---

_Last updated: Feb 1, 2026_
