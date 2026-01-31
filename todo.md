# TODO — Rental Management System (Summary & Workflow) 📋

## What I did (short) ✅
- Aligned auth behavior: added role select to register UI (renter|provider), enforced role validation in backend, and fixed mismatch in `User` model enums.
- Added client-side validations: required fields, email format, password >= 8, confirm-password.
- Implemented minimal Rentals API required by frontend: POST `/api/rentals`, GET `/api/rentals/my`, GET `/api/rentals`, PATCH `/api/rentals/:id/status` and updated `Rental` model statuses.
- Cleaned small frontend lint/type issues and removed unused imports/variables (conservative changes only).
- Updated docs (`instruction.md`) marking Phase 1 done and noting rental endpoints are available.

---

## Developer workflow — how to run & verify 🔁
1. Start backend: `cd backend && npm run dev` (or `node server.js`).
2. Start frontend: `cd frontend && npm run dev`.
3. Register flow:
   - Visit `/register` → fill form (choose `renter` or `provider`) → submit.
   - Backend returns `{ success, token, user }`; `AuthContext` stores token/user and redirects by role.
4. Create a rental:
   - On a property page, submit rental details → frontend calls POST `/api/rentals` (payload: `productId, startDate, endDate, quantity, rentalDuration`).
   - Verify rental appears in `/rentals` (GET `/api/rentals/my`).
5. Update rental status (provider/admin): PATCH `/api/rentals/:id/status` with `{ status }` and verify via GET `/api/rentals`.
6. Quick checks:
   - Lint: `cd frontend && npm run lint`
   - Types: `npx tsc --noEmit` (from repo root or frontend folder)

---

## Files changed (high level)
- Frontend: `app/register/page.tsx` (role + validation), small lint cleanups in `app/page.tsx`, `app/login/page.tsx`, `app/rentals/page.tsx`, `services/auth.service.ts`.
- Backend: `controllers/authController.js` (role validation, duplicate email handling), `models/User.js` enum cleaned, `controllers/rentalController.js` (new), `routes/rentalRoutes.js` (new routes), `models/Rental.js` (status enum updated), `routes/itemRoutes.js` left as deprecated (returns 410).
- Docs: `todo.md`, `instruction.md` updated.

---

## Quick next steps (recommended)
- Add unit tests for auth and rentals, and Playwright e2e tests for register → rent → view rentals.
- Improve error message standardization and consider httpOnly cookie token approach for security.

## Phase 7 progress
- Token expiry handling (backend `middleware/auth.js`) implemented — returns 401 with code `TOKEN_EXPIRED`.
- Central error handler added (`middleware/errorHandler.js`) to standardize responses.
- Frontend `lib/axios.ts` now clears auth, broadcasts `logout` to other tabs, and redirects to `/login?expired=1` on 401.
- `AuthContext` listens for logout broadcasts and performs auto-logout redirect.
- Unit tests added: `tests/protectMiddleware.test.js` and `tests/errorHandler.test.js`.

## Big TODO / Naming & Workflows — progress started ✅
- Fixed React key warning on `app/properties/page.tsx` (use `property._id ?? property.id` as a robust key and href fallback).
- Renamed UI labels from "Properties" → "Products/Items" where safe (header and navbar labels updated).
- Added placeholder pages (protected) for: `/orders`, `/quotations`, `/invoices` to begin Orders/Quotations/Invoices workflows.
- Backend: added initial `Order` and `Invoice` models plus controllers and routes (`/api/orders`, `/api/invoices`) to start workflow (create/get/update status).

Next steps:
- Create backend API endpoints/models for Orders/Invoices/Quotations and wire UI forms & lists.
- Start an incremental rename plan to move from "Property" to "Product" / "Rental Item" (codemod style changes recommended).
- Add E2E Playwright tests for Orders -> Invoice -> Payment flows.


---

_Last updated: Feb 1, 2026_
