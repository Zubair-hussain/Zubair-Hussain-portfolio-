# Src/Components Folder - Reusable Components

This folder contains all **React components** for the **Zubair Hussain Portfolio** project.

## 📁 Folder Structure

```bash
src/components/
├── 3d/              # 3D models and Three.js related components
├── sections/        # Main page sections (Hero, About, Projects, etc.)
├── ui/              # Reusable UI components (buttons, cards, modals, etc.)
├── sections.rar     # Archive of older section files (backup)
└── README.md
```

📋 Detailed Overview
ui/

Contains small, reusable UI building blocks
Examples: Button, Card, Badge, Modal, Navbar, Footer, ThemeToggle, etc.
Designed to be highly reusable across the project

sections/

Large, page-specific sections
Includes: Hero Section, About Section, Projects Showcase, Skills, Contact, Testimonials, etc.
Each file typically represents one major section of the homepage

3d/

Contains 3D components and scenes
Built with Three.js / React Three Fiber
Adds modern, interactive 3D visuals to the portfolio (e.g., 3D models, floating objects, interactive backgrounds)

sections.rar

Backup archive of older section components
Can be extracted if needed for reference or recovery

🛠️ Key Features

Clean separation between UI primitives and page sections
Modern 3D integration for a standout portfolio
Highly modular and reusable component architecture
Ready for easy maintenance and scaling

✅ Best Practices

Components are organized by purpose (ui, sections, 3d)
Reusable UI components promote consistency
3D components are isolated for better performance management
Archive file keeps the folder clean

📌 How to Use

Import UI components from @/components/ui/...
Import sections from @/components/sections/...
Use 3D components from @/components/3d/...

Example:
tsximport { HeroSection } from '@/components/sections/HeroSection';
import { Button } from '@/components/ui/Button';
import { Model3D } from '@/components/3d/Model3D';

Part of: Zubair Hussain Portfolio (Full-Stack Next.js Project)
Made with ❤️ by Syed Zubair Hussain