import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  saveAuthToken, 
  removeAuthToken, 
  getAuthToken, 
  extendTokenValidity,
  hasValidToken 
} from '../utils/cookieUtils';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// API URL di base
const API_BASE_URL = 'http://localhost:3002/api/auth';

// Configurazione autenticazione
const AUTH_CONFIG = {
  // Durata del token in giorni
  TOKEN_EXPIRY_DAYS: 7,
  // Intervallo di controllo token in millisecondi (ogni 15 minuti)
  TOKEN_CHECK_INTERVAL: 15 * 60 * 1000,
  // Rinnova token quando mancano questi giorni alla scadenza
  TOKEN_REFRESH_THRESHOLD_DAYS: 1
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Verifica token e rinnova la sessione se necessario
  const verifyTokenAndRefresh = async (token) => {
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Aggiorna user data se diverso
        if (JSON.stringify(userData) !== JSON.stringify(currentUser)) {
          setCurrentUser(userData);
        }
        
        // Estendi validità token se necessario (rinnovo proattivo)
        extendTokenValidity(AUTH_CONFIG.TOKEN_EXPIRY_DAYS);
        
        setAuthError(null);
        return true;
      } else {
        console.warn('Token non valido o scaduto');
        removeAuthToken();
        setCurrentUser(null);
        setAuthError('La sessione è scaduta. Effettua nuovamente il login.');
        return false;
      }
    } catch (error) {
      console.error('Errore verifica token:', error);
      return false;
    }
  };

  // Verifica utente al caricamento
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        // Recupera il token utilizzando la funzione centralizzata
        const token = getAuthToken();
        
        if (token) {
          await verifyTokenAndRefresh(token);
        }
      } catch (error) {
        console.error('Errore verifica auth:', error);
        removeAuthToken();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Imposta un intervallo per controllare periodicamente la validità del token
    const tokenCheckInterval = setInterval(() => {
      const token = getAuthToken();
      if (token) {
        verifyTokenAndRefresh(token);
      }
    }, AUTH_CONFIG.TOKEN_CHECK_INTERVAL);
    
    // Pulizia al dismount del componente
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      console.log('AuthContext login chiamato con:', { email });
      setAuthError(null);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Login fallito:', data);
        setAuthError(data.message || 'Credenziali non valide');
        throw new Error(data.message || 'Credenziali non valide');
      }
      
      // Salva token usando la funzione centralizzata con la durata configurata
      saveAuthToken(data.token, AUTH_CONFIG.TOKEN_EXPIRY_DAYS);
      setCurrentUser(data.user || { email });
      return data;
    } catch (error) {
      console.error('Errore completo login:', error);
      throw error;
    }
  };

  // Registrazione
  const register = async (username, email, password) => {
    try {
      // Validazione lato client prima dell'invio
      if (!username || username.length < 3) {
        throw new Error('Il nome utente deve contenere almeno 3 caratteri');
      }
      
      if (!email || !email.includes('@')) {
        throw new Error('Email non valida');
      }
      
      if (!password || password.length < 6) {
        throw new Error('La password deve contenere almeno 6 caratteri');
      }
      
      console.log('AuthContext register chiamato con:', { username, email });
      setAuthError(null);
      
      // Dati da inviare al server
      const userData = { username, email, password };
      console.log('Dati di registrazione inviati:', userData);
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      // Stampa intestazioni e stato della risposta
      console.log('Risposta status:', response.status);
      
      const data = await response.json();
      console.log('Risposta dati:', data);
      
      if (!response.ok) {
        const errorMessage = data.message || `Registrazione fallita (${response.status})`;
        console.error('Registrazione fallita:', errorMessage);
        setAuthError(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Salva token usando la funzione centralizzata
      saveAuthToken(data.token, AUTH_CONFIG.TOKEN_EXPIRY_DAYS);
      setCurrentUser(data.user || { username, email });
      return data;
    } catch (error) {
      console.error('Errore completo registrazione:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Chiamata al server per invalidare il token (opzionale)
      const token = getAuthToken();
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }).catch(err => console.warn('Errore durante il logout lato server:', err));
      }
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      // Rimuovi sempre il token lato client, anche se la chiamata server fallisce
      removeAuthToken();
      setCurrentUser(null);
    }
  };

  // Aggiornamento profilo utente
  const updateUserProfile = async (userData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        setAuthError('Token di autenticazione non trovato');
        throw new Error('Token di autenticazione non trovato');
      }
      
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAuthError(errorData.message || 'Errore durante l\'aggiornamento del profilo');
        throw new Error(errorData.message || 'Errore durante l\'aggiornamento del profilo');
      }

      const data = await response.json();
      
      // Aggiorna i dati utente nel contesto
      setCurrentUser(prevUser => ({
        ...prevUser,
        ...userData
      }));

      // Estendi validità del token dopo aggiornamento profilo
      extendTokenValidity(AUTH_CONFIG.TOKEN_EXPIRY_DAYS);

      return data;
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del profilo:', error);
      throw error;
    }
  };

  // Verifica se l'utente è autenticato senza attendere
  const isAuthenticated = () => {
    return hasValidToken() && !!currentUser;
  };

  // Rinnova manualmente la sessione (utile per allungare la durata dopo un'azione importante)
  const refreshSession = async () => {
    const token = getAuthToken();
    if (token) {
      return await verifyTokenAndRefresh(token);
    }
    return false;
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    updateUserProfile,
    loading,
    isAuthenticated,
    refreshSession,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 