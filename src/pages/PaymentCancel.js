import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Payment.scss';

const PaymentCancel = () => {
  return (
    <div className="payment-container">
      <motion.div 
        className="payment-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="payment-cancelled">
          <div className="cancel-icon">×</div>
          <h2>Pagamento annullato</h2>
          <p>Il tuo pagamento è stato annullato. Nessun addebito è stato effettuato.</p>
          
          <div className="action-buttons">
            <Link to="/servizi" className="button primary-button">
              Torna ai servizi
            </Link>
            <Link to="/" className="button secondary-button">
              Vai alla home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel; 