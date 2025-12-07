import * as THREE from 'three';

export interface TreeProps {
  position?: [number, number, number];
  scale?: number;
}

export interface OrnamentProps {
  count: number;
}

export interface GiftProps {
  count: number;
}

// Shader uniforms types
export interface FoliageUniforms {
  uTime: { value: number };
  uColorPrimary: { value: THREE.Color };
  uColorSecondary: { value: THREE.Color };
  uColorTip: { value: THREE.Color };
}