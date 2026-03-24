'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export function Globe() {
  const globeRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Background star field for depth
  const stars = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 200; i++) {
      const pos = [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      ];
      temp.push(pos);
    }
    return temp;
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
          color="#c8141e"
          speed={0.5}
          distort={0.2}
          radius={1}
          emissive="#400"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Wireframe overlay for the "Tech" look */}
      <mesh>
        <sphereGeometry args={[2.51, 32, 32]} />
        <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshBasicMaterial 
          color="#c8141e" 
          transparent 
          opacity={0.05} 
          side={THREE.BackSide}
        />
      </mesh>

      {/* Floating particles (connecting dots) */}
      {stars.map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#fff" : "#ef4444"} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Ambient and Point Lights are usually in the Scene wrapper, 
          but adding a small point light here for self-contained glow */}
      <pointLight position={[5, 5, 5]} intensity={50} color="#ff3333" />
      <ambientLight intensity={0.2} />
    </group>
  );
}
