import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
// import Shop from './pages/Shop'; // Lo commento perché non è usato
import Studio from './pages/Studio';
import Contact from './pages/Contact';
import ServiceDetail from './pages/ServiceDetail';
import PurchaseDetail from './pages/PurchaseDetail';
import Services from './pages/Services';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import CustomBeatPayment from './components/CustomBeatPayment';
import ErrorPage from './pages/ErrorPage';
import ErrorBoundary from './components/ErrorBoundary';
import Account from './components/Account/Account';
import './styles/App.scss';
import ReactGA from 'react-ga4';
import { getAuthToken } from './utils/cookieUtils';
import { useAuth } from './contexts/AuthContext';

// Crea un tema personalizzato
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#303f9f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Verifica se esiste un token valido all'avvio dell'applicazione
    const token = getAuthToken();
    
    // Log per debug
    console.log('Token trovato all\'avvio:', token ? 'Sì' : 'No');
    console.log('Utente autenticato:', currentUser ? 'Sì' : 'No');
    
    // Invia evento GA per visualizzazione pagina solo in produzione
    if (process.env.NODE_ENV === 'production') {
      ReactGA.send({ hitType: "pageview", page: location.pathname });
    }
  }, [location, currentUser]);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <ScrollToTop />
        {location.pathname !== '/login' && location.pathname !== '/register' && <Navbar />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servizi" element={<Services />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/contatti" element={<Contact />} />
            <Route path="/servizi/:id" element={<ServiceDetail />} />
            <Route path="/acquisto/:id" element={<PurchaseDetail />} />
            <Route path="/beat-custom" element={<CustomBeatPayment />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<ErrorPage statusCode={404} />} />
          </Routes>
        </main>
        {location.pathname !== '/login' && location.pathname !== '/register' && <Footer />}
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App; 