import React, { createContext, useContext, useState, useCallback } from 'react';

interface StatsContextType {
  refreshTrigger: number;
  refreshStats: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshStats = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <StatsContext.Provider value={{ refreshTrigger, refreshStats }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};
