# HeroTag Website Clone

This is a clone of the HeroTag website built with Next.js and Tailwind CSS.

## Features

- Responsive design that works on mobile, tablet, and desktop
- Interactive components like sliders and product cards
- Complete UI implementation matching the original HeroTag website
- Data pulled from a centralized data.json file

## Authentication System

This project implements a secure authentication system with the following features:

- Email-based OTP (One-Time Password) authentication
- Secure HTTP-only cookies for maintaining session state
- No sensitive data stored in localStorage or client-side storage
- Server-side session validation via middleware
- Role-based access control (admin vs regular user)
- Automatic redirection based on user roles

The authentication flow works as follows:

1. User enters their email and requests an OTP
2. System sends a 6-digit OTP to the user's email
3. User enters the OTP and the system verifies it
4. If valid, the system creates an HTTP-only cookie with the user's session data
5. The cookie is sent with every request and validated by middleware
6. Different routes are protected based on user roles

This approach is more secure than localStorage-based authentication as it prevents:
- XSS attacks from accessing the authentication token
- Client-side token exposure
- Token theft from browser storage

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - The main application code
  - `components/` - React components used throughout the application
  - `globals.css` - Global CSS styles
  - `layout.tsx` - Root layout component
  - `page.tsx` - Main page component
- `public/` - Static assets
  - `data.json` - Centralized data for the website
  - `images/` - Image assets

## Components

- `Navbar` - Navigation bar with mobile responsiveness
- `HeroSlider` - Hero section with image slider
- `Collections` - Collection categories display
- `BestSelling` - Best selling products slider
- `FeaturedProducts` - Featured products grid
- `KidsSection` - Kids products slider
- `Footer` - Website footer with information and newsletter signup

## Notes

This is a clone of the HeroTag website for educational purposes. In a production environment, you would want to:

1. Replace placeholder images with real images
2. Connect to a real backend API for product data
3. Implement actual functionality for search, cart, and user authentication

## Learn More

To learn more about Next.js and Tailwind CSS, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
