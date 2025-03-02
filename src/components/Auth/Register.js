import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth/Register.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validateUsername = (username) => {
    // Solo lettere, numeri e underscore
    const re = /^[a-zA-Z0-9_]+$/;
    return re.test(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo(null);
    
    // Validazione client-side più robusta
    if (!formData.username || !formData.email || !formData.password) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    if (!validateUsername(formData.username)) {
      setError('Il nome utente può contenere solo lettere, numeri e underscore');
      return;
    }

    if (formData.username.length < 3) {
      setError('Il nome utente deve contenere almeno 3 caratteri');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Inserisci un indirizzo email valido');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (formData.password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Log per debug
      console.log('Tentativo di registrazione con:', { 
        username: formData.username, 
        email: formData.email
      });
      
      // Utilizzo la funzione register dal contesto
      const data = await register(formData.username, formData.email, formData.password);
      
      console.log('Registrazione completata con successo:', data);
      
      // Salva informazioni di debug
      setDebugInfo({
        status: 200,
        data: { success: true, user: data.user }
      });
      
      // Registrazione riuscita, reindirizzare all'account
      navigate('/account');
      
    } catch (err) {
      console.error('Errore di registrazione completo:', err);
      
      if (err.message && err.message.includes('Username o email già in uso')) {
        setError('Username o email già in uso. Prova con credenziali diverse.');
      } else {
        setError(err.message || 'Errore durante la registrazione. Riprova.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      <div className="register-background"></div>
      
      <motion.div 
        className="register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        // Rimuovi animazioni problematiche
        // whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
      >
        <motion.h1 
          className="register-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Registrati
        </motion.h1>
        
        <motion.div 
          className="register-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <p>Unisciti a Wavy Studios</p>
        </motion.div>
        
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        
        {debugInfo && (
          <div className="debug-info">
            <p>Debug (Status: {debugInfo.status}):</p>
            <pre>{JSON.stringify(debugInfo.data, null, 2)}</pre>
          </div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="form-group">
            <label htmlFor="username">Nome utente</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Il tuo nome utente"
              autoComplete="username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="La tua email"
              autoComplete="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Crea una password"
              autoComplete="new-password"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Conferma Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Conferma la password"
              autoComplete="new-password"
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </div>
          
          <div className="form-footer">
            <p>
              Hai già un account? <Link to="/login">Accedi</Link>
            </p>
            <Link to="/" className="back-home">
              Torna alla Home
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Register; 