<h1 align="center">Syed Zubair Hussain — Professional Portfolio 🚀</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer" alt="Framer Motion" />
</p>

<p align="center">
  A highly interactive personal portfolio built with **Next.js 16 (App Router)** and **React 19**, featuring an optimized avatar sequence, scroll-linked animation, six interface languages, Blogger-powered articles, and technical SEO automation.
</p>

---

## 📸 Snapshot

<!-- To showcase your portfolio, add a screenshot of your hero section below: -->
<p align="center">
  <img src="public/images/og-image.jpg" alt="Portfolio Snapshot" width="800" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
</p>

> **View Live Demo:** [Cloudflare deployment](https://zubair-hussain-portfolio.detroonshah.workers.dev)

---

## ✨ Key Features

- **🎮 Immersive 3D Hero Section:** Built utilizing React Three Fiber (`@react-three/fiber`) and Drei to showcase a custom optimized GLB avatar with interactive hovering, orbiting, and rim-lighting effects.
- **⚡ Next.js 16 Server Components:** Optimized SSR and dynamic imports with automatic suspense boundaries.
- **🌍 Full i18n & RTL Support:** English, Urdu, Spanish, Hindi, Russian, and German interfaces, including Urdu RTL support.
- **🎭 Theme System:** Dark and light themes using Tailwind CSS with locally saved preferences and zero theme flash.
- **📱 100% Fully Responsive Layout:** Mobile-first approach using Framer Motion (`framer-motion`) and Lenis for buttery-smooth native scrolling experience.
- **📬 Integrated Contact System:** Ready-built integration for Resend / EmailJS to receive client communications directly.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router)
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
git clone https://github.com/Zubair-Hussain/Zubair-Hussain-portfolio-.git
cd Zubair-Hussain-portfolio-
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

## Blogger and SEO

- Blogger summaries are server-rendered on the homepage and `/blog`, giving every article a crawlable internal link.
- Full article bodies are loaded only on `/blog/[slug]`, sanitized, and published with canonical metadata and structured data.
- `sitemap.xml` refreshes every 30 minutes and automatically includes new Blogger posts.
- The official Blogger API is used when `BLOGGER_API_KEY` is configured; public Blogger feeds remain automatic fallbacks.

The Blogger blog ID is fixed in `src/lib/blog.ts`. Only the optional `BLOGGER_API_KEY` needs environment configuration, and it must remain server-side.

## Automated security and production audits

The `Security and Production Audit` workflow runs after successful deployments, after successful `main` or `_prod` builds, and every Thursday at 03:15 UTC. It performs dependency auditing, TypeScript validation, CodeQL analysis, production URL and sitemap checks, and Lighthouse audits for the homepage and blog.

Failures open or update a GitHub issue so repository watchers are notified. Lighthouse reports are retained as downloadable artifacts for 30 days. Configure the optional `PRODUCTION_URL` repository variable when moving from the Workers URL to a custom domain.

See **[Automated security and production audits](./docs/automated-security-audits.md)** for setup, scheduling, checks, and notification behavior.

---

## 🧑‍💻 Contributing & Commits

This repo follows **Conventional Commits**, enforced by CI and used to generate
version tags automatically. Before committing, see
**[CONTRIBUTING.md](./CONTRIBUTING.md)** for the format, allowed types, and examples.

Quick reference:

```
feat: add projects showcase
fix(chat): handle empty message
docs: update readme
chore: bump dependencies
```

CI on every PR: **Lint → Test → Build → Commit Test**. On a successful build on
`_prod`, a new release tag (`v0.1 → v0.2 → …`) is created automatically.

---

## 🤝 Let's Connect

Currently open to new opportunities! Reach out if you'd like to collaborate or just say hi!

- **LinkedIn:** [Syed Zubair Hussain](https://www.linkedin.com/in/syed-zubair-hussain-shah-491294376)
- **Twitter / X:** [@Zubair](https://x.com/ShahZuabir)
- **GitHub:** [Zubair's GitHub](https://github.com/Zubair-Hussain)
- **Email:** [thezubairh@gmail.com]

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---

<p align="center">
  <i>Developed with ❤️ by <a href="https://zubair-hussain-portfolio.detroonshah.workers.dev">Syed Zubair Hussain</a></i>
</p>
