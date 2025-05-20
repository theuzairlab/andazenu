# T-Shirt Project Architecture Blueprint

This document provides an overview of the project structure and serves as a registry for all files and endpoints. It will be updated as new components, pages, or endpoints are added.

## Project Overview

This is a Next.js project for a T-shirt e-commerce website using:

- Next.js 15.3.1
- React 19
- TailwindCSS 4
- TypeScript 5
- Prisma ORM with PostgreSQL
- Resend for Email Services
- Zustand for State Management
- ImageKit for Image Storage and Delivery

## Directory Structure

```
/
├── app/                      # Next.js app directory (App Router)
│   ├── admin/                # Admin dashboard routes
│   │   ├── dashboard/        # Admin dashboard home
│   │   │   └── page.tsx      # Dashboard home page
│   │   ├── products/         # Product management
│   │   │   ├── [id]/         # Edit product page
│   │   │   │   └── page.tsx  # Edit product component
│   │   │   ├── new/          # New product page
│   │   │   │   └── page.tsx  # Add product component
│   │   │   └── page.tsx      # Products listing page
│   │   ├── layout.tsx        # Admin layout with sidebar
│   │   └── page.tsx          # Admin route redirector
│   ├── (admin)/              # Admin route group (legacy)
│   ├── (routes)/             # Main website routes
│   │   ├── contact/          # Contact page
│   │   ├── custom-design/    # Custom design page
│   │   ├── checkout/         # Checkout page
│   │   │   ├── layout.tsx    # Checkout layout
│   │   │   └── page.tsx      # Checkout page component
│   │   ├── collection/       # Collection pages
│   │   │   ├── mens-collection/   # Men's collection
│   │   │   │   └── page.tsx       # Men's collection page
│   │   │   └── kids-collection/   # Kids collection
│   │   │       └── page.tsx       # Kids collection page
│   │   ├── unauthorized/     # Access denied page
│   │   │   └── page.tsx      # Unauthorized page component
│   │   ├── orders/           # Order history page
│   │   │   └── page.tsx      # Orders page component
│   │   ├── wishlist/         # Wishlist page
│   │   │   └── page.tsx      # Wishlist page component
│   │   ├── layout.tsx        # Layout for routes
│   │   └── page.tsx          # Home page
│   ├── api/                  # API routes
│   │   ├── imagekit/         # ImageKit API routes
│   │   │   ├── upload/       # Upload images
│   │   │   │   └── route.ts  # Upload handler
│   │   │   └── delete/       # Delete images
│   │   │       └── route.ts  # Delete handler
│   │   ├── products/         # Product management API
│   │   │   ├── [id]/         # Individual product operations
│   │   │   │   └── route.ts  # GET, PUT, DELETE handlers
│   │   │   └── route.ts      # Product list GET, POST handlers
│   │   ├── create-order/     # Create order API
│   │   │   └── route.ts      # Create order handler
│   │   ├── confirm-order/    # Confirm order API
│   │   │   └── route.ts      # Confirm order handler
│   │   ├── send-otp/         # Send OTP API
│   │   │   └── route.ts      # Send OTP handler
│   │   └── verify-otp/       # Verify OTP API
│   │       └── route.ts      # Verify OTP handler
│   ├── stores/               # Zustand stores
│   │   ├── useAuth.ts        # Authentication store
│   │   ├── useWishlist.ts    # Wishlist store
│   │   └── useCart.ts        # Cart store
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global CSS
│   └── favicon.ico           # Site favicon
├── components/               # Reusable components
│   ├── admin/                # Admin-specific components
│   │   ├── ColorPicker.tsx   # Color picker for product variants
│   │   ├── ProductForm.tsx   # Product add/edit form
│   │   └── SizeManager.tsx   # Size management for products
│   ├── Navbar.tsx            # Navigation bar
│   ├── Footer.tsx            # Footer component
│   ├── HeroSlider.tsx        # Hero section slider
│   ├── Collections.tsx       # Collections component
│   ├── ProductCollection.tsx # Product collection display with color selection
│   ├── FeaturedProducts.tsx  # Featured products section with color selection
│   ├── ProductsSlider.tsx    # Products slider with color selection
│   ├── ClientOnly.tsx        # Client-only component wrapper
│   ├── AuthModal.tsx         # Authentication modal
│   ├── QuickViewModal.tsx    # Quick view modal for product details
│   ├── WishlistIcon.tsx      # Wishlist heart icon component
│   ├── Cart.tsx              # Cart sidebar component
│   └── ToastProvider.tsx     # Toast notification provider
├── lib/                      # Utility functions and libraries
│   ├── prisma.ts             # Prisma client singleton
│   ├── email.ts              # Email sending utilities
│   └── imagekit.ts           # ImageKit integration utilities
├── middleware.ts             # Route protection middleware
├── prisma/                   # Prisma ORM
│   └── schema.prisma         # Database schema definition
├── public/                   # Static files
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
└── postcss.config.mjs        # PostCSS configuration
```

## Components

| Component         | Description                                            | File Path                        |
| ----------------- | ------------------------------------------------------ | -------------------------------- |
| Navbar            | Main navigation bar                                    | components/Navbar.tsx            |
| Footer            | Site footer                                            | components/Footer.tsx            |
| HeroSlider        | Hero section with image slider                         | components/HeroSlider.tsx        |
| Collections       | Displays collection categories                         | components/Collections.tsx       |
| ProductCollection | Displays products in a collection with color selection | components/ProductCollection.tsx |
| FeaturedProducts  | Featured products section with color selection         | components/FeaturedProducts.tsx  |
| ProductsSlider    | Products slider with color selection                   | components/ProductsSlider.tsx    |
| ClientOnly        | Wrapper for client-only components                     | components/ClientOnly.tsx        |
| AuthModal         | OTP authentication modal                               | components/AuthModal.tsx         |
| QuickViewModal    | Quick view modal for product details                   | components/QuickViewModal.tsx    |
| WishlistIcon      | Heart icon for adding/removing products from wishlist  | components/WishlistIcon.tsx      |
| Cart              | Cart sidebar component                                 | components/Cart.tsx              |
| ToastProvider     | Toast notification provider                            | components/ToastProvider.tsx     |
| ColorPicker       | Color picker with image upload                         | components/admin/ColorPicker.tsx |
| ProductForm       | Product add/edit form                                  | components/admin/ProductForm.tsx |
| SizeManager       | Size management for products                           | components/admin/SizeManager.tsx |

## Database Models

| Model        | Description                   | Fields                                                                                               |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| User         | User information              | id, email, name, isAdmin, createdAt                                                                  |
| OTPToken     | OTP tokens for authentication | id, email, token, expiresAt, createdAt                                                               |
| Product      | Product information           | id, name, description, regularPrice, sellingPrice, discount, collection, stock, createdAt, updatedAt |
| ProductColor | Color variants for products   | id, productId, color, imageUrl, createdAt, updatedAt                                                 |
| ProductSize  | Size variants for products    | id, productId, size, stock, createdAt, updatedAt                                                     |
| Order        | Order information             | id, userId, status, totalAmount, email, name, phone, address, createdAt                              |
| OrderItem    | Individual items in an order  | id, orderId, productId, quantity, size, color, price                                                 |

## Pages/Routes

| Route                       | Description                | File Path                                        | Access Level  |
| --------------------------- | -------------------------- | ------------------------------------------------ | ------------- |
| /                           | Home page                  | app/(routes)/page.tsx                            | Public        |
| /contact                    | Contact page               | app/(routes)/contact/\*                          | Public        |
| /custom-design              | Custom t-shirt design page | app/(routes)/custom-design/\*                    | Public        |
| /checkout                   | Checkout page              | app/(routes)/checkout/page.tsx                   | Public        |
| /collection/mens-collection | Men's collection page      | app/(routes)/collection/mens-collection/page.tsx | Public        |
| /collection/kids-collection | Kids collection page       | app/(routes)/collection/kids-collection/page.tsx | Public        |
| /orders                     | Order history page         | app/(routes)/orders/page.tsx                     | Authenticated |
| /wishlist                   | Wishlist page              | app/(routes)/wishlist/page.tsx                   | Public        |
| /unauthorized               | Access denied page         | app/(routes)/unauthorized/page.tsx               | Public        |
| /admin/dashboard            | Admin dashboard            | app/admin/dashboard/page.tsx                     | Admin Only    |
| /admin/products             | Product management         | app/admin/products/page.tsx                      | Admin Only    |
| /admin/products/new         | Add new product            | app/admin/products/new/page.tsx                  | Admin Only    |
| /admin/products/[id]        | Edit product               | app/admin/products/[id]/page.tsx                 | Admin Only    |

## API Endpoints

| Endpoint             | Method | Description                                   | File Path                        |
| -------------------- | ------ | --------------------------------------------- | -------------------------------- |
| /api/send-otp        | POST   | Send OTP via email                            | app/api/send-otp/route.ts        |
| /api/verify-otp      | POST   | Verify OTP code                               | app/api/verify-otp/route.ts      |
| /api/products        | GET    | Get all products (optional collection filter) | app/api/products/route.ts        |
| /api/products        | POST   | Create new product                            | app/api/products/route.ts        |
| /api/products/[id]   | GET    | Get product by ID                             | app/api/products/[id]/route.ts   |
| /api/products/[id]   | PUT    | Update product                                | app/api/products/[id]/route.ts   |
| /api/products/[id]   | DELETE | Delete product                                | app/api/products/[id]/route.ts   |
| /api/imagekit/upload | POST   | Upload image to ImageKit                      | app/api/imagekit/upload/route.ts |
| /api/imagekit/delete | DELETE | Delete image from ImageKit                    | app/api/imagekit/delete/route.ts |
| /api/create-order    | POST   | Create new order                              | app/api/create-order/route.ts    |
| /api/confirm-order   | POST   | Confirm order with OTP                        | app/api/confirm-order/route.ts   |

## Middleware

| File          | Description                                                |
| ------------- | ---------------------------------------------------------- |
| middleware.ts | Protects admin and authenticated routes based on user role |

## State Management

| Store       | Description                                             | File Path                 |
| ----------- | ------------------------------------------------------- | ------------------------- |
| useAuth     | Authentication state management                         | app/stores/useAuth.ts     |
| useWishlist | Wishlist state management with localStorage persistence | app/stores/useWishlist.ts |
| useCart     | Cart state management with localStorage persistence     | app/stores/useCart.ts     |

## Utility Libraries

| File        | Description                                                   |
| ----------- | ------------------------------------------------------------- | --------------- |
| prisma.ts   | Prisma client singleton for database operations               | lib/prisma.ts   |
| email.ts    | Email utilities for OTP and order confirmation emails         | lib/email.ts    |
| imagekit.ts | ImageKit integration for product image uploads and management | lib/imagekit.ts |

## Key Features

| Feature          | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| Product Display  | Display products from database with color options that change product images |
| Collection Pages | Dedicated pages for men's and kids' collections                              |
| Color Selection  | Interactive color selection that updates product images                      |
| Quick View       | Product quick view functionality to see details without page navigation      |
| Admin Dashboard  | Product management interface for adding/editing/deleting products            |
| Authentication   | Secure OTP-based authentication flow with protected routes                   |
| Image Management | ImageKit integration for product image uploads and delivery                  |
| Wishlist         | Add products to wishlist and manage wishlist items                           |
| Shopping Cart    | Add products with selected variants to cart and manage cart items            |
| Checkout Process | Complete ordering process with user details and OTP verification             |

---

_This document will be updated as new files, components, or endpoints are added to the project._
