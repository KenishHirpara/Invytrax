# Plan: CoreInventory PRD

## What Done Looks Like
A fully functional, web-based Inventory Management System (CoreInventory) deployed for SMBs that accurately logs every stock movement across multiple warehouses, achieves ≥98% stock accuracy, reduces manual processing time by 60%, ensures zero untracked movements, and updates dashboard KPIs with <5 seconds latency.

## Won't Include in This Version
- Procurement and purchase order management
- Sales order creation
- Invoicing and billing
- Barcode / RFID scanning hardware integration
- Supplier and customer CRM profiles
- Advanced reporting or analytics (beyond defined KPI cards)
- Mobile native application

## App Flow
Based on the provided flow diagram and product overview, the user journey is structured as follows:

```mermaid
graph TD
    classDef page fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef process fill:#e1f5fe,stroke:#01579b,stroke-width:1px;
    classDef storage fill:#fff3e0,stroke:#e65100,stroke-width:1px;

    Login[Login / OTP Reset] ::: page --> Dashboard[Main Dashboard] ::: page
    Dashboard --> |Top Nav| Products[Products List] ::: page
    Dashboard --> |Operations Card| Receipts[Receipts List] ::: page
    Dashboard --> |Operations Card| Deliveries[Delivery Orders List] ::: page
    Dashboard --> |Side Nav| Transfers[Internal Transfers] ::: page
    Dashboard --> |Side Nav| Adjustments[Stock Adjustments] ::: page
    Dashboard --> |Side Nav| Ledger[Move History / Ledger] ::: page

    Products --> ProductDetail[Create / Edit Product] ::: page
    Receipts --> ReceiptDetail[Draft & Validate Receipt] ::: process
    Deliveries --> DeliveryDetail[Pick, Pack & Validate Delivery] ::: process
    Transfers --> TransferDetail[Execute Internal Transfer] ::: process
    Adjustments --> AdjustmentDetail[Reconcile Physical Count] ::: process

    ReceiptDetail -.->|On Validate: Increment Stock| AutoUpdate[(Stock Ledger / Database)] ::: storage
    DeliveryDetail -.->|On Validate: Decrement Stock| AutoUpdate
    TransferDetail -.->|On Validate: Move Location| AutoUpdate
    AdjustmentDetail -.->|On Validate: Sync Delta| AutoUpdate
```

## UI/UX Implementation Details
Based on the provided wireframes and mockups, the user interface should implement the following primary screens and functional blocks:

### 1. Authentication (Login / Sign Up)
- **Layout:** Centered card with the site logo ("CoreInventory").
- **Fields:** Email Address, Password.
- **Controls:** "Remember me for 30 days" toggle, Forgot Password link.
- **Actions:** Primary "Sign In" button with an arrow icon.
- **Alternatives:** "Or continue with" section supporting SSO and Google Login.
- **Footer Text:** "Protected by enterprise-grade 256-bit encryption" along with Privacy Policy, Terms of Service, Status, and Support links.

### 2. Main Dashboard (`/dashboard`)
- **Navigation Navbar/Sidebar:** 
  - **Top:** Global search bar ("Search data..."), Notifications bell, Help icon icon.
  - **Sidebar:** CoreInventory logo, User Profile (e.g., Alex Rivers / Manager), sections for Dashboard, Inventory, Receipts, Deliveries, Warehouses, Reports, Settings.
- **Primary KPIs (Top Row Cards):** 
  - Total Products (count)
  - Low Stock (warning icon, count)
  - Out of Stock (critical icon, count)
  - Pending Receipts (count)
  - Pending Deliveries (count)
- **Operation Summaries (Action Cards):** 
  - **Receipt Operations:** Quick view of To Receive, In Inspection, Completed counts, plus dynamic tags (e.g., "+4 New Shipments", "2 Delayed").
  - **Delivery Operations:** Quick view of Picking, Packing, Dispatched counts, plus tags (e.g., "80% On-time Rate", "3 High Priority").
- **Active Filters:** Dropdowns spanning Document Type, Status, Warehouse, Category.
- **Performance Banner:** Informational bar detailing metrics like "Warehouse performance is up 12%". Includes a "Download Weekly Report" button.

### 3. Receipts List View (`/operations/receipts`)
- **Header:** Title ("Receipts") with subtitle. Primary button "+ New Receipt".
- **Controls:** Search across Reference/SKU/Supplier, Status filter dropdown, Date Range filter, and refresh button.
- **Data Table:** 
  - Reference (clickable ID, e.g. WH/IN/00124)
  - Supplier (with avatar initial badge)
  - Scheduled Date
  - Source Location -> Destination Location
  - Status Pills (DONE, READY, DRAFT) 
  - Actions (ellipses menu)
- **Pagination:** Bottom right showing current items (e.g., 1 to 5 of 42) and page controls.

### 4. Receipt Detail / Validation View (`/operations/receipts/{id}`)
- **Header Structure:** Breadcrumbs across top (`Dashboard / Operations / Receipts`). Contextual document ID (e.g., REC/00001) next to "CoreInventory System".
- **Primary Actions:** "Validate" main button top right.
- **Status Tracker:** Horizontal tab bar / timeline indicating current state (Scheduled, Draft, Confirmed).
- **Core Form Fields (Read/Write inputs):** 
  - Receive From (Supplier Selection)
  - Source Location
  - Operation Type (Receipt)
  - Deadline (Date/Time)
  - Scheduled Date (Date/Time)
  - Responsible Person (e.g. Alex Johnson)
- **Operations & Products Line Items:**
  - Distinct block mapping Product Name, Quantity (input box), Unit of Measure (UOM), and a delete action.
  - "+ Add a Line" control point.
- **Internal Notes:** Large text area for visible warehouse notes.
- **Footing Actions:** Discard Changes, Print Slip, Validate Receipt.
- **Activity Log:** Bottom history timeline tracking who created and when.

### 5. Delivery List View (`/operations/delivery`)
- **Header:** Title ("Delivery") with Global Search, primary "+ New Delivery" button, and standard Export action.
- **Tabs:** All Deliveries, Pending, In Transit, Completed. Functional icon buttons for list vs grid view or filter menus.
- **Data Table:**
  - Reference ID
  - Customer 
  - Scheduled Date
  - Source -> Destination
  - Status Pills (In Transit, Pending, Completed, Delayed)
- **Bottom Summary KPIs:** contextual quick stats specifically for deliveries:
  - Today's Load (Total Units + percentage change)
  - Active Couriers (Driver counts)
  - Delivery Success Rate (Percentage vs Target)

### 6. Delivery Detail / Validation View (`/operations/delivery/{id}`)
- **Header Structure:** Breadcrumbs across top (`Dashboard / Operations / Delivery / DEL/00001`), Title header `DEL/00001` with created date.
- **Primary Actions:** "Print Label" and "Check Availability" (main button) top right.
- **Status Tracker:** Horizontal tab bar / timeline indicating current state (Draft, Ready, Done).
- **Core Form Fields (Delivery Details):**
  - Delivery Address (Customer info box)
  - Operation Type (Delivery Order)
  - Scheduled Date (Date/Time)
  - Source Location
- **Right Sidebar Context:**
  - State Note (e.g. "Waiting for availability... Checking WH/Stock.")
  - Timeline (Vertical progress: Draft Created, Availability Checked, Delivery Started)
  - Warehouse View preview image card.
- **Operations / Products Line Items:**
  - Product (Name and SKU)
  - Demand QTY
  - Done QTY (read-only input state)
  - Unit of Measure (UOM)
  - "+ Add a product" link.
- **Internal Notes:** Text area for visible delivery notes.

### 7. Move History / Ledger (`/move-history`)
- **Header:** Title ("Move History") with "Comprehensive read-only audit trail" subtitle. Primary buttons "Export Ledger" and "Print Report".
- **Filters Bar:**
  - Date Range picker
  - Product Search (Name/SKU input)
  - From Location (dropdown)
  - To Location (dropdown)
  - Status (dropdown)
  - "Reset" button.
- **Data Table:**
  - Date & Time
  - Product (Name and SKU)
  - From (Location name)
  - To (Location name)
  - Qty (bold formatting)
  - UOM
  - Status Pills (COMPLETED, PENDING, IN TRANSIT, FLAGGED)
  - Reference ID (clickable link to document)
- **Footer:** Pagination controls and System Audit Log Status Legend explaining status colors.

### 8. Products List View (`/products`)
- **Header:** Title ("Products") with subtitle. Primary button "+ New Product".
- **Controls Bar:** Search across name/SKU, Category dropdown, common category quick-filters (Electronics, Raw Materials), and "More Filters".
- **Data Table:**
  - Product Name (Icon + Name)
  - SKU
  - Category (badge pill)
  - UOM
  - On Hand Qty (bold formatting, red if 0)
  - Reorder Point
  - Status Pills (In Stock, Low Stock, Out of Stock)
- **Footer:** Pagination controls.

### 9. Create New Product View (`/products/new`)
- **Header:** Breadcrumbs, Title "Create New Product", Actions ("Discard", "Save Product").
- **Section 1: General Information:**
  - Product Name
  - SKU (Stock Keeping Unit)
  - Category (dropdown)
  - UOM (dropdown)
  - Initial Total Stock
- **Section 2: Stock per Location:**
  - "+ Add Location" button
  - Table lines with Location Name, Available (input), Reserved, Action (delete).
- **Section 3: Reordering Rules:**
  - Min Quantity (trigger alert)
  - Max Quantity (optimal level)
  - Auto-purchase notification note block.

### 10. Warehouse Settings (`/settings/warehouse`)
- **Sidebar Context:** Active in "Settings" menu item.
- **Header:** Title "Warehouse Settings"
- **Section 1: Add New Warehouse Form:**
  - Context box "Add New Warehouse"
  - Warehouse Name
  - Short Code
  - Full Address (textarea box)
  - "Cancel" and "Save Warehouse" buttons.
- **Section 2: Existing Warehouses (Grid View):**
  - Cards displaying Warehouse image, Name, Code, Address.
  - Active/Inactive status badge.
  - Edit and Delete quick icons.

### 11. Stock View (`/inventory/stock`)
- **Header:** Title ("Stock View") with subtitle "Monitor and update your product inventory levels efficiently."
- **Breadcrumbs:** `Dashboard > Inventory > Stock View`
- **Top Actions:** "Export" button and primary "Refresh Data" button.
- **Active Inventory Table Header:** Title with badge showing item count (e.g. "5 Items Listed").
- **Data Table Elements:**
  - PRODUCT (Name and SKU subtitle)
  - PER UNIT USED (e.g., 0.5 kg)
  - ON HAND (UPDATE) - An editable quantity input field with unit label (e.g. `[120] kg`).
  - DAYS TO USE (e.g., 240 days left, color coded red if low)
  - STATUS Pills (Optimal, Reorder Soon, Urgent Reorder)
- **Footer Actions:** Informational text ("User must update stock from the quantity fields above before saving.") alongside "Cancel" and primary "Save All Changes" button.
- **Bottom Summary KPI Cards:**
  - Fastest Depleting (Top item name, +/- % vs last week)
  - Low Stock Alerts (Count of items, quick description of items needing attention)
  - Average Stock Life (Days count + health status)

## Technology Stack
The application will be built using the following modern, type-safe stack:
- **Frontend Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **UI Components & Styling:** shadcn/ui and Tailwind CSS
- **API Layer:** tRPC for end-to-end type safety
- **State Management & Data Fetching:** TanStack Query (formerly React Query)
- **Database ORM:** Drizzle ORM
- **Database Engine:** PostgreSQL (Neon Serverless)
- **Authentication:** NextAuth.js v5

## Unresolved Questions
- [VERIFY: Expected initial data migration format or constraints (e.g., CSV imports for initial product catalog)?]
- [VERIFY: Hosting/deployment environment preferences (e.g., Vercel, AWS)?]

## Estimates (Ranges + Confidence)
| Task | Optimistic | Realistic | Pessimistic | Confidence |
|------|-----------|-----------|-------------|------------|
| Authentication & Access | 4h | 8h | 12h | High |
| Database Schema & Base Setup | 6h | 10h | 16h | High |
| Product Management | 8h | 12h | 20h | High |
| Warehouse & Location Management | 4h | 8h | 12h | High |
| Receipts (Inbound Stock) | 8h | 14h | 24h | Medium |
| Delivery Orders (Outbound Stock) | 8h | 14h | 24h | Medium |
| Internal Transfers | 6h | 10h | 16h | Medium |
| Stock Adjustments | 4h | 8h | 12h | High |
| Move History (Stock Ledger) | 6h | 10h | 16h | High |
| Dashboard & Real-time KPIs | 8h | 14h | 20h | Medium |
| Alerts & Smart Filters | 6h | 10h | 16h | Medium |

## Task Table
| # | Task | Agent | Depends on | Done when |
|---|------|-------|-----------|-----------|
| 1 | DB schema & Auth | database-architect | none | Schema migrated & user can login/logout |
| 2 | Product & Warehouse API | backend-specialist | #1 | CRUD operations fully functional & tested |
| 3 | Inbound/Outbound/Transfer Logic | backend-specialist | #2 | Document states & ledger updates pass tests |
| 4 | Product & Warehouse UI | frontend-specialist | #2 | Views list, create, edit items correctly |
| 5 | Operations & Ledger UI | frontend-specialist | #3 | Users can execute and trace operations |
| 6 | Dashboard & Alerts | frontend-specialist | #5 | Real-time KPIs and filters load < 5s |
| 7 | End-to-end Testing | test-engineer | #6 | All operation flows test positively |

## Review Gates
| Task | Tribunal |
|---|---|
| #1 Schema & Auth | /tribunal-database, /tribunal-backend |
| #2 & #3 API | /tribunal-backend |
| #4 - #6 UI | /tribunal-frontend |
| #7 End-to-end Tests | test-coverage-reviewer |

---

# Core Product Description & Features (Reference)

## Target Users
1. **Inventory Manager:** Oversees all stock operations... Creates and validates receipts, delivery orders, and adjustments. Monitors KPIs on the dashboard. Manages product catalog, categories, and reordering rules. Has full system access.
2. **Warehouse Staff:** Executes ground-level operations: picking, packing, shelving, counting. Performs internal transfers between locations. Operates within assigned warehouse scope.

## Core Modules & Features Setup
- **Authentication:** Email/password, OTP-based reset, Role-based redirects.
- **Dashboard:** Real-time KPI cards (total products in stock, low/out-of-stock items, pending receipts, pending deliveries, scheduled transfers), dynamic UI filters, statuses (Draft, Waiting, Ready, Done, Canceled).
- **Product Management:** Name, SKU/Code, Category, UOM, initial stock, stock availability per location, reordering rules.
- **Operations:**
  - **Receipts (Inbound):** Supplier linked, stock auto-increment on validation.
  - **Delivery Orders (Outbound):** Pick -> Pack -> Validate. Linked to customer. Stock auto-decrement on validation.
  - **Internal Transfers:** Warehouse -> Location transfers. Ledger logged.
  - **Stock Adjustments:** Reconcile physical counts vs system records. Delta logging.
- **Move History (Stock Ledger):** Immutable audit of movements filtering by date, product, location, type, and user.
- **Warehouse Management:** Multiple warehouses and sub-locations tracking.
- **Alerts & Smart Filters:** Low stock notifications and SKU-based global lookups.
