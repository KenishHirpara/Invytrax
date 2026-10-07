<div align="center">

<img src="https://img.icons8.com/fluency/96/warehouse.png" width="80" alt="CoreInventory Logo" />

# CoreInventory

### _Enterprise-Grade Warehouse & Inventory Management System_

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=for-the-badge&logo=trpc&logoColor=white)](https://trpc.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon_Postgres-Serverless-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)]()
[![Made with Love](https://img.shields.io/badge/Made_with-❤️-ff69b4?style=flat-square)]()

**Full-stack warehouse operations platform — glassmorphic UI · dark/light themes · PDF receipts · real-time KPIs**

<br/>

<a href="https://drive.google.com/file/d/1XK9ZFRHU1LCxZbf-i4nqr_pqQ4p6Pk5R/view?usp=drivesdk" target="_blank">
  <img src="https://img.shields.io/badge/▶_Watch_Full_Demo-Google_Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white" alt="Watch Demo on Google Drive" />
</a>
&nbsp;&nbsp;
<a href="https://github.com/Harmitx7/odoo/blob/core/docs/CoreInventory.MOV" target="_blank">
  <img src="https://img.shields.io/badge/▶_Watch_Full_Demo-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Watch Demo on GitHub" />
</a>

---

<table>
<tr>
<td align="center"><strong>🌑 Dark Mode</strong></td>
<td align="center"><strong>☀️ Light Mode</strong></td>
</tr>
<tr>
<td><img src="docs/screenshots/dashboard-dark.png" alt="Dashboard Dark" width="100%" /></td>
<td><img src="docs/screenshots/dashboard-light.png" alt="Dashboard Light" width="100%" /></td>
</tr>
</table>

<sub>📸 One-click theme switching — your preference is persisted across sessions</sub>

</div>

---

## 📖 Table of Contents

| Section | Section |
|---|---|
| [✨ Features at a Glance](#-features-at-a-glance) | [📸 Application Walkthrough](#-full-application-walkthrough) |
| [🌗 Dark & Light Mode](#-dark--light-mode) | [🏗️ Architecture](#️-architecture) |
| [🖨️ Print Receipt & PDF Export](#️-print-receipt--pdf-export) | [🛠️ Tech Stack](#️-tech-stack) |
| [📊 KPI Dashboard](#-real-time-kpi-dashboard) | [🚀 Getting Started](#-getting-started) |
| [📦 Stock View](#-stock-view--inventory-intelligence) | [📁 Project Structure](#-project-structure) |
| [📜 Move History](#-move-history--audit-ledger) | [🔐 tRPC API Procedures](#-trpc-api-procedures) |
| [📈 Analytics & Reports](#-analytics--reports) | [📦 Warehouse Operations](#-warehouse-operations) |

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 📊 **Real-Time KPI Dashboard** | Animated counters, status-aware cards (healthy/warning/critical), and live stock alerts |
| 🖨️ **Professional PDF Receipts** | One-click print-ready receipts with company branding, signatures block, and routing details |
| 🌗 **Dark / Light Mode** | Seamless theme switching with persistence — your preference is remembered across sessions |
| 📦 **Full Warehouse Operations** | Create Receipts, Deliveries, Transfers, and Adjustments with a guided multi-step workflow |
| 🔍 **Smart Stock Alerts** | Automatic detection of low-stock and out-of-stock items with direct review links |
| 🔄 **Operation Lifecycle** | Draft → Waiting → Ready → Done / Canceled — full status tracking with validation gates |
| 🏭 **Multi-Warehouse Support** | Manage multiple warehouses and storage locations with zone-level granularity |
| 📜 **Move History Ledger** | Complete audit trail of every stock movement with timestamps and user attribution |
| 📈 **Analytics & Reports** | Live summary of inventory movement, operational status, and recent ledger entries |
| 🎨 **Glassmorphic Premium UI** | Frosted-glass design with gradients, glow effects, and micro-animations |
| 📱 **Fully Responsive** | Desktop, tablet, and mobile with adaptive sidebar/bottom-nav |
| 🔐 **NextAuth Authentication** | Secure login with session management and role-based access |
| ⚙️ **Settings & Profile** | Profile management, role info, password reset, notifications |

---

## 🔑 Highlighted Features

### 🌗 Dark & Light Mode

> **⭐ Highlight Feature** — Premium dual-theme system powered by `next-themes`

Toggle between themes with a single click. Preference is persisted via `localStorage`.

| | Dark Mode ⬡ | Light Mode ☀️ |
|---|---|---|
| **Background** | Deep OLED blacks (`oklch(10%)`) | Soft paper white (`oklch(98%)`) |
| **Surfaces** | Frosted glass with subtle borders | Clean white cards with light borders |
| **Accent** | Warm amber/gold | Same amber — consistent brand |
| **Persistence** | ✅ Saved to localStorage | ✅ Survives refresh & navigation |

---

### 🖨️ Print Receipt & PDF Export

> **⭐ Highlight Feature** — One of the standout capabilities of CoreInventory.

The system generates **professional, print-ready receipt documents** for every warehouse operation — receipts, deliveries, transfers, adjustments, and even full stock inventory reports.

<div align="center">

<table>
<tr>
<td align="center"><strong>📄 Goods Receipt Note</strong></td>
<td align="center"><strong>📊 Inventory Adjustment Report</strong></td>
</tr>
<tr>
<td><img src="docs/screenshots/receipt-pdf.png" alt="Goods Receipt Note PDF" width="100%" /></td>
<td><img src="docs/screenshots/print-stock-report.jpeg" alt="Stock Inventory Report PDF" width="100%" /></td>
</tr>
</table>

<sub>↑ Left: Goods Receipt Note with product catalog • Right: Inventory Adjustment with stock levels & status indicators</sub>

</div>

#### What Makes It Special:

| Aspect | Detail |
|---|---|
| 🏢 **Company Branding** | Includes the CoreInventory logo and "Warehouse Management System" tagline |
| 📋 **Operation Details** | Date, status, created by, and reference number — all clearly formatted |
| 🗺️ **Routing Section** | Shows **Source** and **Destination** locations with human-readable names |
| 📦 **Product Lines Table** | Clean table with product name, SKU, category, UoM, quantities, and stock status |
| 📝 **Notes Section** | Any remarks or internal notes are rendered in a styled block |
| ✍️ **Signature Blocks** | Three signature lines: _Prepared By_, _Verified / Authorized By_, _Carrier / Receiver_ |
| 🕐 **Timestamp Footer** | Auto-generated date/time stamp showing when the document was produced |
| 🖨️ **Clean Print Output** | Sidebar, header, and navigation are automatically hidden — only the receipt prints |
| 📊 **Stock Reports** | Dedicated button to print full stock inventory with current levels and status per item |

#### How It Works:

```
1. Navigate to any operation detail page (e.g., /operations/[id])
2. Click the "Print PDF" button in the action bar
3. The browser print dialog opens with a clean, white receipt
4. Save as PDF or send directly to printer
```

> 💡 **Bonus:** The "Print Catalog" / "Print Stock Report" / "Print Ledger" buttons on the Products, Stock View, and Reports pages generate comprehensive inventory reports with all items, their stock levels, and status indicators — perfect for board meetings and audits.

---

### 📊 Real-Time KPI Dashboard

<div align="center">
<img src="docs/screenshots/dashboard-dark-full.jpeg" alt="Full Dashboard View" width="85%" />
</div>

| Card | What It Shows | Status Indicator |
|---|---|---|
| **Total Products** | All products in catalog | 🟢 Healthy |
| **Low Stock** | Products below minimum threshold | 🟡 Warning (pulse animation) |
| **Out of Stock** | Products with zero quantity | 🔴 Critical (urgent pulse) |
| **Pending Receipts** | Incoming goods awaiting processing | 🟢 Normal |
| **Pending Deliveries** | Outbound orders to fulfill | 🟢 Normal |

#### Additional Dashboard Sections:

- **⚠️ Low Stock Alerts** — Products that need immediate review with remaining quantity and min threshold
- **📥 Receipt Operations** — Live counters for To Receive / In Inspection / Completed with pending shipment badges
- **📤 Delivery Operations** — Picking / Packing / Dispatched counters with real-time refresh indicator
- **📡 Live Tracking** — "Warehouse performance is tracking live" banner with auto-refresh every 30 seconds
- **📋 View Ledger** — Quick access to the full stock movement audit trail

---

### 📦 Stock View & Inventory Intelligence

<div align="center">
<img src="docs/screenshots/stock-inventory.png" alt="Stock View" width="85%" />
</div>

| Feature | Detail |
|---|---|
| 📊 **Stock Level Bars** | Color-coded progress bars (green, amber, red) with min/max thresholds |
| 🏭 **Warehouse Breakdown** | Per-location quantities (e.g., "Delhi North-Zone: 726 · Pune Hub: 46") |
| 🏷️ **Status Badges** | In Stock / Low Stock / Out of Stock — instant visual identification |
| 📤 **Export Report** | One-click "Print Stock Report" generates a PDF |
| 📈 **Percentage Indicators** | Exact stock % per product for quick assessment |

---

### 📜 Move History & Audit Ledger

A complete, **immutable audit trail** of every stock movement across all operations.

<div align="center">
<img src="docs/screenshots/move-history.jpeg" alt="Move History Ledger" width="85%" />

> _Full audit ledger showing Date, Operation Type (color-coded: Delivery ↓ red, Transfer ⇄ blue), Reference, Product, SKU, Location, Delta (+/-), and User attribution._
</div>

#### What Makes It Powerful:

- **🔴 Red deltas** for stock decreases (deliveries, outbound transfers)
- **🟢 Green deltas** for stock increases (receipts, inbound transfers)
- **🔗 Clickable references** — jump directly to the related operation detail
- **👤 User attribution** — track who made every movement
- **🔍 Filterable** — "All Operations" dropdown to filter by Receipt, Delivery, Transfer
- **🖨️ Print Ledger** — Export the full audit trail as a PDF document

---

### 📈 Analytics & Reports

A dedicated **reporting dashboard** with KPI summary, recent movement summary, and export capabilities.

<div align="center">
<img src="docs/screenshots/reports.jpeg" alt="Analytics & Reports" width="85%" />

> _Reports page with Total Active Products, Low Stock Items, Pending Deliveries, Pending Receipts, Out of Stock, Recent Ledger Entries, and Recent Movement Summary._
</div>

#### Report Dashboard Cards:

| Card | Description |
|---|---|
| **Total Active Products** | Products with `isActive = true` |
| **Low Stock Items** | Products below minimum reorder quantity |
| **Pending Deliveries** | Deliveries not yet dispatched |
| **Pending Receipts** | Inbound shipments awaiting validation |
| **Out of Stock** | Locations with on-hand quantity = 0 |
| **Recent Ledger Entries** | Latest stock movements across all ops |

Plus **"Print Stock Report"** and **"View Full Ledger"** quick action buttons.

---

## 📸 Full Application Walkthrough

<div align="center">

### 🔐 Login & Authentication
<img src="docs/screenshots/login.jpeg" alt="Login Page" width="70%" />

> _Email/password auth · Google & SSO sign-in · 256-bit encryption · "Remember me" option_

---

### 📊 Dashboard
<img src="docs/screenshots/dashboard-dark-full.jpeg" alt="Dashboard" width="85%" />

> _KPI cards · low-stock alerts · receipt/delivery counters · live warehouse tracking_

---

### 📦 Product Catalog

<img src="docs/screenshots/product-catalog.png" alt="Catalog Dark" width="100%" />


> _SKU · category · UoM · stock levels · status badges · Print Catalog · Add Product_

---

### 📈 Stock View
<img src="docs/screenshots/stock-inventory.png" alt="Stock View" width="85%" />

> _Min/max thresholds · color-coded progress bars · warehouse-level breakdown · Print Stock Report_

---

### 📥 Receipts
<img src="docs/screenshots/receipts-list.jpeg" alt="Receipts" width="85%" />

> _Supplier · destination · status pills (WAITING / DONE / READY) · Set Ready / Validate actions_

---

### 📤 Deliveries
<img src="docs/screenshots/deliveries-list.jpeg" alt="Deliveries" width="85%" />

> _Customer · departure location · status tracking · Pick action for drafts_

---

### 🔄 Internal Transfers
<img src="docs/screenshots/transfers-list.jpeg" alt="Transfers" width="85%" />

> _Source → destination · date · status · detail view_

---

### 📜 Move History
<img src="docs/screenshots/move-history.jpeg" alt="Move History" width="85%" />

> _Color-coded deltas · operation types · product tracking · user attribution_

---

### 📈 Analytics & Reports
<img src="docs/screenshots/reports.jpeg" alt="Reports" width="85%" />

> _KPI summary cards · recent movements · Print Stock Report · View Full Ledger_

---

### 🏭 Warehouse Settings
<img src="docs/screenshots/warehouse-settings.jpeg" alt="Warehouse Settings" width="85%" />

> _Multi-warehouse zones · General Receiving · Bulk Storage · Pick Face · Cold Storage_

---

### ⚙️ General Settings
<img src="docs/screenshots/general-settings.jpeg" alt="Settings" width="85%" />

> _Profile · role & access · password management · notification preferences_

---

### 🖨️ Print — Goods Receipt Note
<img src="docs/screenshots/receipt-pdf.png" alt="Receipt PDF" width="60%" />

> _Company branding · product table · routing details · signature blocks · Save as PDF_

---

### 🖨️ Print — Inventory Adjustment
<img src="docs/screenshots/print-stock-report.jpeg" alt="Stock Report" width="50%" />

> _SKU · product description · on-hand quantities · UoM · stock level status_

</div>

---

## 🏗️ Architecture

> **Monolithic Full-Stack** — Single Next.js 16 deployment with embedded tRPC API layer.

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Next.js 16 (App Router)                          │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    CLIENT (React 19 + RSC)                    │   │
│  │                                                               │   │
│  │  ┌───────────┐ ┌───────────┐ ┌────────────┐ ┌────────────┐    │   │
│  │  │ Dashboard │ │ Inventory │ │ Operations │ │  Settings  │    │   │
│  │  │  KPIs     │ │ Products  │ │ Receipts   │ │  Profile   │    │   │
│  │  │  Alerts   │ │ Stock     │ │ Deliveries │ │  Warehouse │    │   │
│  │  │  Reports  │ │ Catalog   │ │ Transfers  │ │  Auth      │    │   │
│  │  └─────┬─────┘ └─────┬─────┘ └──────┬─────┘ └──────┬─────┘    │   │
│  │        └─────────────┴──────────────┴──────────────┘          │   │
│  │                          │                                    │   │
│  │              ┌───────────┴────────────┐                       │   │
│  │              │  @trpc/react-query v11 │                       │   │
│  │              │  Type-safe RPC client  │                       │   │
│  │              └───────────┬────────────┘                       │   │
│  └──────────────────────────┼────────────────────────────────────┘   │
│                             │  tRPC HTTP calls                       │
│  ┌──────────────────────────┼────────────────────────────────────┐   │
│  │                   SERVER (tRPC v11 Router)                    │   │
│  │                                                               │   │
│  │  ┌───────────┐ ┌───────────┐ ┌────────────┐ ┌────────────┐    │   │
│  │  │ dashboard │ │ products  │ │  receipts  │ │ warehouses │    │   │
│  │  │ .router   │ │ .router   │ │ deliveries │ │ .router    │    │   │
│  │  │           │ │           │ │ transfers  │ │            │    │   │
│  │  │           │ │           │ │ adjustments│ │            │    │   │
│  │  └─────┬─────┘ └─────┬─────┘ └──────┬─────┘ └──────┬─────┘    │   │
│  │        └─────────────┴──────────────┴──────────────┘          │   │
│  │                          │                                    │   │
│  │              ┌───────────┴────────────┐                       │   │
│  │              │  Drizzle ORM (v0.45)   │                       │   │
│  │              │  Type-safe SQL queries │                       │   │
│  │              └───────────┬────────────┘                       │   │
│  └──────────────────────────┼────────────────────────────────────┘   │
│                             │                                        │
│  ┌──────────────────────────┼──────────────┐  ┌──────────────────┐   │
│  │        NextAuth v5       │              │  │   jsPDF + auto   │   │
│  │  Session · Credentials   │              │  │   table          │   │
│  │  Role-based access       │              │  │   PDF generation │   │
│  └──────────────────────────┘              │  └──────────────────┘   │
└────────────────────────────────────────────┼─────────────────────────┘
                                             │
                                             ▼
                                  ┌──────────────────┐
                                  │  Neon PostgreSQL │
                                  │   (Serverless)   │
                                  └──────────────────┘
```

---

## 📦 Warehouse Operations

CoreInventory supports **4 types of inventory operations**, each with a complete lifecycle:

### Operation Types

| Type | Icon | Purpose | Screenshot |
|---|---|---|---|
| **Receipt** | 📥 | Receive incoming stock from external suppliers into a warehouse location | See [Receipts List](#8️⃣-receipts-incoming-goods) |
| **Delivery** | 📤 | Ship outbound stock to external customers from a warehouse location | See [Deliveries List](#9️⃣-deliveries-outbound-orders) |
| **Transfer** | 🔄 | Move stock between internal warehouse locations | See [Transfers List](#🔟-internal-transfers) |
| **Adjustment** | ✏️ | Correct inventory discrepancies (count corrections, damage write-offs) | — |

### Operation Lifecycle

```
  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
  │  DRAFT  │ ──▶ │ WAITING │ ──▶ │  READY  │ ──▶ │  DONE   │
  └─────────┘     └─────────┘     └─────────┘     └─────────┘
       │                                                 
       │               ┌───────────┐                     
       └─────────────▶ │ CANCELED  │                     
                       └───────────┘                     
```

Each transition is **permission-gated** and updates the stock ledger atomically. Actions like "Set Ready", "Validate", and "Pick" appear contextually based on the current status.

---

## 🛠️ Tech Stack

### UI Layer
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1 | App Router, RSC, API routes |
| **React** | 19.2 | Concurrent rendering |
| **Tailwind CSS** | 4 | Utility-first styling with `@theme` tokens |
| **shadcn/ui** | 4 | Accessible component primitives |
| **Lucide React** | 0.577 | Icon library |
| **next-themes** | — | Dark/Light mode with SSR |

### Data Layer
| Technology | Version | Purpose |
|---|---|---|
| **tRPC** | 11.12 | End-to-end type-safe API |
| **@tanstack/react-query** | 5.90 | Server state, caching, invalidation |
| **Drizzle ORM** | 0.45 | Type-safe SQL with schema-first design |
| **Neon PostgreSQL** | Serverless | Serverless Postgres (branching, auto-scale) |
| **Zod** | 4.3 | Runtime schema validation |

### Auth & Security
| Technology | Version | Purpose |
|---|---|---|
| **NextAuth (Auth.js)** | v5 beta | Session management, credential provider |
| **bcryptjs** | 3.0 | Password hashing |
| **Drizzle Adapter** | 1.11 | NextAuth ↔ Drizzle integration |

### PDF & Reports
| Technology | Version | Purpose |
|---|---|---|
| **jsPDF** | 4.2 | Client-side PDF generation |
| **jspdf-autotable** | 5.0 | Auto-formatted data tables in PDFs |

### Dev & Testing
| Technology | Version | Purpose |
|---|---|---|
| **TypeScript** | 5.x | Static type safety |
| **Vitest** | 4.1 | Unit testing |
| **Testing Library** | 16.3 | Component testing |
| **Drizzle Kit** | 0.31 | Schema migrations & studio |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Neon PostgreSQL** account ([neon.tech](https://neon.tech)) or local Postgres

### 1️⃣ Clone & Install

```bash
git clone https://github.com/Harmitx7/odoo.git
cd odoo/stitch
npm install
```

### 2️⃣ Configure Environment

Create `stitch/.env.local`:

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
AUTH_SECRET="your-auth-secret-here"
```

### 3️⃣ Run Migrations & Seed

```bash
npm run db:generate    # Generate migration SQL
npm run db:migrate     # Apply to database
npm run db:seed        # Seed demo data
```

### 4️⃣ Start Development

```bash
npm run dev
```

App opens on **http://localhost:3000** 🎉

### Useful Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run db:seed` | Seed sample data |
| `npm run type-check` | TypeScript validation |
| `npm run lint` | ESLint check |

---

## 📁 Project Structure

```
odoo/
├── stitch/                          # ← Full-stack Next.js monolith
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/              # 🔐 Auth pages
│   │   │   │   ├── login/           #    Login page
│   │   │   │   └── reset-password/  #    Password reset
│   │   │   ├── (app)/               # 🏠 Protected app shell
│   │   │   │   ├── dashboard/       #    KPI dashboard
│   │   │   │   ├── products/        #    Product catalog
│   │   │   │   ├── inventory/       #    Stock view
│   │   │   │   ├── operations/
│   │   │   │   │   ├── receipts/    #    📥 Incoming goods
│   │   │   │   │   ├── delivery/    #    📤 Outbound orders
│   │   │   │   │   ├── transfers/   #    🔄 Internal moves
│   │   │   │   │   └── adjustments/ #    ✏️ Stock corrections
│   │   │   │   ├── move-history/    #    📜 Audit ledger
│   │   │   │   ├── reports/         #    📈 Analytics
│   │   │   │   ├── settings/        #    ⚙️ Profile & config
│   │   │   │   └── layout.tsx       #    App shell + sidebar
│   │   │   ├── api/
│   │   │   │   ├── auth/            #    NextAuth route handler
│   │   │   │   └── trpc/            #    tRPC HTTP endpoint
│   │   │   ├── globals.css          #    Design tokens + themes
│   │   │   └── layout.tsx           #    Root layout
│   │   │
│   │   ├── server/                  # 🖥️ tRPC Backend
│   │   │   ├── trpc.ts              #    Context, middleware, auth
│   │   │   ├── root.ts              #    Merged app router
│   │   │   └── routers/
│   │   │       ├── dashboard.ts     #    KPI aggregation queries
│   │   │       ├── products.ts      #    Product CRUD
│   │   │       ├── receipts.ts      #    Receipt operations
│   │   │       ├── deliveries.ts    #    Delivery operations
│   │   │       ├── transfers.ts     #    Transfer operations
│   │   │       ├── adjustments.ts   #    Adjustment operations
│   │   │       ├── warehouses.ts    #    Warehouse & locations
│   │   │       ├── ledger.ts        #    Stock movement audit
│   │   │       └── users.ts         #    User management
│   │   │
│   │   ├── db/                      # 🗄️ Database Layer
│   │   │   ├── schema.ts            #    Drizzle table definitions
│   │   │   ├── relations.ts         #    Table relationships
│   │   │   ├── index.ts             #    DB connection (Neon)
│   │   │   ├── seed.ts              #    Production seed data
│   │   │   └── mock-seed.ts         #    Demo data generator
│   │   │
│   │   ├── components/              # 🧩 UI Components
│   │   │   ├── layout/sidebar.tsx   #    Navigation sidebar
│   │   │   ├── profile/             #    Edit profile modal
│   │   │   ├── theme-provider.tsx   #    Dark/Light mode
│   │   │   ├── theme-toggle.tsx     #    Theme switch button
│   │   │   └── ui/                  #    shadcn/ui primitives
│   │   │       ├── button.tsx       #      Button variants
│   │   │       ├── card.tsx         #      Card container
│   │   │       ├── table.tsx        #      Data tables
│   │   │       ├── badge.tsx        #      Status badges
│   │   │       ├── status-pill.tsx  #      Operation status
│   │   │       ├── select.tsx       #      Dropdown select
│   │   │       └── ...              #      + input, label, etc.
│   │   │
│   │   ├── lib/                     # 🔧 Utilities
│   │   │   ├── generate-pdf.ts      #    PDF receipt generator
│   │   │   ├── trpc.tsx             #    tRPC client provider
│   │   │   ├── utils.ts             #    Shared utilities (cn)
│   │   │   └── otp.ts               #    OTP helper
│   │   │
│   │   ├── auth.ts                  #    NextAuth config
│   │   ├── middleware.ts            #    Route protection
│   │   └── types/                   #    TypeScript declarations
│   │
│   ├── drizzle/                     # 📋 SQL Migrations
│   ├── drizzle.config.ts            #    Migration config
│   ├── vitest.config.ts             #    Test runner config
│   └── package.json
│
├── docs/screenshots/                # 📸 README images
└── README.md                        # ← You are here!
```

---

## 🔐 tRPC API Procedures

> All procedures are **end-to-end type-safe** via tRPC v11. No REST endpoints — call them directly from React components.

### `dashboard` Router
| Procedure | Type | Description |
|---|---|---|
| `getKpis` | `query` | KPI summary (total, low stock, out of stock, pending) |
| `getRecentOps` | `query` | Latest operations across all types |

### `products` Router
| Procedure | Type | Description |
|---|---|---|
| `list` | `query` | All products with stock levels |
| `getById` | `query` | Single product with location breakdown |
| `create` | `mutation` | Add new product |
| `update` | `mutation` | Edit product details |
| `delete` | `mutation` | Remove product |

### `receipts` / `deliveries` / `transfers` / `adjustments` Routers
| Procedure | Type | Description |
|---|---|---|
| `list` | `query` | List with filters (location, status) |
| `getById` | `query` | Detail with product lines |
| `create` | `mutation` | Create draft operation |
| `submit` | `mutation` | Submit for approval |
| `setReady` | `mutation` | Mark as ready |
| `validate` | `mutation` | Execute & update stock ledger |
| `cancel` | `mutation` | Cancel operation |

### `warehouses` Router
| Procedure | Type | Description |
|---|---|---|
| `list` | `query` | All warehouses |
| `create` | `mutation` | Add warehouse |
| `listLocations` | `query` | Locations in a warehouse |
| `createLocation` | `mutation` | Add storage location |

### `ledger` Router
| Procedure | Type | Description |
|---|---|---|
| `list` | `query` | Stock movement audit trail |

### `users` Router
| Procedure | Type | Description |
|---|---|---|
| `getProfile` | `query` | Current user profile |
| `updateProfile` | `mutation` | Edit profile info |

---

## 🎨 Design Philosophy

| Principle | Implementation |
|---|---|
| 🪟 **Glassmorphism** | `backdrop-blur` surfaces with subtle borders |
| ✨ **Micro-animations** | KPI counter animations, shimmer hovers, smooth transitions |
| 🎯 **Status-driven UI** | Green = healthy · Amber = warning · Red = critical |
| 📐 **Fluid Typography** | `clamp()` sizing from mobile to 4K |
| 🧱 **Design Tokens** | oklch-based CSS custom properties |
| 🌗 **Dual Themes** | `next-themes` with dark/light oklch palettes |
| 🖨️ **Print-First PDFs** | CSS print styles strip UI chrome automatically |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is built as part of **Odoo x Indus Hackathon**. All rights reserved.

---

<div align="center">

<img src="https://img.icons8.com/color/48/handshake.png" width="36" alt="team" />

### Built with ❤️ by **Jenil Soni** · **Harmit Kalal** · **Aarth Patel**

_For **Odoo x Indus Hackathon**_

[![GitHub](https://img.shields.io/badge/GitHub-Harmitx7/odoo-181717?style=flat-square&logo=github)](https://github.com/Harmitx7/odoo)

_CoreInventory — Where precision meets elegance in warehouse management._

<img src="https://img.icons8.com/fluency/96/warehouse.png" width="40" alt="logo" />

</div>
