'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { useState, useEffect, createContext, useContext, useMemo, ReactNode } from 'react';
import { lightTheme, darkTheme } from './theme';

interface ColorModeContextType {
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // ✅ Verwende useMemo, um das Objekt stabil zu halten
  const colorMode = useMemo(() => ({
    toggleColorMode: toggleMode,
  }), [toggleMode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = (): ColorModeContextType => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeContext.Provider');
  }
  return context;
};
