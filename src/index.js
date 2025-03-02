import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ReactGA from 'react-ga4';
import App from './App';
import './styles/index.scss';

// Imposto la gestione degli errori per framer-motion
window.onerror = function(message, source, line, column, error) {
  // Ignora gli errori di Framer Motion che contengono "ResizeObserver"
  if (message.includes("ResizeObserver") || (error && error.message && error.message.includes("ResizeObserver"))) {
    console.log('Ignorato errore di ResizeObserver:', message);
    return true; // Impedisce la propagazione dell'errore
  }
  return false; // Lascia che gli altri errori vengano gestiti normalmente
};

// Inizializza Google Analytics solo in produzione
if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize('G-XXXXXXXXXX');
  console.log('Google Analytics inizializzato in modalità produzione');
} else {
  // Mock di ReactGA per sviluppo
  console.log('Google Analytics non inizializzato (ambiente di sviluppo)');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 