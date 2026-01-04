
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill para process.env en el navegador para evitar ReferenceError
(window as any).process = {
  env: {
    API_KEY: '' // El valor real es inyectado por el entorno de ejecución
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
