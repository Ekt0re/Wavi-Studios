import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Studio from './pages/Studio';
import Contact from './pages/Contact';
import ServiceDetail from './pages/ServiceDetail';
import PurchaseDetail from './pages/PurchaseDetail';
import Services from './pages/Services';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import CustomBeatPayment from './components/CustomBeatPayment';
import './styles/App.scss';
import { sendGAEvent, GA_EVENTS } from './utils/analytics';

// Crea un tema personalizzato
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff4081',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
  const location = useLocation();

  React.useEffect(() => {
    sendGAEvent(GA_EVENTS.PAGE_VIEW, {
      page_path: location.pathname,
      page_title: document.title
    });
  }, [location]);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ScrollToTop />
        <Navbar />
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
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 