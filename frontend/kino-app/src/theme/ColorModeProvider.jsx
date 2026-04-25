import React, { createContext, useMemo } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { buildCinemaTheme } from './cinemaTheme';

export const ColorModeContext = createContext({
  mode: 'dark',
  toggleMode: () => {},
});

export default function ColorModeProvider({ children }) {
  const mode = 'dark';
  const toggleMode = () => {};
  const theme = useMemo(() => buildCinemaTheme({ mode, primary: 'cinemaRed' }), []);
  const value = useMemo(() => ({ mode, toggleMode }), []);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

