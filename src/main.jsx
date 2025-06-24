// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
// El ThemeProvider y el tema ahora se manejan dentro de App.jsx,
// por lo que ya no los necesitamos aquí.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider ahora envuelve a App. 
        App, a su vez, contendrá el proveedor de tema y el resto de la lógica.
        Esta estructura asegura que los contextos estén disponibles en toda la aplicación.
      */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);