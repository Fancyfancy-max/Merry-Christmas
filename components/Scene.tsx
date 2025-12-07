import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { TreeFoliage } from './TreeFoliage';
import { Ornaments, Gifts } from './Ornaments';
import { Ribbon } from './Ribbon';
import { TopStar } from './TopStar';

export const Scene: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-[#000500]">
      {/* Radial Gradient Background for cinematic depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0a2810_0%,_#000000_100%)] opacity-80 pointer-events-none" />

      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={[0, 2, 18]} fov={45} />
        
        {/* Cinematic Controls */}
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={10}
          maxDistance={30}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.5} 
          penumbra={1} 
          intensity={1.5} 
          color="#ffebc2" 
          castShadow 
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#004d40" />
        <pointLight position={[0, -5, 5]} intensity={0.5} color="#FFD700" />

        {/* Environment Reflections */}
        <Environment preset="city" />

        {/* Scene Objects */}
        <group position={[0, -2, 0]}>
            <TreeFoliage />
            <Ornaments count={250} />
            <Ribbon />
            <TopStar />
            <Gifts count={40} />
            
            {/* Ambient Sparkles around the tree */}
            <Sparkles 
              count={300} 
              scale={[12, 14, 12]} 
              size={2} 
              speed={0.2} 
              opacity={0.5}
              color="#FFD700"
            />
        </group>

        {/* Post Processing for the "Arix Signature" Look */}
        <EffectComposer disableNormalPass>
           <Bloom 
             luminanceThreshold={0.8} 
             mipmapBlur 
             intensity={1.5} 
             radius={0.6}
           />
           <Noise opacity={0.05} />
           <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* Fog to blend base into darkness */}
        <fog attach="fog" args={['#000500', 10, 40]} />
      </Canvas>
    </div>
  );
};
