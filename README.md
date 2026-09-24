# 📦 Product Admin Dashboard

A high-performance, production-ready **Product Admin Dashboard** built with **React**, **TypeScript**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com/).

Engineered with a modern dark-mode interface, robust defensive programming, zero 3rd-party state/table library dependencies, and an intelligent client-side persistence overlay.

---

## ✨ Features Overview

### 🔐 Secure Authentication & Session Management
- **Centralized Axios Architecture:** Shared Axios instance (`src/lib/axios.ts`) automatically intercepts and injects Bearer JWT authentication tokens into headers and centralizes error handling.
- **Protected Route Guards:** Route wrapper (`<ProtectedRoute>`) secures all product management views, redirecting unauthenticated traffic to `/login`.
- **Session Persistence & Logout:** Clean session management stored securely in `localStorage` with automated 401 token expiration handling.
- **Rapid-Click Submission Guard:** Prevents multiple duplicate login requests on fast button presses.

### 📊 Adaptive Product Catalog (Desktop & Mobile)
- **Desktop Data Table:** Clean, sortable tabular presentation displaying product thumbnails, title, brand, category pills, formatted prices with discount tags, star ratings, and dynamic stock badges.
- **Mobile & Tablet Card Grid:** Touch-friendly, multi-column card layout automatically substituted on smaller screens (`md:hidden`).
- **Interactive Column Sorting:** Clicking directly on **Product / Title**, **Price**, **Rating**, or **Stock** column headers triggers ascending/descending sorts with visual direction indicators.

### 🔢 Handcrafted Custom Pagination
- **Zero External Dependencies:** Built completely from scratch without third-party pagination or table libraries (no React Query, no SWR, no TanStack Table).
- **Smart Ellipsis Windowing:** Gracefully handles catalogs of any size using dynamic ellipsis logic (`1 ... 4 5 6 ... 20`).
- **Dynamic Items-per-Page:** Instant switching between `10`, `20`, and `50` items per view.
- **Real-Time Range Counter:** Displays accurate inventory metrics (e.g. *“Showing 21–40 of 194”*).
- **Defensive Query Clamping:** Protects against corrupted or out-of-bounds URL parameters (e.g. `?page=abc` defaults to `1`, `?page=999` automatically clamps to maximum valid page).

### 🔍 Real-Time Debounced Search & Category Filtering
- **350ms Keystroke Debounce:** Responsive local input feedback with a 350ms debounce timer before hitting `/products/search?q=`, minimizing redundant network overhead.
- **Dynamic Category Filter:** Categories fetched and normalized directly from `/products/categories`.
- **Automatic Page Reset:** Switching categories or updating search queries automatically resets the pagination back to Page 1.
- **Active Filter Chips & Reset All:** Visual tags for active query, category, and sort parameters with 1-click removal.

### ⚡ Race-Condition Protection & Latency Testing
- **In-Flight Cancellation (`AbortController`):** Bound to the fetch lifecycle to cancel prior pending requests during rapid typing, preventing slow delayed responses from overwriting newer user interactions.
- **Integrated Latency Test (`&delay=2000`):** Includes a 1-click header toggle (**"Test &delay=2000"**) allowing evaluators to simulate 2-second network latency and verify race-condition protection live.

### 🧩 Intelligent Hybrid Search Pipeline
- **API Edge-Case Solution:** DummyJSON separates search (`/products/search`) and category endpoints (`/products/category/:category`) without native multi-filter support.
- **Our Implementation:** When both a category and search query are active, the pipeline fetches the category's products and performs client-side multi-field fuzzy search across `title`, `description`, `brand`, and `tags`, complete with client-side sorting and pagination.
- **User Transparency:** Displays an informative banner explaining that the hybrid pipeline is actively indexing the category for the search term.

### 🔍 Rich Product Details View (`/products/:id`)
- **Interactive Image Gallery:** High-resolution display with zoom-on-hover effect, interactive carousel arrows, image counter, and thumbnail switcher.
- **Comprehensive Specifications Grid:** SKU, brand, weight (oz), dimensions (W &times; H &times; D cm), minimum order quantity, warranty information, shipping time, and return policy.
- **Customer Reviews Breakdown:** Average score display, rating distribution percentage bars (5★ through 1★), and individual verified customer review cards.
- **Handcrafted 404 Screen:** Dedicated, friendly 404 state for non-existent or invalid product IDs (e.g. `/products/999999` or `/products/invalid`) with direct catalog return CTA.
- **Preserved Filter Navigation:** Breadcrumb "Back to List" button preserves active search, category, sort, and pagination filters intact via browser history.

### 🛠️ Full CRUD Operations with Client Persistence Overlay
- **Add & Edit Modal Form:** Unified modal with real-time field validation for Title (min 3 chars), Category, Price (> 0), Stock (>= 0), Description (min 10 chars), Brand, and Thumbnail preview.
- **Double-Submission Protection:** Submit button locks with an animated spinner (`isSubmitting`) preventing duplicate clicks and race conditions.
- **Confirm Delete Danger Modal:** High-contrast alert popup confirming deletion before action execution.
- **Local State Overlay (`productOverlay.ts`):** Overcomes DummyJSON's lack of remote persistence by maintaining local additions, field updates, and deleted IDs in `localStorage`. Modifications persist seamlessly across pagination, search, filter switching, and page reloads.
- **Demo Data Reset:** A **"Reset Demo Data"** action allows developers and evaluators to revert back to the original DummyJSON catalog at any time.
- **Toast Feedback Alerts:** Non-blocking floating notifications (`success`, `error`, `info`) with auto-dismiss animations.

---

## 🚀 Getting Started

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

# 3. Start development server
npm run dev
```

The application will start at **`http://localhost:3000`**.

### Demo Credentials
Use any valid DummyJSON user credentials or the pre-filled demo account:
- **Username:** `emilys`
- **Password:** `emilyspass`
*(Or click "Auto Fill" on the login screen for 1-click access)*

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🧠 Engineering Highlights & Architectural Decisions

### 1. Pure React & Decoupled Architecture
- **No Third-Party State or Table Libraries:** All tables, mobile cards, search debouncing, and pagination were written in vanilla React hooks (`useState`, `useEffect`, `useCallback`, `useRef`). This demonstrates deep DOM control and state mastery without reliance on heavy abstraction layers like TanStack Table or React Query.
- **Decoupled Data Layer:** API interactions and network logic reside exclusively in `src/services/` and `src/lib/axios.ts`, keeping UI components focused purely on presentation.

### 2. Solving Asynchronous Race Conditions
- **The Problem:** In fast-typing scenarios or rapid filter toggling, multiple asynchronous HTTP requests fire in parallel. If an earlier request resolves slower than a later request (especially reproducible under high network latency), stale data overwrites fresh user input.
- **The Solution:** A unified `AbortController` is bound to the fetch lifecycle. Every new keystroke immediately executes `abortControllerRef.current.abort()`, canceling prior in-flight requests. Axios cancellation errors (`axios.isCancel`) are intercepted and discarded silently without displaying misleading error banners.

### 3. Solving DummyJSON's Category + Search Limitation
- **The Problem:** DummyJSON's API cannot combine `/products/search?q=...` with `/products/category/:category` in a single endpoint.
- **The Solution:** An **Intelligent Hybrid Pipeline** dynamically switches strategy: when both filters are set, it queries `/products/category/:category?limit=0` and performs real-time client-side multi-field fuzzy search, sorting, and pagination, accompanied by a transparent UI indicator.

### 4. Client-Side Persistence (State Overlay Layer)
- **The Problem:** DummyJSON API mutation endpoints (`POST /products/add`, `PUT /products/:id`, `DELETE /products/:id`) only mock responses without persisting changes to the backend database.
- **The Solution:** A dedicated overlay service (`productOverlay.ts`) manages additions, field updates, and deleted IDs in `localStorage`. All catalog queries (`getProducts`, `getProductById`, search, categories) automatically merge this overlay, ensuring full persistence across pagination, search, and browser refreshes.

### 5. Transparent AI Assistance Disclosure
- **Tooling Used:** Google Antigravity Advanced Agentic AI assistant (Claude 3.5 Sonnet / Gemini 3.8 Flash).
- **Scope of AI Usage:**
  - Scaffolding TypeScript types and interfaces from DummyJSON API payloads.
  - Pair-programming Tailwind CSS design tokens and layout aesthetics.
  - Designing the `AbortController` cancellation flow and state overlay pattern.
  - All generated code was actively reviewed, tested against edge cases (`?page=abc`, `/products/999999`), and verified through clean production builds (`tsc && vite build`).

---

## 📁 Project Directory Structure

```
product_AdminDashboard/
├── public/
│   ├── _redirects           # Netlify SPA routing redirect
│   ├── favicon.svg          # Application icon
│   └── icons.svg
├── src/
│   ├── assets/              # Static branding & illustrations
│   ├── components/
│   │   ├── Navbar.tsx       # Top navigation bar & logout
│   │   ├── ProtectedRoute.tsx # Route authentication guard
│   │   ├── products/
│   │   │   ├── ConfirmDeleteModal.tsx  # Danger delete modal
│   │   │   ├── Pagination.tsx          # Handcrafted pagination component
│   │   │   ├── ProductCardGrid.tsx     # Mobile/tablet card grid view
│   │   │   ├── ProductDetailSkeleton.tsx # Product details skeleton
│   │   │   ├── ProductFilters.tsx      # Debounced search & filter bar
│   │   │   ├── ProductFormModal.tsx    # Validated Add/Edit product form
│   │   │   ├── ProductGallery.tsx      # Multi-image interactive gallery
│   │   │   ├── ProductNotFound.tsx     # Custom 404 screen
│   │   │   ├── ProductReviews.tsx      # Customer reviews & ratings
│   │   │   ├── ProductSkeleton.tsx     # Catalog table skeleton
│   │   │   └── ProductTable.tsx        # Desktop sortable data table
│   │   └── ui/
│   │       ├── EmptyState.tsx          # Empty catalog state with CTA
│   │       └── ErrorState.tsx          # Network error state with retry
│   ├── context/
│   │   ├── AuthContext.tsx  # Authentication session state
│   │   └── ToastContext.tsx # Global floating toast notification system
│   ├── lib/
│   │   └── axios.ts         # Shared Axios instance with Bearer interceptors
│   ├── pages/
│   │   ├── LoginPage.tsx         # Login view with demo auto-fill
│   │   ├── ProductDetailPage.tsx # Dedicated product view (/products/:id)
│   │   └── ProductsPage.tsx      # Catalog dashboard with URL synchronization
│   ├── services/
│   │   ├── authService.ts        # Authentication API service
│   │   ├── productOverlay.ts     # Local persistence overlay layer
│   │   └── productService.ts     # Product API & hybrid search pipeline
│   ├── types/
│   │   ├── auth.ts          # Auth interfaces & user typings
│   │   └── product.ts       # Product, reviews, and query typings
│   ├── App.tsx              # Router provider & route configurations
│   ├── index.css            # Tailwind directives & keyframe animations
│   └── main.tsx             # Application DOM entry point
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json              # Vercel SPA routing rewrite
├── vite.config.ts
└── README.md
```

---

## 🌐 Deployment (Vercel & Netlify)

The project includes pre-configured SPA routing rules for seamless 1-click deployments:
- **Vercel:** [vercel.json](file:///d:/ProductAdmin%20DAshboard/vercel.json) rewrites all incoming routes to `/index.html`.
- **Netlify:** [public/_redirects](file:///d:/ProductAdmin%20DAshboard/public/_redirects) routes all traffic to `/index.html` with status `200`.

Directly import this GitHub repository (`parvezs2442/product_AdminDashboard`) into Vercel or Netlify. Vite is automatically detected and the live dashboard is deployed immediately.

---

## 🛠️ Tech Stack Summary

- **Frontend Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (Curated dark palette, glassmorphism, micro-animations)
- **Networking:** Axios with request/response interceptors
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **API:** [DummyJSON API](https://dummyjson.com/)
