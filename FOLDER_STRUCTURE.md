# Folder structure — Rental Management System (trimmed)

Root

- `instruction.md` — project instructions / notes
- `package.json` — workspace scripts (root)
- `todo.md` — project TODOs

backend/
- `package.json`
- `server.js` — Express app entry
- config/
  - `db.js`
- controllers/
  - `authController.js`, `orderController.js`, `invoiceController.js`, ...
- middleware/
  - `auth.js`, `errorHandler.js`, `ownership.js`
- models/
  - `User.js`, `Product.js`, `Order.js`, `Invoice.js`, `Pickup.js`, `Return.js`, `Rental.js`, `Payment.js`, `Notification.js`
- routes/
  - `authRoutes.js`, `orderRoutes.js`, `invoiceRoutes.js`, ...
- utils/
  - `availability.js`, `events.js`, `generateInvoicePDF.js`
- scripts/
  - `backfill-orphan-orders.js`
- tests/
  - many unit tests: `orderController.test.js`, `invoiceController.test.js`, `invoiceAutoGeneration.test.js`, ...

frontend/
- `package.json`, `next.config.*`, `tsconfig.json`
- app/ (Next.js App Router)
  - `page.tsx`, `globals.css`, `layout.tsx`
  - `properties/`, `products/`, `orders/`, `provider/`, `admin/`, `rentals/`, `invoices/` (pages and subpages)
- components/
  - `Navbar.tsx`, `OrderSummary.tsx`, `ProtectedRoute.tsx`, `Loading.tsx`, ...
- context/
  - `AuthContext.tsx`, `OrderContext.tsx`
- services/
  - `api.ts`, `auth.service.ts`, `axiosInstance.ts`
- lib/
  - `axios.ts`, `mockProducts.ts`
- public/
- scripts/
  - `clean-next-lock.js`
- tests/
  - `publish-toggle.spec.ts`, other frontend specs

Notes
- Tests are colocated in `backend/tests` and `frontend/tests`.
- Look for important flows in `backend/controllers/orderController.js` and `frontend/app/orders/[id]/page.tsx`.

