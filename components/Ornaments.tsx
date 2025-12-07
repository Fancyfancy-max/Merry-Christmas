import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrnamentProps, GiftProps } from '../types';
import { useInteraction } from './InteractionStore';

// Constants for tree shape
const TREE_HEIGHT = 12;
const TREE_RADIUS = 4.5;

interface InstanceData {
  tree: { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 };
  scatter: { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 };
}

// Hook to manage instances logic to share between Ornaments and Gifts
const useScatterInstances = (count: number, isGifts: boolean) => {
  const { isScattered } = useInteraction();
  
  const data = useMemo(() => {
    const instances: InstanceData[] = [];
    
    for (let i = 0; i < count; i++) {
      // --- TREE POSITIONS ---
      const treePos = new THREE.Vector3();
      const treeRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const treeScale = new THREE.Vector3();

      if (isGifts) {
         // Gifts logic: Base of tree
         const r = 3 + Math.random() * 5; 
         const theta = Math.random() * Math.PI * 2;
         treePos.set(
            r * Math.cos(theta),
            - (TREE_HEIGHT / 2) - 0.5 + (Math.random() * 0.5),
            r * Math.sin(theta)
         );
         const s = 0.5 + Math.random() * 1.0; // Gift base size
         treeScale.set(s, s * (0.5+Math.random()), s); // Varies
         treeRot.set(0, Math.random() * Math.PI, 0);
      } else {
         // Ornaments logic: On tree surface
         const h = Math.random() * (TREE_HEIGHT - 1);
         const relH = h / TREE_HEIGHT;
         const r = (TREE_RADIUS * (1 - relH)) * (0.8 + Math.random() * 0.2);
         const theta = Math.random() * Math.PI * 2;
         treePos.set(
            r * Math.cos(theta),
            h - (TREE_HEIGHT / 2),
            r * Math.sin(theta)
         );
         const s = Math.random() * 0.3 + 0.15;
         treeScale.set(s, s, s);
      }

      // --- SCATTER POSITIONS ---
      // Random sphere distribution
      const sr = 15 * Math.cbrt(Math.random()) + 5;
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      
      const scatterPos = new THREE.Vector3(
        sr * Math.sin(sPhi) * Math.cos(sTheta),
        sr * Math.sin(sPhi) * Math.sin(sTheta),
        sr * Math.cos(sPhi)
      );
      
      const scatterRot = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const scatterScale = treeScale.clone(); // Keep scale same or maybe slightly vary?

      instances.push({
        tree: { pos: treePos, rot: treeRot, scale: treeScale },
        scatter: { pos: scatterPos, rot: scatterRot, scale: scatterScale }
      });
    }
    return instances;
  }, [count, isGifts]);

  return { data, isScattered };
};

export const Ornaments: React.FC<OrnamentProps> = ({ count = 100 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { data, isScattered } = useScatterInstances(count, false);
  const morphRef = useRef(0);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const colorArray = useMemo(() => [
    new THREE.Color('#FFD700'), 
    new THREE.Color('#C5A000'), 
    new THREE.Color('#c0c0c0'), 
    new THREE.Color('#b71c1c'),
  ], []);

  // Initial Color Setup
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
        meshRef.current.setColorAt(i, colorArray[Math.floor(Math.random() * colorArray.length)]);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [count, colorArray]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Lerp Morph Factor
    const target = isScattered ? 1 : 0;
    morphRef.current = THREE.MathUtils.lerp(morphRef.current, target, delta * 2);
    const t = morphRef.current;

    // Skip update if static (optimization)
    if (Math.abs(t - target) < 0.001 && (t === 0 || t === 1)) {
        // Optional: Can add a 'floating' animation here even when static using state.clock
    }

    // Update positions
    for (let i = 0; i < count; i++) {
        const { tree, scatter } = data[i];
        
        // Position Lerp
        dummy.position.lerpVectors(tree.pos, scatter.pos, t);
        
        // Rotation Lerp (approximate via lerping Euler components effectively enough for this chaos)
        // For smoother rot, we'd use Quaternions, but Euler is fine for random floating items
        dummy.rotation.set(
            THREE.MathUtils.lerp(tree.rot.x, scatter.rot.x + state.clock.elapsedTime * 0.1, t),
            THREE.MathUtils.lerp(tree.rot.y, scatter.rot.y + state.clock.elapsedTime * 0.1, t),
            THREE.MathUtils.lerp(tree.rot.z, scatter.rot.z, t)
        );

        dummy.scale.lerpVectors(tree.scale, scatter.scale, t);

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial 
        roughness={0.1} 
        metalness={0.9} 
        clearcoat={1} 
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
};

export const Gifts: React.FC<GiftProps> = ({ count = 30 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { data, isScattered } = useScatterInstances(count, true);
  const morphRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const colors = useMemo(() => [
    '#FFD700', '#004d40', '#880e4f', '#EEEEEE'
  ].map(c => new THREE.Color(c)), []);

  useEffect(() => {
    if(!meshRef.current) return;
    for(let i=0; i<count; i++) {
        meshRef.current.setColorAt(i, colors[Math.floor(Math.random() * colors.length)]);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [count, colors]);

  useFrame((state, delta) => {
     if (!meshRef.current) return;
     const target = isScattered ? 1 : 0;
     morphRef.current = THREE.MathUtils.lerp(morphRef.current, target, delta * 2);
     const t = morphRef.current;

     for (let i = 0; i < count; i++) {
         const { tree, scatter } = data[i];
         
         dummy.position.lerpVectors(tree.pos, scatter.pos, t);
         
         // Gifts rotate slowly when floating
         const floatRot = isScattered ? state.clock.elapsedTime * 0.2 : 0;
         
         dummy.rotation.set(
            THREE.MathUtils.lerp(tree.rot.x, scatter.rot.x + floatRot, t),
            THREE.MathUtils.lerp(tree.rot.y, scatter.rot.y + floatRot, t),
            THREE.MathUtils.lerp(tree.rot.z, scatter.rot.z + floatRot, t)
         );
         
         dummy.scale.lerpVectors(tree.scale, scatter.scale, t);
         dummy.updateMatrix();
         meshRef.current.setMatrixAt(i, dummy.matrix);
     }
     meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.3} metalness={0.6} />
    </instancedMesh>
  );
};
