import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import '../../styles/Account/Purchases.scss';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const data = await purchaseService.getUserPurchases();
        setPurchases(data);
      } catch (error) {
        console.error('Errore nel caricamento degli acquisti:', error);
        setError('Impossibile caricare i tuoi acquisti. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // Formatta la data in formato leggibile italiano
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Restituisce una classe CSS in base allo stato del pagamento
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'refunded':
        return 'status-refunded';
      default:
        return '';
    }
  };

  // Traduce lo stato in italiano
  const translateStatus = (status) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'pending':
        return 'In attesa';
      case 'failed':
        return 'Fallito';
      case 'refunded':
        return 'Rimborsato';
      default:
        return status;
    }
  };

  return (
    <div className="purchases-container">
      <h2>I Tuoi Acquisti</h2>

      {loading ? (
        <div className="loading-spinner">Caricamento acquisti...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : purchases.length === 0 ? (
        <div className="no-purchases">
          <p>Non hai ancora effettuato acquisti.</p>
          <Link to="/servizi" className="browse-services-btn">
            Scopri i nostri servizi
          </Link>
        </div>
      ) : (
        <motion.div 
          className="purchases-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {purchases.map((purchase, index) => (
            <motion.div 
              key={purchase._id} 
              className="purchase-item"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="purchase-header">
                <h3>{purchase.serviceName}</h3>
                <span className={`purchase-status ${getStatusClass(purchase.status)}`}>
                  {translateStatus(purchase.status)}
                </span>
              </div>
              
              <div className="purchase-details">
                <div className="detail-item">
                  <span className="detail-label">Data:</span>
                  <span className="detail-value">{formatDate(purchase.transactionDate)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Importo:</span>
                  <span className="detail-value">€{purchase.price.toFixed(2)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value purchase-id">{purchase._id}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Purchases; 