# Src/Components/3D Folder - 3D Components

This folder contains all **interactive 3D components** built with Three.js and React Three Fiber for the **Zubair Hussain Portfolio**.

## 📁 Folder Structure

```bash
src/components/3d/
├── AvatarSequence.tsx    # Animated 3D avatar / character sequence
├── Globe.tsx             # Interactive 3D globe component
├── Hero3D.tsx            # Main 3D scene for the Hero section
└── README.md
```

📋 Component Details
Hero3D.tsx

Primary 3D scene displayed in the hero/landing section
Most visually impressive 3D element on the portfolio
Likely includes lighting, camera animations, and interactive elements
File size: ~9 KB

AvatarSequence.tsx

Animated 3D avatar or character
Uses sequence-based animation (frame-by-frame or rigged animation)
Adds a personal and dynamic touch to the portfolio
File size: ~10.8 KB

Globe.tsx

Interactive 3D globe
Can show locations, connections, or rotating earth effect
Great for showcasing global reach or skills
File size: ~2.4 KB

🛠️ Technologies Used

React Three Fiber (R3F)
Three.js
@react-three/drei (helpers and controls)
TypeScript

✨ Features

Smooth animations and interactions
Optimized for performance (portfolio-friendly)
Fully responsive and mobile-compatible
Enhances modern, premium feel of the portfolio

✅ Best Practices

Each 3D component is self-contained
Clear naming convention
Separated from regular UI components for better organization
Easy to import and reuse across sections

📌 How to Import & Use
tsximport { Hero3D } from '@/components/3d/Hero3D';
import { AvatarSequence } from '@/components/3d/AvatarSequence';
import { Globe } from '@/components/3d/Globe';
Example usage in a section:
tsx<Hero3D />
<AvatarSequence />

Part of: Zubair Hussain Portfolio (Full-Stack Next.js Project)
Made with ❤️ by Syed Zubair Hussain