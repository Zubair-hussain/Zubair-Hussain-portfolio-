# Src/App Folder - Application Routing & Core Pages

This folder is the heart of the **Next.js App Router** in your **Zubair Hussain Portfolio** project.

## 📁 Folder Structure

```bash
src/app/
├── api/              # API routes (backend endpoints)
├── layout.tsx        # Root layout (global HTML structure, metadata, providers)
├── page.tsx          # Home page (main landing page)
├── robots.ts         # Robots.txt configuration for SEO
├── sitemap.ts        # Dynamic sitemap generation for SEO
└── README.md
```

📋 Detailed Overview
layout.tsx

Root layout file for the entire application
Wraps all pages with common elements (Navbar, Footer, Theme Provider, etc.)
Contains global metadata, fonts, and scripts
File size: ~4.4 KB

page.tsx

Main homepage of your portfolio
Renders the hero section, about, projects, skills, contact, etc.
File size: ~2.9 KB

api/

Contains all server-side API routes
Used for handling form submissions, contact emails, project data, or any backend logic
Full-stack capability (Next.js API Routes)

robots.ts

Generates robots.txt dynamically
Helps control search engine crawling behavior

sitemap.ts

Automatically generates sitemap.xml
Improves SEO by telling search engines about all important pages

🛠️ Key Features

Modern Next.js 14+ App Router structure
Full-stack ready (Frontend + Backend in one codebase)
SEO optimized (robots + sitemap)
Server Components by default for better performance
Clean separation between UI and API logic

✅ Best Practices

Root layout properly configured for global styling and providers
SEO best practices implemented
API routes organized for future backend features
Ready for production deployment (Vercel, Netlify, etc.)

📌 How to Use

Edit page.tsx → to update homepage content
Modify layout.tsx → to change global layout, navbar, footer, or metadata
Add new folders inside app/ → for additional pages (e.g., /projects, /contact)
Place new API endpoints inside api/ folder

Example:
TypeScript// Creating a new contact API route
src/app/api/contact/route.ts

Part of: Zubair Hussain Portfolio (Full-Stack Next.js Project)
Made with ❤️ by Syed Zubair Hussain