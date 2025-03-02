import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  // Mostra un indicatore di caricamento mentre verifichiamo l'autenticazione
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Caricamento in corso...</p>
      </div>
    );
  }
  
  // Reindirizza alla pagina di login se non autenticato
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Renderizza i componenti figli se l'utente è autenticato
  return children;
};

export default ProtectedRoute; 