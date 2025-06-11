// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles'; // <-- Importamos GlobalStyles
import bulkTheme from './theme'; 
import { BrowserRouter } from 'react-router-dom';

const globalStylesInput = (
  <GlobalStyles styles={{
  'html, body, #root': {
    margin: 0,
    padding: 0,
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'inherit',
  }
}} />

);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={bulkTheme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);