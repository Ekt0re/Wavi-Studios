import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Cancel.scss';

const Cancel = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="cancel-page">
      <motion.div
        className="cancel-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="cancel-icon">✕</div>
        <h1>Si è verificato un errore</h1>
        <p className="cancel-message">
          Pagamento non completato. Se hai riscontrato problemi durante il pagamento, 
          puoi riprovare o contattarci per assistenza.
        </p>
        <div className="button-group">
          <motion.button
            className="retry-button"
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            RIPROVA
          </motion.button>
          <motion.button
            className="home-button"
            onClick={handleBackToHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            TORNA ALLA HOME
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Cancel; 