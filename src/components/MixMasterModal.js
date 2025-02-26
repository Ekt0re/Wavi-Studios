import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/FileUploadModal.scss';

const MixMasterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    numero: '',
    selectedService: ''
  });

  const [error, setError] = useState('');

  const services = [
    { id: 'solo-mix', name: 'Solo Mix del Beat', price: 30 },
    { id: 'solo-master', name: 'Solo Master', price: 20 },
    { id: 'mix-voice', name: 'Mix Voce + Master con Beat già Mixato', price: 35 },
    { id: 'mix-master', name: 'Mix e Master', price: 45 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedService: serviceId
    }));
  };

  const handleNextStep = () => {
    if (!formData.selectedService) {
      setError('Seleziona un tipo di servizio');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.numero) {
      setError('Compila tutti i campi richiesti');
      return;
    }

    try {
      // Qui implementerai la logica per l'invio dei dati
      console.log('Form data:', formData);
      onClose();
    } catch (error) {
      setError(error.message || 'Si è verificato un errore. Riprova.');
    }
  };

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="modal-content">
      <button className="close-button" onClick={onClose}>×</button>
      <h2>SELEZIONA IL SERVIZIO</h2>
      <div className="service-selection">
        <div className="service-options">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={`service-option ${formData.selectedService === service.id ? 'active' : ''}`}
              onClick={() => handleServiceSelect(service.id)}
            >
              {service.name}: {service.price}€
            </button>
          ))}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="button-container">
        <motion.button 
          type="button" 
          className="submit-button" 
          onClick={handleNextStep}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          AVANTI
        </motion.button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="modal-content">
      <button className="close-button" onClick={onClose}>×</button>
      <h2>FORNISCI LE TUE INFORMAZIONI</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="nome"
            placeholder="NOME COMPLETO"
            value={formData.nome}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="MAIL"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="numero"
              placeholder="NUMERO"
              value={formData.numero}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <div className="button-container">
          <motion.button
            type="button"
            className="back-button"
            onClick={handlePrevStep}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            INDIETRO
          </motion.button>
          <motion.button
            type="submit"
            className="submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            PAGA E PROCEDI
          </motion.button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
};

export default MixMasterModal; 