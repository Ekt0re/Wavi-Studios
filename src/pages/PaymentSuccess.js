import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { purchaseService } from '../services/purchaseService';
import '../styles/Payment.scss';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Reindirizza alla pagina di login se l'utente non è autenticato
    if (!isAuthenticated()) {
      navigate('/login?redirect=account');
      return;
    }

    // Ottieni il session_id dai parametri dell'URL
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');

    if (!sessionId) {
      setError('ID sessione mancante. Impossibile verificare il pagamento.');
      setLoading(false);
      return;
    }

    // Verifica lo stato del pagamento
    const verifyPayment = async () => {
      try {
        const statusResponse = await purchaseService.checkPaymentStatus(sessionId);
        
        // Recupera i dati dell'acquisto in corso dal localStorage
        const pendingPurchaseData = localStorage.getItem('pendingPurchase');
        const pendingPurchase = pendingPurchaseData ? JSON.parse(pendingPurchaseData) : null;
        
        // Imposta i dettagli del pagamento
        setPaymentDetails({
          status: statusResponse.status,
          sessionId: sessionId,
          serviceId: pendingPurchase?.serviceId || 'N/A',
          serviceName: purchaseService.getServiceDetails(pendingPurchase?.serviceId)?.name || 'Servizio'
        });

        // Pulisci i dati dell'acquisto in corso
        localStorage.removeItem('pendingPurchase');
      } catch (error) {
        console.error('Errore nella verifica del pagamento:', error);
        setError('Si è verificato un errore durante la verifica del pagamento.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search, navigate, isAuthenticated]);

  return (
    <div className="payment-container">
      <motion.div 
        className="payment-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Verificando il pagamento...</p>
          </div>
        ) : error ? (
          <div className="payment-error">
            <div className="error-icon"><span role="img" aria-label="Errore">❌</span></div>
            <h2>Errore durante la verifica</h2>
            <p>{error}</p>
            <div className="action-buttons">
              <Link to="/servizi" className="button primary-button">
                Torna ai servizi
              </Link>
              <Link to="/account" className="button secondary-button">
                Vai al tuo account
              </Link>
            </div>
          </div>
        ) : (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Pagamento completato con successo!</h2>
            <p>Grazie per il tuo acquisto di <strong>{paymentDetails?.serviceName}</strong>.</p>
            <div className="payment-details">
              <div className="detail-item">
                <span className="detail-label">Stato:</span>
                <span className="detail-value">Completato</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value payment-id">{paymentDetails?.sessionId}</span>
              </div>
            </div>
            <p className="confirmation-message">
              Riceverai presto una email di conferma con tutti i dettagli del tuo acquisto.
            </p>
            <div className="action-buttons">
              <Link to="/account/purchases" className="button primary-button">
                Visualizza i tuoi acquisti
              </Link>
              <Link to="/servizi" className="button secondary-button">
                Torna ai servizi
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess; 