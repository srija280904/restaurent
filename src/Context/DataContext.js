// ================================
// Step 1: Create src/context/DataContext.js (NEW FILE)
// ================================
import React, { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext();

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [lastOrderUpdate, setLastOrderUpdate] = useState(Date.now());
  const [lastMenuUpdate, setLastMenuUpdate] = useState(Date.now());

  const triggerOrderUpdate = useCallback(() => {
    console.log('🔄 Triggering order data refresh...');
    setLastOrderUpdate(Date.now());
  }, []);

  const triggerMenuUpdate = useCallback(() => {
    console.log('🔄 Triggering menu data refresh...');
    setLastMenuUpdate(Date.now());
  }, []);

  const triggerAllUpdates = useCallback(() => {
    console.log('🔄 Triggering all data refresh...');
    setLastOrderUpdate(Date.now());
    setLastMenuUpdate(Date.now());
  }, []);

  const value = {
    lastOrderUpdate,
    lastMenuUpdate,
    triggerOrderUpdate,
    triggerMenuUpdate,
    triggerAllUpdates
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};