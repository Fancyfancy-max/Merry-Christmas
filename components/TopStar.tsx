import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useInteraction } from './InteractionStore';

export const TopStar: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { isScattered } = useInteraction();
  
  // Random position for star when scattered
  const [scatterPos] = useState(() => {
      const r = 15;
      // High up and random angle
      return new THREE.Vector3(
          (Math.random() - 0.5) * r,
          10 + Math.random() * 5,
          (Math.random() - 0.5) * r
      );
  });
  const treePos = new THREE.Vector3(0, 6.2, 0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation & Pulse
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      
      // Position Interpolation
      const targetPos = isScattered ? scatterPos : treePos;
      groupRef.current.position.lerp(targetPos, delta * 2);
      
      // Scale down slightly when scattered to look further away? Or keep size
      const targetBaseScale = isScattered ? 0.5 : 1;
      const currentScale = targetBaseScale * pulse;
      
      // Smooth scale transition
      groupRef.current.scale.lerp(new THREE.Vector3(currentScale, currentScale, currentScale), delta * 2);
    }
  });

  return (
    <group ref={groupRef} position={[0, 6.2, 0]}>
      {/* Core Star */}
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
          color="#FFF" 
          emissive="#FFD700" 
          emissiveIntensity={4} 
          toneMapped={false} 
        />
      </mesh>
      
      {/* Outer Glow Halo structure */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshPhysicalMaterial 
          color="#FFD700" 
          transmission={0.9} 
          roughness={0} 
          thickness={1}
        />
      </mesh>

      {/* Local Sparkles */}
      <Sparkles count={20} scale={2} size={4} speed={0.4} opacity={1} color="#FFF" />
    </group>
  );
};
