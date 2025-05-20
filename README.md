# 🧢 Andaze Nu – E-Commerce for Tracksuits & Shirts

[![Next.js](https://img.shields.io/badge/Built%20With-Next.js-blue)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20With-Tailwind%20CSS-38bdf8)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live%20Site-andazenu.com-brightgreen)](https://andazenu.com)

**Andaze Nu** is a stylish, responsive e-commerce platform built with **Next.js (App Router)** and **Tailwind CSS**, designed for selling **tracksuits and shirts**. Inspired by HeroTag, it combines clean design, modern tech, and secure authentication.

---

## ✨ Features

- 🌐 **Fully Responsive Design** – Works on mobile, tablet, and desktop
- 🛒 **Interactive UI** – Product sliders, carousels, and dynamic content
- 🎨 **Clean UX/UI** – Built with Tailwind and modeled after HeroTag
- 📦 **Centralized Product Data** – Pulled from `data.json`
- 🔐 **OTP Email Authentication** – Secure, cookie-based session management
- 🔑 **Role-Based Access** – Admin vs. regular user routing and protections

---

## 🔐 Authentication Flow

Andaze Nu includes a secure OTP-based login system:

1. User enters their **email address**
2. A **6-digit OTP** is emailed to them
3. User submits OTP to verify identity
4. A secure **HTTP-only cookie** is created for the session
5. All protected routes validate sessions server-side
6. **Role-based redirection** for dashboard access

### ✅ Security Highlights

- No `localStorage` (protects from XSS)
- HTTP-only cookies prevent token theft
- Middleware-enforced session validation

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/andaze-nu.git
cd andaze-nu
2. Install dependencies
bash
Copy
Edit
npm install
# or
yarn install
# or
pnpm install
3. Run the development server
bash
Copy
Edit
npm run dev
Open http://localhost:3000 to see the site.

🗂️ Project Structure
graphql
Copy
Edit
andaze-nu/
├── app/
│   ├── components/         # Reusable components (Navbar, Footer, etc.)
│   ├── layout.tsx          # App-wide layout
│   └── page.tsx            # Homepage
├── public/
│   ├── data.json           # Mock product data
│   └── images/             # Static assets
├── styles/
│   └── globals.css         # Tailwind and custom styles
├── middleware.ts           # Session validation middleware
├── utils/                  # OTP and session helpers
└── README.md
🧩 Main Components
Navbar – Responsive top navigation with logo and links

HeroSlider – Homepage hero banner with slider

Collections – Category sections (e.g., tracksuits, shirts)

BestSelling – Slider for trending products

FeaturedProducts – Product grid with hover effects

Footer – Newsletter, links, and contact info

🔧 Production Checklist
 Replace placeholder images with real product media

 Connect to a backend (e.g., Supabase, Firebase, or Express API)

 Implement cart and checkout flow

 Add payment gateway (Stripe, Razorpay, etc.)

 Add seller dashboard to upload/manage inventory

 Enable search, filtering, and sorting

🚀 Deployment
Deploy easily on Vercel:

bash
Copy
Edit
vercel
Make sure to add environment variables in your dashboard if you’re using a backend or email service.

📚 Learn More
📘 Next.js Documentation

🎨 Tailwind CSS Docs

☁️ Vercel Deployment Guide

📸 Screenshots
### 🏠 Homepage

![Homepage](screenshots/hero.png)

### 🛍️ Product Page

![Product Page](screenshots/products.png)

⚠️ Disclaimer
This project is built for educational and demo purposes. All product data and images are placeholders. Please replace them with your own content before deploying publicly.

🧑‍💻 Author
Built by Uzair – @theuzairlab

📄 License
This project is open source and available under the MIT License.
```
