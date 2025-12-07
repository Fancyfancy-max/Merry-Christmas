import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InteractionContextType {
  isScattered: boolean;
  toggleScatter: () => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export const InteractionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isScattered, setIsScattered] = useState(false);

  const toggleScatter = () => {
    setIsScattered((prev) => !prev);
  };

  return (
    <InteractionContext.Provider value={{ isScattered, toggleScatter }}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
};
