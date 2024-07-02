// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0d47a1',
    },
    secondary: {
      main: '#1b5e20',
    },
  },
});

export default theme;
