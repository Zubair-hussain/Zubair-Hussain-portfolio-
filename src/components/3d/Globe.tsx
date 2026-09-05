'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/components/ui/ThemeProvider';

export function Globe() {
  const { theme } = useTheme();
  const globeRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  // Three.js materials cannot resolve browser CSS custom properties. Keep the
  // palette theme-aware, but pass WebGL literal colors instead of var(...).
  const brandColor = theme === 'light' ? '#ae1d37' : '#c8141e';
  const emissiveColor = theme === 'light' ? '#4f0717' : '#440006';
  const starColor = theme === 'light' ? '#24243a' : '#ffffff';

  // Background star field for depth
  const stars = useMemo(() => {
    return Array.from({ length: 200 }, (_, index) => {
      // A deterministic golden-angle distribution avoids changing the scene
      // during renders while retaining the irregular deep-space look.
      const angle = index * 2.399963229728653;
      const normalizedY = 1 - (index / 199) * 2;
      const shellRadius = 9 + (index % 7) * 0.45;
      const horizontalRadius = Math.sqrt(1 - normalizedY * normalizedY) * shellRadius;

      return [
        Math.cos(angle) * horizontalRadius,
        normalizedY * 12,
        Math.sin(angle) * horizontalRadius,
      ] as [number, number, number];
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (globeRef.current) {
        globeRef.current.rotation.y = t * 0.1;
        globeRef.current.rotation.z = Math.sin(t * 0.05) * 0.1;
    }
  });

  return (
    <group ref={globeRef}>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
      
      {/* Main Stylized Globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <MeshDistortMaterial
          color={brandColor}
          speed={0.5}
          distort={0.2}
          radius={1}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Wireframe overlay for the "Tech" look */}
      <mesh>
        <sphereGeometry args={[2.51, 32, 32]} />
        <meshBasicMaterial color={brandColor} wireframe transparent opacity={0.15} />
      </mesh>

      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshBasicMaterial 
          color={brandColor}
          transparent 
          opacity={0.05} 
          side={THREE.BackSide}
        />
      </mesh>

      {/* Floating particles (connecting dots) */}
      {stars.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? starColor : brandColor} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Ambient and Point Lights are usually in the Scene wrapper, 
          but adding a small point light here for self-contained glow */}
      <pointLight position={[5, 5, 5]} intensity={50} color={brandColor} />
      <ambientLight intensity={0.2} />
    </group>
  );
}
