import React from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { InteractionProvider } from './components/InteractionStore';

const App: React.FC = () => {
  return (
    <InteractionProvider>
      <div className="relative w-full h-screen overflow-hidden bg-black">
        {/* 3D Scene Layer */}
        <Scene />
        
        {/* UI Layer */}
        <Overlay />
      </div>
    </InteractionProvider>
  );
};

export default App;
