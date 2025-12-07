import React from 'react';
import { useInteraction } from './InteractionStore';

export const Overlay: React.FC = () => {
  const { isScattered, toggleScatter } = useInteraction();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <div className="text-center md:text-left transition-opacity duration-1000 ease-in-out">
        <h1 className="font-serif text-3xl md:text-5xl text-[#E5C100] tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(229,193,0,0.5)]">
          Merry Christmas
        </h1>
        <h2 className="font-light text-white/80 text-sm md:text-lg tracking-[0.3em] mt-2 font-serif italic">
          Interactive Christmas Tree
        </h2>
      </div>

      {/* Footer / CTA */}
      <div className="text-center w-full pb-8 pointer-events-auto">
        <p className="font-serif text-[#E5C100]/80 text-xs tracking-widest mb-4">
          {isScattered ? "GATHER THE SPIRIT" : "SCATTER THE MAGIC"}
        </p>
        <button 
          onClick={toggleScatter}
          className="border border-[#E5C100] text-[#E5C100] px-8 py-3 
                     font-serif uppercase tracking-widest text-sm hover:bg-[#E5C100] hover:text-black 
                     transition-all duration-500 ease-out backdrop-blur-sm bg-black/20"
        >
          {isScattered ? "Assemble Tree" : "Release Elements"}
        </button>
      </div>
    </div>
  );
};
