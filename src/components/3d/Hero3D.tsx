'use client';

import { Suspense, useRef, useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Float,
  ContactShadows,
  Environment,
  PerformanceMonitor,
  Preload,
  useGLTF,
  Sparkles,
  Stars,
  Text,
} from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

function AvatarModel({ spinning }: { spinning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/avatar.glb');
  const spinRef = useRef(0);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material = child.material.clone();
          child.material.envMapIntensity = 2.5;
          child.material.emissive = new THREE.Color('#00f9ff');
          child.material.emissiveIntensity = 0.6;
          child.material.metalness = 0.9;
          child.material.roughness = 0.1;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (spinning) {
      spinRef.current += delta * 6;
      groupRef.current.rotation.y = spinRef.current;
    } else {
      spinRef.current = groupRef.current.rotation.y;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clonedScene} scale={1.1} position={[0, -1.2, 0]} />
      {/* Holographic neon ring */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#ff00cc"
          emissive="#ff00cc"
          emissiveIntensity={1.2}
          metalness={1}
          roughness={0}
          wireframe
        />
      </mesh>
    </group>
  );
}

function FuturisticPlaceholder({ spinning }: { spinning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (spinning) spinRef.current += delta * 6;
    groupRef.current.rotation.y = spinRef.current;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.3, 0]} castShadow>
        <capsuleGeometry args={[0.45, 1.1, 6, 32]} />
        <meshPhysicalMaterial
          color="#112233"
          transmission={0.95}
          thickness={0.6}
          metalness={0.2}
          roughness={0}
          ior={1.6}
          emissive="#00f9ff"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh position={[0, 1.1, 0]} castShadow>
        <octahedronGeometry args={[0.45, 2]} />
        <meshStandardMaterial
          color="#0a0a0f"
          metalness={1}
          roughness={0.05}
          emissive="#ff00cc"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>

      <mesh position={[0, 0.35, 0.4]} castShadow>
        <boxGeometry args={[0.6, 0.18, 0.12]} />
        <meshStandardMaterial color="#00f9ff" emissive="#00f9ff" emissiveIntensity={1.5} metalness={1} />
      </mesh>
    </group>
  );
}

function NeonDynamicLights({ mousePos }: { mousePos: { x: number; y: number } }) {
  const rimRef = useRef<THREE.PointLight>(null);
  const neonRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (rimRef.current) {
      rimRef.current.position.x = mousePos.x * 5;
      rimRef.current.position.y = mousePos.y * 4 + 1.5;
    }
    if (neonRef.current) neonRef.current.intensity = 2 + Math.sin(Date.now() / 300) * 0.5;
  });

  return (
    <>
      <directionalLight position={[4, 6, 3]} intensity={2.5} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight ref={rimRef} position={[3, 2, -3]} intensity={4} color="#00f9ff" distance={12} />
      <pointLight ref={neonRef} position={[-4, 1, -2]} intensity={3} color="#ff00cc" distance={10} />
      <ambientLight intensity={0.08} color="#112233" />
    </>
  );
}

function NeuralParticles({ hovering }: { hovering: boolean }) {
  if (!hovering) return null;
  return (
    <>
      <Sparkles count={80} scale={6} size={1.4} speed={0.6} color="#00f9ff" opacity={0.7} noise={0.3} />
      <Sparkles count={40} scale={5.5} size={0.8} speed={1.2} color="#ff00cc" opacity={0.5} noise={0.6} />
    </>
  );
}

function Scene({
  mousePos,
  spinning,
  hovering,
  isMobile,
  hasGLB,
}: {
  mousePos: { x: number; y: number };
  spinning: boolean;
  hovering: boolean;
  isMobile: boolean;
  hasGLB: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <NeonDynamicLights mousePos={mousePos} />
      <Environment preset="night" background={false} />
      <fog attach="fog" args={['#0a0a0f', 2, 18]} />

      <Float speed={prefersReducedMotion ? 0 : 1.8} rotationIntensity={0.15} floatIntensity={0.6}>
        <Suspense fallback={<FuturisticPlaceholder spinning={spinning} />}>
          {hasGLB ? <AvatarModel spinning={spinning} /> : <FuturisticPlaceholder spinning={spinning} />}
        </Suspense>
      </Float>

      <NeuralParticles hovering={hovering} />

      <Text
        position={[0, 2.8, 0]}
        fontSize={0.45}
        color="#00f9ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff" // change to your futuristic font or remove for default
      >
        DETROON
      </Text>

      <ContactShadows position={[0, -1.9, 0]} opacity={0.9} scale={6} blur={2} far={4} color="#000000" />

      {isMobile ? (
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} enableRotate={false} />
      ) : (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={!spinning}
          dampingFactor={0.025}
          enableDamping
          rotateSpeed={0.35}
          minPolarAngle={Math.PI * 0.35}
          maxPolarAngle={Math.PI * 1.65}
          target={[0, 0.3, 0]}
        />
      )}

      <Stars radius={80} depth={40} count={120} factor={2} saturation={0} fade speed={0.5} />
      <Preload all />
    </>
  );
}

const Hero3D2026 = memo(function Hero3D2026() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spinning, setSpinning] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasGLB = true; // ← set to false if avatar.glb is not ready yet

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    });
  }, []);

  const onClick = useCallback(() => {
    if (isMobile) return;
    setSpinning(true);
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = setTimeout(() => setSpinning(false), 900);
  }, [isMobile]);

  return (
    <div
      className="w-full h-full relative overflow-hidden pt-16 sm:pt-20 lg:pt-28"  // ← Added top padding here
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
      role="img"
      aria-label="2026 Futuristic Interactive Avatar"
      style={{ cursor: isMobile ? 'default' : 'crosshair' }}
    >
      {/* Vignette + subtle scanline overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent_0px,transparent_2px,#ffffff03_2px,#ffffff03_4px)] pointer-events-none z-20" />

      <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 2])}>
        <Canvas
          dpr={dpr}
          frameloop="demand"
          gl={{
            preserveDrawingBuffer: false,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0.6, 4.5], fov: 38, near: 0.1, far: 100 }}
          style={{ background: 'transparent' }}
        >
          <Scene
            mousePos={mousePos}
            spinning={spinning}
            hovering={hovering}
            isMobile={isMobile}
            hasGLB={hasGLB}
          />
        </Canvas>
      </PerformanceMonitor>
    </div>
  );
});

export default Hero3D2026;

useGLTF.preload('/models/avatar.glb');