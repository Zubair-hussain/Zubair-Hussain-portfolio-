# Src/App/API Folder - API Routes Documentation

This folder contains all **server-side API routes** using Next.js App Router for the **Zubair Hussain Portfolio**.

## 📁 Folder Structure

```bash
src/app/api/
├── chat/          # AI Chat / Assistant related endpoints
├── contact/       # Contact form submission endpoint
└── README.md
```

📋 Detailed Overview
contact/

Handles contact form submissions from the website
Processes user messages, validates input, and sends emails/notifications
Ready for integration with email services (Resend, Nodemailer, etc.)

chat/

API routes for the AI Chat feature
Powers the interactive chat assistant on your portfolio
Likely integrates with AI models (OpenAI, Grok, Claude, etc.)
Handles conversation history, streaming responses, or context management

🛠️ Tech Highlights

Built with Next.js 14+ App Router API Routes
Full-stack capability (Server Actions + API Routes)
Supports both POST, GET, and streaming responses
Secure and production-ready structure

✅ Best Practices

Clear separation of concerns (Contact vs AI Chat)
Ready for rate limiting, validation, and security middleware
Optimized for performance (Edge Runtime compatible if needed)
Easy to extend with new API endpoints

📌 How to Use / Extend
To add a new API route, create a folder with route.ts inside:
Example:
TypeScript// src/app/api/contact/route.ts
export async function POST(request: Request) { ... }

// src/app/api/chat/route.ts
export async function POST(request: Request) { ... }
Current available endpoints:

POST /api/contact → Submit contact form
POST /api/chat    → Send message to AI assistant


Part of: Zubair Hussain Portfolio (Full-Stack Next.js Project)
Made with ❤️ by Syed Zubair Hussain