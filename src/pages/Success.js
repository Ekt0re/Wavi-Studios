import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { stripeService } from '../services/stripeService';
import '../styles/Success.scss';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('pending'); // 'pending', 'processing', 'completed', 'error'
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          throw new Error('ID sessione non trovato');
        }

        setUploadStatus('processing');
        const result = await stripeService.handlePaymentCompletion(sessionId);
        
        if (result.success) {
          setOrderDetails(result);
          setUploadStatus('completed');
          setLoading(false);
        } else {
          setUploadStatus('error');
          setError('Si è verificato un errore durante la verifica del pagamento');
          setLoading(false);
        }
      } catch (error) {
        console.error('Errore durante la verifica:', error);
        setUploadStatus('error');
        setError('Si è verificato un errore durante la verifica del pagamento');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location]);

  const getUploadStatusMessage = () => {
    switch (uploadStatus) {
      case 'processing':
        return 'Stiamo elaborando i tuoi file...';
      case 'completed':
        return 'I tuoi file sono stati elaborati con successo!';
      case 'error':
        return 'Si è verificato un problema con l\'elaborazione dei file. Ti contatteremo presto per risolvere il problema.';
      default:
        return 'Verifica del pagamento in corso...';
    }
  };

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="loading-spinner"></div>
          <h2>{getUploadStatusMessage()}</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page">
        <div className="success-container error">
          <div className="error-icon">✕</div>
          <h2>Errore</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>TORNA ALLA HOME</button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <motion.div 
        className="success-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="success-icon">✓</div>
        <h1>Pagamento completato con successo!</h1>
        
        <div className="order-info">
          <p><strong>Email:</strong> {orderDetails.customerEmail}</p>
          <p><strong>Nome:</strong> {orderDetails.orderData.nome}</p>
          <p><strong>Servizio:</strong> {orderDetails.orderData.serviceName}</p>
        </div>

        <p className={`status-message ${uploadStatus}`}>
          {getUploadStatusMessage()}
        </p>

        <motion.button
          className="back-button"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          TORNA ALLA HOME
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Success; 