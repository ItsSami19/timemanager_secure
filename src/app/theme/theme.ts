// src/app/theme/theme.ts

import { createTheme } from '@mui/material/styles';

// Definiere hier deine Farben für Light und Dark Mode
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f9f9f9',
      paper: '#fff',
    },
    text: {
      primary: '#000',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
    },
  },
});
