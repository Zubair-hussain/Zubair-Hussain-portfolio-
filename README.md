<h1 align="center">Syed Zubair Husain — Professional Portfolio 🚀</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer" alt="Framer Motion" />
</p>

<p align="center">
  A highly interactive, visually striking personal portfolio built with **Next.js 15 (App Router)** and **React 19**, featuring a custom 3D avatar hero section, scroll-linked animations, and a seamless bilingual (English/Urdu) experience. Designed for **Lighthouse 100/100** performance across all metrics on mobile and desktop.
</p>

---

## 📸 Snapshot

<!-- To showcase your portfolio, add a screenshot of your hero section below: -->
<p align="center">
  <img src="public/images/og-image.jpg" alt="Portfolio Snapshot" width="800" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
</p>

> **View Live Demo:** [zubairdeveloper.com](https://zubairdeveloper.com) *(Demo Link Placeholder)*

---

## ✨ Key Features

- **🎮 Immersive 3D Hero Section:** Built utilizing React Three Fiber (`@react-three/fiber`) and Drei to showcase a custom optimized GLB avatar with interactive hovering, orbiting, and rim-lighting effects.
- **⚡ Next.js 15 Server Components:** Optimized SSR, dynamic imports with automatic suspense boundaries, ensuring the lowest possible time-to-interactive (TTI) and Largest Contentful Paint (LCP).
- **🌍 Full i18n & RTL Support:** Seamless switching between English (LTR) and Urdu (RTL), implementing state-of-the-art Next.js `next-intl` caching.
- **🎭 Multi-Theme System:** Dark, Light, and Accent themes using Tailwind CSS and Next-Themes, saving user preference locally with zero layout shift.
- **📱 100% Fully Responsive Layout:** Mobile-first approach using Framer Motion (`framer-motion`) and Lenis for buttery-smooth native scrolling experience.
- **📬 Integrated Contact System:** Ready-built integration for Resend / EmailJS to receive client communications directly.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 15.0+ (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS + CSS Modules (`globals.css`)
- **Animations:** Framer Motion, Lenis Scroll
- **3D Graphics:** Three.js, React Three Fiber, GLTF/GLB Draco Compression
- **Internationalization:** `next-intl`
- **Linting & Formatting:** ESLint, Prettier

---

## 📂 Project Structure

A clean, modular architecture separating components into logical groupings.

```text
zubair-portfolio/
├── messages/                   # i18n Translation Files (en.json, ur.json)
├── public/
│   ├── images/                 # Optimized static images (AVIF/WebP)
│   ├── models/                 # Compressed 3D Models (`avatar.glb`)
│   └── icons/                  # PWA & Favicons
├── src/
│   ├── app/                    # Next.js App Router (Pages, Layouts, APIs)
│   │   └── api/contact/        # Backend API routes for form submissions
│   ├── components/
│   │   ├── 3d/                 # R3F Canvas and 3D Models (e.g., Hero3D.tsx)
│   │   ├── sections/           # Individual Page Sections (Hero, About, Projects)
│   │   └── ui/                 # Reusable UI Components (Nav, Footer, Theme toggle)
│   ├── hooks/                  # Custom React Hooks (e.g., useIntersection)
│   ├── i18n/                   # Next-intl configuration & routing
│   └── styles/                 # Global styles and Tailwind base setup
├── .env.local                  # Environment variables for APIs
└── tailwind.config.ts          # Tailwind Theme & Plugin Configuration
```

---

## 🚀 Getting Started Locally

Follow these steps to preview and modify the portfolio source code on your local machine.

### 1. Clone & Install Dependencies

Ensure you have **Node.js 20+** installed. Let's clone the repository and install the NPM packages.

```bash
git clone https://github.com/your-username/zubair-portfolio.git
cd zubair-portfolio
npm install
```

### 2. Environment Variables configuration

Copy the `.env.local.example` structure to setup your secret keys.

```bash
cp .env.local.example .env.local
```
*(Optionally setup EmailJS/Resend keys within the new `.env.local` to test the contact form)*

### 3. Run the Development Server

Execute the Next.js development server.

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the development build. The app will automatically hot-reload upon saving any changes.

---

## 📊 Performance (Lighthouse)

The application hits multiple performance ceilings through strategic build steps:
- **Image Optimization:** Utilizes `next/image` with lazy loading on all non-critical images.
- **Asset Minification:** 3D GLB Models are pipeline compressed into chunked Draco / WebP payloads.
- **Zero-FOUC Theming:** Synchronous local storage reading prevents any flashes during theme paints.

---

## 🤝 Let's Connect

Currently open to new opportunities! Reach out if you'd like to collaborate or just say hi!

- **LinkedIn:** [Syed Zubair Husain](www.linkedin.com/in/syed-zubair-hussain-shah-491294376)
- **Twitter / X:** [@Zubair](https://x.com/ShahZuabir)
- **GitHub:** [Zubair's GitHub](https://github.com/Zubair-hussain
- **Email:** [thezubairh@gmail.com]

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---

<p align="center">
  <i>Developed with ❤️ by <a href="https://zubairdeveloper.com">Syed Zubair Husain</a></i>
</p>
