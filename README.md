# 📦 Product Admin Dashboard

A production-grade, responsive **Product Admin Dashboard** built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, powered by the [DummyJSON API](https://dummyjson.com/).

Designed with a sleek modern dark-mode aesthetic, dynamic micro-interactions, robust defensive programming, and client-side persistence overlays.

---

## 🚀 Live Demo & Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn**

### Installation
```bash
# 1. Clone repository
git clone https://github.com/parvezs2442/product_AdminDashboard.git
cd product_AdminDashboard

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will start locally at **`http://localhost:3000`** (or next available port).

### Demo Credentials
Use any valid DummyJSON user credentials or the pre-filled demo accounts:
- **Username:** `emilys`
- **Password:** `emilyspass`
*(Or click "Fill Demo Credentials" on the login screen for 1-click access)*

### Production Build
```bash
npm run build
npm run preview
```

---

## 📋 Assignment Requirements Checklist

| Stage | Feature / Requirement | Status |
| :--- | :--- | :---: |
| **Stage 1** | **Architecture & Authentication Flow**<br>• Centralized Axios client (`src/lib/axios.ts`) with Bearer token interceptors<br>• Authentication service & session persistence (`localStorage`)<br>• Protected Route Guard (`<ProtectedRoute>`) redirecting unauthenticated users<br>• Error handling for invalid login credentials | ✅ Completed |
| **Stage 2** | **Product Catalog & Custom Pagination**<br>• Desktop responsive table (`ProductTable`) and mobile cards view (`ProductCardGrid`)<br>• Handcrafted custom pagination (`Pagination`) with ellipsis (`1 ... 4 5 6 ... 20`)<br>• Dynamic items-per-page selector (`10`, `20`, `50`)<br>• Defensive URL query param parsing (`?page=1&limit=10`) preventing crashes | ✅ Completed |
| **Stage 3** | **Real-Time Search, Category Filter & Race-Condition Fix**<br>• 350ms debounced real-time search input<br>• Dynamic categories dropdown loaded from `/products/categories`<br>• Multi-field sorting (Title, Price, Rating, Stock) via dropdown & table column headers<br>• **Race-Condition Fix:** `AbortController` cancellation of in-flight requests<br>• **Hybrid Pipeline:** Solved DummyJSON limitation when combining Search + Category<br>• Bidirectional URL synchronization reproducing exact states on refresh | ✅ Completed |
| **Stage 4** | **Comprehensive Product Details Page (`/products/:id`)**<br>• Dynamic route `/products/:id` protected by route guard<br>• Interactive image gallery with thumbnail preview switcher and error fallbacks<br>• Comprehensive metadata grid (SKU, brand, weight, dimensions, warranty, shipping, return policy)<br>• Customer reviews breakdown (average rating score, star distributions, verified reviews)<br>• Handcrafted 404 "Product Not Found" screen for invalid IDs (`/products/999999` or `/products/invalid`)<br>• Breadcrumb navigation preserving previous URL filters | ✅ Completed |
| **Stage 5** | **CRUD Operations with Validation & State Overlay**<br>• Add & Edit modal with comprehensive field validation (Title, Category, Price, Stock, Description)<br>• Double-submission guard (disabling buttons and displaying spinners during mutation)<br>• Confirm Delete danger modal with product title warnings<br>• **Local State Overlay:** Simulated persistence in `localStorage` merging added, updated, and deleted products across queries and refreshes<br>• Non-blocking toast notification alerts (`ToastContext`) | ✅ Completed |

---

## 🧠 Technical Deep Dives & Explanatory Notes

### 1. Architectural Choices & Custom Pagination Rationale
- **Decoupled Service Layer:** All API interactions are isolated in `src/services/` (`authService.ts`, `productService.ts`, `productOverlay.ts`), keeping components clean, testable, and UI-agnostic.
- **Handcrafted Pagination over 3rd-Party Libraries:** Rather than using heavy UI libraries that obscure state, the `Pagination` component was handcrafted. This guarantees:
  1. Complete bidirectional synchronization with the URL (`?page=X&limit=Y`).
  2. Smart windowing ellipsis algorithm (`getPageNumbers`) that gracefully handles catalogs of any length without DOM overflow.
  3. Defensive input clamping preventing out-of-bounds or NaN page values.

### 2. Race Condition Handling Mechanism (`AbortController`)
- **Problem:** When typing quickly in search or switching filters rapidly, multiple asynchronous network requests are triggered in parallel. If an earlier request takes longer to resolve (e.g. tested with `&delay=2000`), it could resolve *after* a newer request, overwriting the UI with stale data.
- **Solution:** 
  1. An `AbortController` reference (`abortControllerRef.current`) is tracked in `ProductsPage.tsx`.
  2. On every new search stroke or filter change, the previous in-flight request is immediately aborted via `controller.abort()`.
  3. The Axios request passes `signal: controller.signal`.
  4. The error handler checks `axios.isCancel(err)` / `CanceledError` and silently ignores aborted requests without displaying spurious error banners.

### 3. Solution for Simultaneous Category + Search Limitation
- **Problem:** The DummyJSON API separates `/products/search?q=...` and `/products/category/:category`. Calling `/products/search` ignores category parameters, and calling `/products/category/:category` ignores query `q`.
- **Solution (Intelligent Hybrid Pipeline):**
  1. When **both** `category` and search `q` are present, `productService.getProducts` queries `/products/category/${category}?limit=0` to fetch all items belonging to that category.
  2. It then performs client-side multi-field fuzzy search across `title`, `description`, `brand`, and `tags`.
  3. Slices the results according to the active `skip` and `limit`, returning `{ products, total, isHybrid: true }`.
  4. The UI displays an informative badge: *“Hybrid Pipeline Active: filtering within [Category] for '[q]'”*, ensuring full transparency.

### 4. Approach for Simulated Add/Edit/Delete Persistence
- **Problem:** DummyJSON endpoints (`POST /products/add`, `PUT /products/:id`, `DELETE /products/:id`) only mock responses without persisting mutations to the database. Refreshing or paginating normally causes newly added, edited, or deleted items to disappear.
- **Solution (Local State Overlay Layer):**
  1. `productOverlay.ts` maintains three local storage keys:
     - `admin_overlay_added`: Newly created products (assigned unique timestamp IDs).
     - `admin_overlay_updated`: Field-level overrides mapped by product ID.
     - `admin_overlay_deleted`: List of deleted product IDs.
  2. Every catalog fetch (`getProducts`) and single product query (`getProductById`) automatically merges this overlay:
     - Filters out any deleted product IDs.
     - Merges edited fields over remote data.
     - Prepends locally added products to the catalog matching active filters.
  3. Accessing a deleted product ID directly navigates to the custom 404 screen.
  4. A **"Reset Demo Data"** button allows developers to revert to pristine DummyJSON data at any time.

### 5. Transparent AI Assistance Disclosure
- **Tooling Used:** Google Antigravity Advanced Agentic AI assistant (Claude 3.5 Sonnet / Gemini 3.8 Flash).
- **Scope of AI Usage:**
  - Initial scaffolding of TypeScript interfaces based on DummyJSON schemas.
  - Pair-programming implementation of responsive Tailwind UI components.
  - Designing the `AbortController` cancellation flow and state overlay pattern.
  - All generated code was actively reviewed, tested against edge cases (`?page=abc`, `/products/999999`), and verified through clean production builds (`tsc && vite build`).

---

## 📝 Submission Notes (Required by Assignment)

### 1. Architectural Choices
- **Decoupled Architecture:** Strict separation between UI presentation (`/components/products`), business/API logic (`/services`), state contexts (`/context`), and network client (`/lib/axios.ts`).
- **No External State/Table Libraries:** Handcrafted custom table, responsive cards, and pagination without third-party abstraction layers (e.g. TanStack Table, React Query), demonstrating pure React state mastery and deep DOM control.
- **Defensive State Clamping:** Every URL parameter (`page`, `limit`, `delay`, `id`) is defensively cast, validated, and clamped, guaranteeing that broken queries like `?page=abc` or `?page=999` never throw runtime errors.

### 2. One Problem Faced & How We Fixed It
- **The Challenge:** When testing search responsiveness with simulated latency (`&delay=2000`), typing rapidly (e.g. typing `p`, then `ph`, then `phone`) triggered three asynchronous requests. The earlier request (`p`) could finish *after* the latest request (`phone`), corrupting the product list with stale results.
- **The Fix:** We implemented a unified `AbortController` cancellation pattern. Every time a new keystroke or filter event fires, `abortControllerRef.current.abort()` executes synchronously before dispatching the new Axios request with `controller.signal`. Additionally, `axios.isCancel(err)` is intercepted and silently discarded in the catch block so no spurious error notifications flash in the UI.

### 3. Where AI Helped
- AI pair programming assisted in rapidly benchmarking DummyJSON API edge cases (discovering that category filtering ignores `q` search parameters), generating the TypeScript interfaces for product dimensions/reviews, and drafting the responsive mobile card layouts. Every implementation detail was audited, verified with production builds, and documented line-by-line.

---


## 📁 Project Structure

```
product_AdminDashboard/
├── public/                  # Static assets & SVG icons
├── src/
│   ├── assets/              # Branding & SVG icons
│   ├── components/
│   │   ├── Navbar.tsx       # Top navigation & user profile
│   │   ├── ProtectedRoute.tsx # Route authentication guard
│   │   ├── products/
│   │   │   ├── ConfirmDeleteModal.tsx  # Danger delete prompt
│   │   │   ├── Pagination.tsx          # Custom pagination with ellipsis
│   │   │   ├── ProductCardGrid.tsx     # Mobile/tablet card grid
│   │   │   ├── ProductDetailSkeleton.tsx # Detail page skeleton
│   │   │   ├── ProductFilters.tsx      # Debounced search & filter bar
│   │   │   ├── ProductFormModal.tsx    # Add / Edit validated modal
│   │   │   ├── ProductGallery.tsx      # Interactive image carousel
│   │   │   ├── ProductNotFound.tsx     # Handcrafted 404 component
│   │   │   ├── ProductReviews.tsx      # Customer reviews & rating breakdown
│   │   │   ├── ProductSkeleton.tsx     # Table loading skeleton
│   │   │   └── ProductTable.tsx        # Desktop sortable data table
│   │   └── ui/
│   │       ├── EmptyState.tsx          # No-data state with action CTA
│   │       └── ErrorState.tsx          # Network error & retry component
│   ├── context/
│   │   ├── AuthContext.tsx  # Authentication session state
│   │   └── ToastContext.tsx # Floating notification system
│   ├── lib/
│   │   └── axios.ts         # Shared Axios instance with interceptors
│   ├── pages/
│   │   ├── LoginPage.tsx         # Responsive login with demo autofill
│   │   ├── ProductDetailPage.tsx # Dynamic detail view (/products/:id)
│   │   └── ProductsPage.tsx      # Main dashboard catalog view
│   ├── services/
│   │   ├── authService.ts        # DummyJSON auth API client
│   │   ├── productOverlay.ts     # Local persistence overlay
│   │   └── productService.ts     # Product API & hybrid pipeline
│   ├── types/
│   │   ├── auth.ts          # Auth & user typings
│   │   └── product.ts       # Product, review, and query typings
│   ├── App.tsx              # Router & provider hierarchy
│   ├── index.css            # Tailwind & custom keyframe animations
│   └── main.tsx             # Application mount point
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Tech Stack

- **Core:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Routing:** [React Router DOM v6](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **API:** [DummyJSON](https://dummyjson.com/)
