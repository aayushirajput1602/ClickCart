# 🛒 ClickCart

ClickCart is a fully responsive, modern, and secure eCommerce web application built with **Next.js**, **Tailwind CSS**, **MongoDB**, and **Stripe**. It delivers a smooth shopping experience with features like dynamic product listings, cart and wishlist management, user authentication, and secure checkout.

---

## 📖 About

ClickCart allows users to explore a variety of product categories, manage their shopping cart and wishlist, and complete secure payments via Stripe. Whether on mobile or desktop, users enjoy a fast, intuitive interface built for seamless shopping.

---

## ✨ Features

- 🛍️ **Product Catalog** – Detailed product pages with categories, pricing, stock, and reviews  
- 🔎 **Search & Filters** – Find products instantly using keyword or category filters  
- ❤️ **Wishlist** – Save items to a personal wishlist for later  
- 🛒 **Shopping Cart** – Add, update, and remove items with quantity control  
- 🔐 **Authentication** – Secure JWT-based login and registration  
- 💳 **Stripe Checkout** – Secure and easy Stripe integration (test mode)  
- 🌙 **Dark Mode** – Toggle light/dark theme for enhanced UX  
- 📱 **Responsive UI** – Optimized across all screen sizes and devices

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React  
- **Styling:** Tailwind CSS  
- **Database:** MongoDB (via Mongoose)  
- **Auth:** JSON Web Tokens (JWT)  
- **Payments:** Stripe  
- **Deploy:** Vercel or Railway

---

## 📂 Project Structure

📦 ClickCart
├── components/ # UI Components
├── pages/ # Next.js Pages & Routes
├── public/ # Static Assets
├── styles/ # Tailwind CSS Config
├── utils/ # Helpers (cart/auth)
├── lib/ # DB & Stripe Setup
└── .env.local # Environment Variables

Getting Started
Installation
git clone https://github.com/your-username/ClickCart.git
cd ClickCart
npm install
npm run dev

Configure Environment Variables
Create a .env.local file in the root directory:

MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key
STRIPE_SECRET_KEY=your-secret-key

Deployment
Push your code to GitHub
Import the repository to Vercel
Add the environment variables
Deploy instantly with CI/CD

Contributing
Fork the repository
Create a new branch: git checkout -b feature/your-feature
Commit your changes: git commit -m "Add feature"
Push to GitHub: git push origin feature/your-feature
Open a Pull Request

