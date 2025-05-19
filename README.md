Andaze Nu – E-Commerce Platform for Tracksuits & Shirts
Built with Next.js and Tailwind CSS

Andaze Nu is a modern, responsive e-commerce platform for selling tracksuits and shirts online. Inspired by HeroTag and rebuilt from the ground up using Next.js (App Router) and Tailwind CSS, this platform provides a smooth user experience, clean design, and secure user authentication.

🌟 Features
✅ Fully responsive design – optimized for mobile, tablet, and desktop

🛍️ Interactive product UI with sliders and product cards

🎨 Clean, minimal UI modeled on HeroTag with unique enhancements for Andaze Nu

🗃️ Centralized product data loaded from data.json (mock)

🛒 User-friendly layout for exploring, browsing, and purchasing apparel

🔐 Secure authentication using email-based OTP

🎯 Role-based admin and user control for managing content and products

🔐 Authentication System
Andaze Nu includes a secure, server-side session-based authentication flow using email OTPs:

Users enter their email address to request an OTP

A 6-digit OTP is emailed to them

Upon successful verification, a secure HTTP-only cookie is issued

Middleware verifies user sessions on each request

Role-based access (e.g. admin panel) is enforced with redirection logic

✅ Security Benefits
No data stored in localStorage (protection against XSS)

Session managed securely via HTTP-only cookies

Prevents token leakage or hijacking

🚀 Getting Started
Install dependencies:

bash
Copy
Edit
npm install
# or
yarn install
# or
pnpm install
Run the development server:

bash
Copy
Edit
npm run dev
# or
yarn dev
# or
pnpm dev
Open http://localhost:3000 to view the app.

📁 Project Structure
csharp
Copy
Edit
.
├── app/
│   ├── components/         # Reusable React components
│   ├── layout.tsx          # Global layout
│   └── page.tsx            # Main home page
├── public/
│   ├── data.json           # Sample product data
│   └── images/             # Static assets
├── styles/
│   └── globals.css         # Global Tailwind styles
🧩 Core Components
Navbar – Responsive navigation with mobile toggle

HeroSlider – Full-width hero banner with carousel

Collections – Categories for quick navigation

BestSelling – Showcase of top-selling tracksuits/shirts

FeaturedProducts – Highlighted product grid

KidsSection – Products for kids (optional section)

Footer – Store info, policies, and newsletter signup

📌 To-Do for Production
This is a prototype/educational build. For production deployment, consider:

Connecting to a real backend (e.g., Node.js, Supabase, Firebase)

Integrating real product management + checkout flow

Adding cart, wishlist, and search functionalities

Replacing mock data/images with actual content

Enabling admin panel for sellers to upload products

📚 Learn More
Next.js Documentation

Tailwind CSS Docs

Deploying on Vercel

📸 Screenshots
Coming Soon

📢 License & Attribution
This is an educational project inspired by HeroTag's layout. All assets used are for demonstration purposes only. For commercial deployment, ensure proper licensing for images and assets.