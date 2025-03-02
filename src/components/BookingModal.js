import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/BookingModal.scss';

const BookingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    serviceType: 'recording',
    message: ''
  });
  
  // Assicura che il componente sia montato quando si chiamano funzioni come onClose
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Qui implementeremo la logica di invio
    console.log('Form submitted:', formData);
    
    // Assicurati che onClose venga chiamato in modo sicuro
    if (isMounted && typeof onClose === 'function') {
      setTimeout(() => onClose(), 100);
    }
  };
  
  // Funzione sicura per la chiusura
  const safeClose = (e) => {
    // Impedisci che l'evento si propaghi
    if (e) {
      e.stopPropagation();
    }
    
    if (isMounted && typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={safeClose}
            style={{ pointerEvents: 'auto' }}
          />
          <motion.div
            className="booking-modal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()} // Impedisci che i click sul modal si propaghino all'overlay
          >
            <div className="modal-header">
              <h2>Prenota una Sessione</h2>
              <button 
                className="close-button" 
                onClick={safeClose}
                style={{ cursor: 'pointer', zIndex: 2000 }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ora</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tipo di Servizio</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                >
                  <option value="recording">Registrazione</option>
                  <option value="mixing">Mixing</option>
                  <option value="mastering">Mastering</option>
                  <option value="production">Produzione</option>
                </select>
              </div>
              <div className="form-group">
                <label>Messaggio (opzionale)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
              <button 
                type="submit" 
                className="submit-button"
                style={{ cursor: 'pointer', position: 'relative', zIndex: 2000 }}
              >
                Prenota Ora
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingModal; 