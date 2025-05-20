# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Added `ensureProductPrice` utility function to ensure products always have a valid numeric `sellingPrice`
- Implemented contact form reply email functionality in admin dashboard
  - New API route for sending emails to contact form submitters
  - Support for default and custom email messages
  - Automatic status update for contact entries
- Created comprehensive privacy policy page with detailed sections
- Implemented responsive design for privacy policy
- Added interactive elements like email and website links

### Changed

- Updated contact form workflow to include email reply mechanism
- Updated price handling in cart and checkout to properly calculate prices from numeric values
- Improved price extraction from formatted price strings when numeric values are missing
- Created `ARCHITECTURE_BLUEPRINT.md` to document the project structure
- Created `CHANGELOG.md` to track changes to the project
- Updated `TODO.md` with comprehensive phased development plan
- Set up ESLint and Prettier with configuration files (.eslintrc.json and .prettierrc)
- Verified absolute imports (@/\*) are properly configured in tsconfig.json
- Installed Prisma and set up database schema with models for User, OTPToken, Product, Order, and OrderItem
- Implemented Resend email service for OTP authentication
- Added API routes for sending and verifying OTP
- Created authentication store using Zustand with localStorage persistence
- Built AuthModal component for email/OTP login flow
- Updated Navbar to replace account link with login button and dropdown
- Created orders page with authentication protection
- Added toast notifications for user feedback
- Implemented route middleware for protecting admin and authenticated routes
- Added unauthorized page for access denied scenarios
- Created admin dashboard with sample data visualization
- Added admin product management interface with filtering capabilities
- Implemented role-based redirection after OTP login
- Implemented secure HTTP-only cookies for authentication instead of localStorage
- Added session API endpoint for checking authentication status
- Enhanced security by removing user data from localStorage
- Integrated ImageKit for product image uploads and management
- Enhanced product database schema to support variants, colors, and sizes
- Created product management system with CRUD operations
- Implemented color picker with image upload functionality
- Added size management with stock tracking
- Created API endpoints for product management (GET, POST, PUT, DELETE)
- Built responsive forms for adding and editing products
- Added product listing with filtering by collection and search
- Enhanced product display to show real products from the database on the main page
- Added dedicated collection pages for men's and kids' products
- Implemented color selection functionality that changes product images
- Updated all product components to handle color variants with different images
- Created QuickViewModal component for quick product detail viewing
- Integrated QuickViewModal with FeaturedProducts, ProductsSlider, and ProductCollection components
- Implemented quick view functionality that shows product details in a popup when clicking "Select Options"
- Implemented wishlist functionality with Zustand state management
- Created wishlist page to display saved products
- Added wishlist icon to product cards for easy adding/removing
- Persisted wishlist to localStorage using Zustand middleware
- Added wishlist count badge to navbar to display number of saved items
- Created detailed product page with dynamic routing (/product/[id])
- Added product image gallery with color selection
- Implemented product details with size and color selection
- Added "People Also Bought" section with related products
- Created customer reviews section
- Added redirect from old product URL structure (/products/[id]) to new one (/product/[id])
- Implemented cart functionality with Zustand state management and localStorage persistence
- Created cart sidebar that slides in from the right when cart icon is clicked
- Added "Add to Cart" functionality to QuickViewModal with color and size selection
- Implemented cart item count badge in navbar to show number of items in cart
- Added ability to update quantities and remove items directly from the cart
- Implemented a free shipping progress bar to show how close user is to free shipping threshold
- Added empty cart state with call-to-action button to continue shopping
- Created checkout page with user information form and cart summary
- Implemented checkout process with order creation API endpoint
- Connected checkout flow with cart store for seamless experience
- Implemented order saving to database with user information
- Added automatic user creation for new customers during checkout
- Added order confirmation email with order details and login instructions
- Created admin order management interface with order listing and status updates
- Added order detail page for admins to view order information and perform actions
- Implemented order status update functionality for admin users
- Added order confirmation email resend functionality for admin users
- Updated admin dashboard to display real-time data instead of sample data
- Created API endpoints for fetching dashboard statistics and order data
- Added authentication checks to all admin API endpoints
- Updated Footer component to dynamically render social media links from database settings
- Improved social media link rendering with conditional display
- Added security attributes to social media links

### Fixed

- Fixed OTP email sending by replacing upsert with findFirst + update/create pattern
- Improved error handling in AuthModal component for better user feedback
- Fixed modal background opacity issues by separating backdrop and modal elements
- Resolved middleware authentication issues by using HTTP-only cookies
- Enhanced security by removing sensitive user data from client-side storage
- Fixed product display to correctly show images based on selected color
- Updated type definitions to properly handle both string and number IDs
- Fixed checkout process by removing OTP verification and simplifying the flow
- Resolved radio button warnings in checkout form by adding onChange handlers
- Fixed order creation by using a valid enum value ('PROCESSING' instead of 'CONFIRMED') for order status
- Fixed order confirmation email sending by updating the email configuration
- Improved email sending error handling
- Ensured proper authentication for email sending endpoint

### Improved

- Enhanced AuthModal with smooth animations and transitions
- Added click-outside-to-close functionality for the auth modal
- Prevented body scrolling when modal is open
- Improved visual appearance with subtle scaling and fade effects
- Optimized modal rendering with separate backdrop for better performance
- Upgraded authentication system to use secure HTTP-only cookies
- Improved user session management with server-side validation
- Reorganized admin routes with /admin/dashboard structure for better organization
- Enhanced product management UI with intuitive forms and dynamic controls
- Improved database schema with relationships between products, colors, and sizes
- Structured API endpoints for better organization and maintainability
- Enhanced product display components with dynamic color selection
- Improved user experience by showing product images that match selected colors
- Added loading states for product listing pages to improve perceived performance
- Optimized home page to fetch and display products from different collections
- Enhanced product browsing experience with quick view functionality for faster product exploration
- Improved user interaction by allowing color and size selection in the quick view modal
- Simplified checkout flow by removing multi-step process for better user experience
- Enhanced email notifications with detailed order information and login instructions
- Improved user session handling during checkout with secure cookies
- Enhanced contact form reply email route with comprehensive error handling
- Added detailed logging for email sending attempts
- Improved email sending validation and error reporting
- Ensured email is sent before updating contact status
- Added more granular error responses for email sending failures

## Project Structure

- Analyzed initial project structure with Next.js 15.3.1 and React 19
- Documented existing components in the components directory
- Documented current routing structure in the app directory
- Identified completed tasks in Phase 1 of development (Next.js setup, Tailwind CSS, file structure)
- Completed Phase 1: all setup and planning tasks are now done
- Completed Phase 3 tasks: displaying real products and implementing color switching functionality
- Completed Phase 5 tasks: checkout and OTP verification for orders
