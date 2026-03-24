# Src/Components/UI - Reusable UI Components

This folder contains all small, reusable UI components used throughout the **Zubair Hussain Portfolio**.

## Folder Structure

```bash
src/components/ui/
├── AIChatbox.tsx
├── BackToTop.tsx
├── CookieConsent.tsx
├── CustomCursor.tsx
├── FloatingWhatsApp.tsx
├── Footer.tsx
├── HireMeModal.tsx
├── LenisProvider.tsx
├── Navigation.tsx
├── ScrollProgress.tsx
├── ThemeProvider.tsx
└── README.md
```
Component Details
```bash
Navigation.tsx        → Main navigation bar / header (largest file)
HireMeModal.tsx       → Modal for "Hire Me" contact form
AIChatbox.tsx         → AI-powered chatbox component
Footer.tsx            → Website footer with links and information
ThemeProvider.tsx     → Handles dark/light mode theme switching
LenisProvider.tsx     → Smooth scroll provider using Lenis
FloatingWhatsApp.tsx  → Floating WhatsApp contact button
BackToTop.tsx         → Back to top button
ScrollProgress.tsx    → Scroll progress indicator
CustomCursor.tsx      → Custom mouse cursor effect
CookieConsent.tsx     → Cookie consent banner
```

Key Highlights

All components are highly reusable and modular
Includes advanced features like AI chat, smooth scrolling, theme switching, and custom cursor
Fully responsive and animated
Easy to maintain and customize

How to Import
tsximport { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { AIChatbox } from '@/components/ui/AIChatbox';
import { HireMeModal } from '@/components/ui/HireMeModal';

Part of: Zubair Hussain Portfolio
Made with ❤️ by Syed Zubair Hussain