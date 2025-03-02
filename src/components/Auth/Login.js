import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth/Login.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo(null);
    
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Tentativo di login con:', { email });
      
      // Utilizzo la funzione login dal contesto
      const data = await login(email, password);
      
      console.log('Login completato con successo:', data);
      
      // Salva informazioni di debug
      setDebugInfo({
        status: 200,
        data: { success: true, user: data.user }
      });
      
      // Login riuscito, reindirizzare all'account
      navigate('/account');
      
    } catch (err) {
      console.error('Errore di login completo:', err);
      setError(err.message || 'Credenziali non valide. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
      >
        <motion.h1 
          className="login-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Accedi
        </motion.h1>
        
        <motion.div 
          className="login-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <p>Bentornato su Wavy Studios</p>
        </motion.div>
        
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email"
              autoComplete="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="La tua password"
              autoComplete="current-password"
              required
            />
          </div>
          
          <div className="form-actions">
            <motion.button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(255, 77, 77, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </motion.button>
          </div>
          
          <div className="form-footer">
            <p>
              Non hai un account? <Link to="/register">Registrati</Link>
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

export default Login; 