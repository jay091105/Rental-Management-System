# instruction.md — Products, Settings & Reports
# Project: General Rental Management System
# Reference: UI wireframes (Products, Settings, Reports)
# Style: Bash-like Copilot instructions
# Goal: Implement remaining pages & workflows exactly as designed

# ==================================================
# GLOBAL TERMINOLOGY RULES
# ==================================================

TODO replace all "Property" references with "Product" or "Rental Item"
TODO ensure naming consistency across frontend and backend
TODO do not introduce property-specific logic anywhere

# ==================================================
# PRODUCTS PAGE
# ==================================================

# products list
TODO implement Products page
TODO support two views:
     - Kanban View (card layout)
     - List View (table layout)

TODO add view switcher (kanban <-> list)
TODO add pagination controls
TODO add search input

# product visibility
TODO allow every vendor to see:
     - their own products
     - products created by other vendors (read-only)
TODO visually mark unpublished products

# product actions
TODO allow provider/admin to:
     - create product
     - edit product
     - delete product
TODO restrict delete/edit to product owner or admin

# ==================================================
# PRODUCT CREATION / EDIT
# ==================================================

TODO implement New Product page
TODO product fields:
     - product name
     - product type (Goods | Service)
     - quantity on hand
     - unit type (dropdown)
     - sales price (per unit)
     - cost price (per unit)
     - category
     - vendor name (auto-filled)
     - image upload

TODO support service-type products:
     - deposit
     - downpayment
     - warranty

TODO add publish/unpublish toggle
TODO restrict publish toggle to admin only

# ==================================================
# SETTINGS MODULE
# ==================================================

# settings access
TODO restrict Settings page to admin only
TODO non-admin users can view limited profile info only

# --------------------------------------------------
# rental periods
# --------------------------------------------------

TODO implement Rental Periods settings
TODO allow admin to:
     - create rental period
     - edit rental period
     - delete rental period

TODO rental period fields:
     - name (Hourly, Daily, Weekly, Monthly, Yearly)
     - duration (number)
     - unit (hours | days | weeks | months | years)

# --------------------------------------------------
# attributes
# --------------------------------------------------

TODO implement Attributes settings
TODO allow admin to:
     - create attribute
     - choose display type:
          radio
          pills
          checkbox
          image
     - define attribute values
     - set default value or price (optional)

TODO link attributes to products

# --------------------------------------------------
# users (admin only)
# --------------------------------------------------

TODO implement Users management page
TODO allow admin to:
     - view all users
     - edit user role (admin | provider | renter)
     - enable/disable users

# --------------------------------------------------
# company settings
# --------------------------------------------------

TODO implement Company Settings page
TODO fields:
     - company name
     - email
     - phone
     - GST IN
     - address
     - company logo upload

TODO add Save / Discard behavior
TODO show security tab with Change Password

# ==================================================
# REPORTS MODULE
# ==================================================

TODO implement Reports page
TODO show analytics charts (bar/line)
TODO support filtering by:
     - date range
     - product
     - vendor
     - customer

TODO reporting rules:
     - admin sees platform-wide reports
     - vendor sees only their own data

# --------------------------------------------------
# import / export
# --------------------------------------------------

TODO allow report export:
     - PDF
     - Excel
     - CSV

TODO allow import (if applicable) with validation

# ==================================================
# NAVIGATION & FLOW
# ==================================================

TODO ensure navigation menu includes:
     - Orders
     - Products
     - Reports
     - Settings

TODO ensure every page is reachable via navigation
TODO ensure back navigation exists
TODO ensure role-based visibility for menu items

# ==================================================
# UI CONSISTENCY
# ==================================================

TODO ensure same layout across all pages
TODO reuse common components:
     - view switcher
     - search bar
     - pagination
     - action buttons

TODO keep UI consistent with wireframes
TODO do not redesign visuals

# ==================================================
# CLEANUP & ALIGNMENT
# ==================================================

TODO remove unused pages, routes, and components
TODO remove deprecated property-related files
TODO align backend models with frontend naming
TODO ensure no dead routes remain

# ==================================================
# FINAL CHECK
# ==================================================

TODO verify:
     - products -> orders -> invoices -> reports flow
     - settings changes persist correctly
     - role-based access enforced everywhere
     - no "property" wording exists
     - no broken navigation

# DEV SETUP (Turbopack / Next.js)

- If you encounter a stale dev lock error like "Unable to acquire lock at .next/dev/lock":
  - `npm run dev` will run a predev script that attempts to safely remove stale locks on Windows and Unix.
  - The cleanup script is located at `frontend/scripts/clean-next-lock.js` and will remove a stale lock if the owning PID is not running or if the lock is older than 5 minutes.

- If you see a Turbopack warning about multiple lockfiles, ensure only one lockfile exists within the frontend project (we use npm -> `package-lock.json`). Avoid having a root-level lockfile for the monorepo.

# END
