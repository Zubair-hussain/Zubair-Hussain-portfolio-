# Src/Styles - Global Styling

This folder contains the main global stylesheet for the **Zubair Hussain Portfolio**.

## Folder Structure

```bash
src/styles/
├── globals.css
└── README.md
```
File Details

globals.css (14.2 KB)
The single main stylesheet that controls the entire website's appearance.

What This File Includes

Tailwind CSS directives (@tailwind base, components, utilities)
Premium dark cyber-gold theme using CSS custom properties
Typography system (Cormorant Garamond for headings, DM Sans for body)
Global base styles for HTML and body
Glassmorphism, glow effects, and gradient text
Custom button styles (.btn-primary, .btn-outline)
Smooth scrollbar, scroll progress bar, and custom cursor
Skill bar animations and marquee effects
Masonry grid layout
Floating WhatsApp button styles
Noise texture overlay
Accessibility features (focus-visible, reduced motion support)
RTL language support

Key Highlights

Modern premium dark theme with red/gold accents
Fully fluid & responsive design using clamp()
High-end visual effects (glass, glow, gradients)
Optimized for performance
Excellent accessibility and motion reduction support

Usage
The stylesheet is imported globally in src/app/layout.tsx:
tsximport '@/styles/globals.css';
Example Custom Classes
tsx<div className="glass glow section-padding">
  <h1 className="gradient-text">Zubair Hussain</h1>
  <button className="btn-primary">Hire Me</button>
</div>

Part of: Zubair Hussain Portfolio
Made with ❤️ by Syed Zubair Hussain