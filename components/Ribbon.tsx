import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useInteraction } from './InteractionStore';

export const Ribbon: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const { isScattered } = useInteraction();
  
  // Constants
  const turns = 4.5;
  const height = 12;
  const baseRadius = 5.2; 
  const pointsCount = 200;

  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const angle = t * turns * Math.PI * 2;
      const currentRadius = baseRadius * (1 - t);
      const y = (t * height) - (height / 2);
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * currentRadius,
        y,
        Math.sin(angle) * currentRadius
      ));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current && meshRef.current) {
      // Breathing effect
      const t = state.clock.getElapsedTime();
      const breathe = (Math.sin(t * 1.5) + 1) * 0.5; 
      materialRef.current.emissiveIntensity = 0.5 + breathe * 0.5;
      
      const colorA = new THREE.Color('#FFD700');
      const colorB = new THREE.Color('#C0C0C0');
      materialRef.current.color.lerpColors(colorA, colorB, (Math.sin(t) + 1) * 0.5);

      // --- Scatter Logic ---
      // We scale the ribbon up and fade it out
      const targetScale = isScattered ? 3 : 1;
      const targetOpacity = isScattered ? 0 : 0.8;
      
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, delta * 2);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
      <tubeGeometry args={[curve, 128, 0.15, 8, false]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={0.5}
        transmission={0.6} 
        opacity={0.8}
        metalness={1}
        roughness={0.2}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
