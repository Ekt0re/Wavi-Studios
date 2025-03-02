import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Crea un'istanza axios con configurazione di base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 secondi di timeout
  withCredentials: true // Abilita l'invio di cookie con le richieste
});

// Intercettore di richiesta
api.interceptors.request.use(
  (config) => {
    // Aggiungi token di autenticazione se disponibile
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercettore di risposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestione centralizzata degli errori
    if (error.response) {
      // Se il token è scaduto o non valido (401)
      if (error.response.status === 401) {
        // Logout utente se non è alla pagina di login
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      
      // Se il server restituisce un messaggio di errore
      if (error.response.data && error.response.data.message) {
        return Promise.reject(new Error(error.response.data.message));
      }
    }
    
    // Gestisci errori 
    const errorResponse = {
      message: 'Si è verificato un errore durante la richiesta',
      status: error.response?.status || 500,
      details: null,
    };

    if (error.response) {
      // Il server ha risposto con un codice di errore
      errorResponse.message = error.response.data?.message || `Errore ${error.response.status}`;
      errorResponse.details = error.response.data?.details || null;
    } else if (error.request) {
      // La richiesta è stata effettuata ma non è stata ricevuta risposta
      errorResponse.message = 'Nessuna risposta dal server. Verifica la tua connessione.';
    } else {
      // Si è verificato un errore durante la configurazione della richiesta
      errorResponse.message = error.message;
    }

    // Mostra errore in console in sviluppo
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorResponse);
    }

    return Promise.reject(errorResponse);
  }
);

// Funzioni API wrapper
const apiService = {
  // Auth
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    logout: () => api.post('/api/auth/logout'),
    verify: () => api.get('/api/auth/verify'),
    getCurrentUser: () => api.get('/api/auth/me'),
  },
  
  // Servizi
  getServices: () => api.get('/api/services'),
  getServiceById: (id) => api.get(`/api/services/${id}`),
  
  // Pagamenti
  createCheckoutSession: (data) => api.post('/create-checkout-session', data),
  
  // File Upload
  uploadFiles: (formData, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options,
    };
    return api.post('/upload', formData, config);
  },
  
  // Health check
  healthCheck: () => api.get('/api/health-check'),
};

export default apiService; 