import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeProps } from '../types';
import { useInteraction } from './InteractionStore';

// Custom Shader Material for the Pine Needles
const foliageVertexShader = `
  uniform float uTime;
  uniform float uMorphFactor;
  
  attribute float size;
  attribute float randomness;
  attribute vec3 aScatterPosition;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;
    
    // Morph between tree position (position) and scatter position (aScatterPosition)
    vec3 targetPos = mix(position, aScatterPosition, uMorphFactor);

    // Wind effect: slight breathing/swaying based on height and randomness
    // We reduce wind when scattered to make it look like zero-g floating
    float windIntensity = 1.0 - uMorphFactor; 
    float wind = sin(uTime * 0.5 + targetPos.y * 0.5 + randomness * 5.0) * 0.05 * targetPos.y * windIntensity;
    
    // Add a slow floating rotation when scattered
    if (uMorphFactor > 0.01) {
       float floatAngle = uTime * 0.2 * randomness;
       float cx = cos(floatAngle);
       float sx = sin(floatAngle);
       // Simple rotation around Y for floating effect
       float px = targetPos.x * cx - targetPos.z * sx;
       float pz = targetPos.x * sx + targetPos.z * cx;
       targetPos.x = mix(targetPos.x, px, uMorphFactor);
       targetPos.z = mix(targetPos.z, pz, uMorphFactor);
    }

    targetPos.x += wind;
    targetPos.z += wind * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    
    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const foliageFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Soft circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);
    if (r > 0.5) discard;

    // Glow calculation from center
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    // Add a golden sparkly rim
    vec3 finalColor = vColor;
    if (r > 0.4) {
      finalColor = mix(finalColor, vec3(1.0, 0.9, 0.4), 0.5); // Gold rim
    }

    gl_FragColor = vec4(finalColor * 1.5, 1.0); // 1.5 intensity for bloom
  }
`;

export const TreeFoliage: React.FC<TreeProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const meshRef = useRef<THREE.Points>(null);
  const { isScattered } = useInteraction();
  
  // Animation state
  const morphRef = useRef(0);

  // Configuration
  const particleCount = 15000;
  const treeHeight = 12;
  const treeBaseRadius = 5;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorphFactor: { value: 0 },
  }), []);

  const { positions, colors, sizes, randomness, scatterPositions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const scatPos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const siz = new Float32Array(particleCount);
    const rand = new Float32Array(particleCount);

    const colorDeepGreen = new THREE.Color('#002200'); // Deep Emerald
    const colorTeal = new THREE.Color('#004d40'); // Teal/Blueish
    const colorGold = new THREE.Color('#FFD700'); // Gold

    for (let i = 0; i < particleCount; i++) {
      // --- TREE SHAPE ---
      // Cone generation logic
      const h = Math.random() * treeHeight; 
      const y = h - (treeHeight / 2); // Center Y
      
      const relativeHeight = h / treeHeight; // 0 (bottom) to 1 (top)
      const currentRadius = treeBaseRadius * (1.0 - relativeHeight);
      
      const r = Math.sqrt(Math.random()) * currentRadius; 
      const theta = Math.random() * Math.PI * 2;
      const branchOffset = Math.sin(relativeHeight * 20.0 + theta * 5.0) * 0.2;

      pos[i * 3] = r * Math.cos(theta) + branchOffset;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta) + branchOffset;

      // --- SCATTER SHAPE ---
      // Random distribution in a large sphere
      const sr = 15 * Math.cbrt(Math.random()) + 5; // Minimum radius 5, max 20
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      
      scatPos[i * 3] = sr * Math.sin(sPhi) * Math.cos(sTheta);
      scatPos[i * 3 + 1] = sr * Math.sin(sPhi) * Math.sin(sTheta);
      scatPos[i * 3 + 2] = sr * Math.cos(sPhi);

      // --- COLORS & SIZES ---
      const mixedColor = colorDeepGreen.clone().lerp(colorTeal, Math.random() * 0.3);
      
      if (Math.random() > 0.95) {
         colorGold.toArray(col, i * 3);
         siz[i] = Math.random() * 0.4 + 0.3; 
      } else {
         mixedColor.toArray(col, i * 3);
         siz[i] = Math.random() * 0.2 + 0.1;
      }

      rand[i] = Math.random();
    }

    return {
      positions: pos,
      scatterPositions: scatPos,
      colors: col,
      sizes: siz,
      randomness: rand
    };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smoothly interpolate morph factor
      const target = isScattered ? 1 : 0;
      morphRef.current = THREE.MathUtils.lerp(morphRef.current, target, delta * 2);

      // @ts-ignore
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      // @ts-ignore
      meshRef.current.material.uniforms.uMorphFactor.value = morphRef.current;
    }
  });

  return (
    <points ref={meshRef} position={position} scale={[scale, scale, scale]} castShadow>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatterPosition" count={particleCount} array={scatterPositions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={particleCount} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-randomness" count={particleCount} array={randomness} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        uniforms={uniforms}
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
      />
    </points>
  );
};
