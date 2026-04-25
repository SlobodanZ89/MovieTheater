import { alpha, createTheme } from '@mui/material/styles';

export const CINEMA_COLORS = {
  bg: '#07090C',
  surface: '#12151B',
  surface2: '#161B22',
  divider: '#243041',
  text: '#E6EAF2',
  mutedText: '#AAB4C0',
  cinemaRed: '#E50914',
  popcornGold: '#FFC247',
};

const LIGHT = {
  bg: '#f4f6f9',
  paper: '#ffffff',
  paper2: '#f8fafc',
  border: '#e2e8f0',
  text: 'rgba(15, 23, 42, 0.92)',
  mutedText: 'rgba(15, 23, 42, 0.62)',
};

export function buildCinemaTheme({ mode = 'dark', primary = 'cinemaRed' } = {}) {
  const primaryMain =
    primary === 'popcornGold' ? CINEMA_COLORS.popcornGold : CINEMA_COLORS.cinemaRed;

  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: { main: primaryMain, contrastText: '#fff' },
      secondary: { main: CINEMA_COLORS.popcornGold },
      background: isLight
        ? {
            default: LIGHT.bg,
            paper: LIGHT.paper,
          }
        : {
            default: CINEMA_COLORS.bg,
            paper: CINEMA_COLORS.surface,
          },
      divider: isLight ? LIGHT.border : CINEMA_COLORS.divider,
      text: isLight
        ? {
            primary: LIGHT.text,
            secondary: LIGHT.mutedText,
          }
        : {
            primary: CINEMA_COLORS.text,
            secondary: CINEMA_COLORS.mutedText,
          },
      error: { main: '#F04438' },
      success: { main: '#12B76A' },
      warning: { main: '#F79009' },
      info: { main: '#2E90FA' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
      ].join(','),
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? LIGHT.bg : CINEMA_COLORS.bg,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: isLight
            ? {
                backgroundImage: `linear-gradient(180deg, ${LIGHT.paper} 0%, ${alpha(LIGHT.paper2, 0.98)} 100%)`,
                borderBottom: `1px solid ${LIGHT.border}`,
                color: LIGHT.text,
              }
            : {
                backgroundImage: `linear-gradient(180deg, ${alpha(
                  CINEMA_COLORS.surface2,
                  0.95
                )} 0%, ${alpha(CINEMA_COLORS.surface, 0.92)} 100%)`,
                borderBottom: `1px solid ${alpha(CINEMA_COLORS.divider, 0.7)}`,
              },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: isLight
            ? {
                backgroundImage: 'none',
                backgroundColor: LIGHT.paper,
                border: `1px solid ${LIGHT.border}`,
              }
            : {
                backgroundImage: `linear-gradient(180deg, ${alpha(
                  CINEMA_COLORS.surface2,
                  0.9
                )} 0%, ${alpha(CINEMA_COLORS.surface, 0.85)} 100%)`,
                border: `1px solid ${alpha(CINEMA_COLORS.divider, 0.7)}`,
              },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
    },
  });
}
