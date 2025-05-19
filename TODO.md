# Project TODO List

## Phased Development Plan – T-Shirt E-commerce (Next.js App)

### ✅ Phase 1: Project Setup & Planning
Goal: Lay the foundation of your app with the right tools and structure.

Tasks:
- [x] Initialize Next.js project with App Router
- [x] Set up Tailwind CSS for styling
- [x] Set up absolute imports (@/components, @/lib, etc.)
- [x] Create file structure as per technical plan
- [x] Configure ESLint + Prettier
- [x] Set up Prisma with database schema

### ✅ Phase 2: State Management (Cart & Wishlist with Zustand)
Goal: Enable users to add items to cart and wishlist without logging in.

Tasks:
- [x] Install Zustand + Zustand middleware
- [x] Create useCart.ts and useWishlist.ts in stores/
- [x] Persist cart/wishlist to localStorage
- [x] Build cart UI & wishlist UI
- [x] Display item count in nav bar

### 🛍️ Phase 3: Product Listing & Product Detail Page
Goal: Allow users to browse products and view details.

Tasks:
- [X] Design product card component
- [X] Create ProductList and ProductDetail components
- [X] Use dummy data or seed data for now
- [X] Display product info with sizes, price, image, etc.
- [X] Display real products from the database on the website
- [X] Implement color switching functionality to change product images
- [X] Implement quick view functionality to see product details without leaving the page
- [x] Product details page 
- [X] Add "Add to Cart" and "Add to Wishlist" buttons

### 📷 Phase 4: Admin Dashboard + Product Management
Goal: Allow admin to add/update/delete products.

Tasks:
- [x] Create /admin route with role-based middleware
- [x] Build product management UI (form to add/edit products)
- [x] Integrate ImageKit upload for product images
- [x] Connect with DB using Prisma
- [x] Orders page (admin)
- [x] Users page (admin)
- [ ] Analytics page (admin)
- [ ] Settings Page (admin)
- [ ] shows real data and charts and analytics in dashboard page (admin)

### 🛒 Phase 5: Checkout + OTP Login System
Goal: Enable checkout and send OTP to email for login/order confirmation.

Tasks:
- [x] Create Checkout page (/checkout)
- [x] User enters: Name, Email, Address, Phone, Cart items
- [x] On submit:
- [x] Save order to DB
- [x] If new user: create user
- [x] Generate OTP & send via Resend
- [x] Show "Enter OTP" screen
- [x] Validate OTP and mark order as placed

### 📬 Phase 6: Email Setup (Order Confirmation + OTP)
Goal: Send transactional emails via Resend or SendGrid.

Tasks:
- [x] Setup API key and client Resend
- [x] Design HTML email templates (OTP + Order Confirmation)
- [x] Send:
- [x] OTP for login
- [x] Order confirmation
- [x] Order summary after checkout

### 📖 Phase 7: Order History (User Dashboard)
Goal: Show past orders to users after they log in via OTP.

Tasks:
- [x] Create /orders page (protected)
- [x] need improvement in orders page
- [x] On login via OTP, fetch user orders from DB
- [x] Display summary: Order date, status, total, items

### 🔐 Phase 8: Admin Order Management
Goal: Allow admin to view & update orders (e.g., mark as "shipped").

Tasks:
- [x] Show list of all orders (sorted by date/status)
- [x] Show order details
- [x] create order page 
- [x] Add order status update (pending, processing, shipped, delivered)

### 🚀 Phase 9: Deployment & Env Setup
Goal: Get your app live and ready for users.

Tasks:
- [ ] Deploy app to Vercel
- [ ] Use Railway/Neon/Supabase for DB
- [ ] Set environment variables:
  - [ ] DATABASE_URL
  - [x] IMAGEKIT keys
  - [x] RESEND or SENDGRID key
- [ ] Enable domain & custom email (if needed)

### ✨ Optional Final Touches
- [ ] Responsive design polish
- [x] Add loading spinners / skeletons
- [x] Add toast notifications (success/error)
- [ ] Analytics (Plausible or Google)
- [ ] Add pagination / filters

## Architecture Documentation
- [x] Analyze and document project structure
- [x] Create ARCHITECTURE_BLUEPRINT.md
- [x] Create CHANGELOG.md
- [x] Create TODO.md
- [x] Keep ARCHITECTURE_BLUEPRINT.md updated with any new files or changes
- [x] Update the CHANGELOG.md with all new changes

## Notes

- Remember to update ARCHITECTURE_BLUEPRINT.md whenever new files or components are added
- Always check for naming conventions when creating new components or files
- Delete any temporary files created for testing purposes 