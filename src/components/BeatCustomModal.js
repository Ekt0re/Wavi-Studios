import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import '../styles/BeatCustomModal.scss';

const stripePromise = loadStripe('pk_test_51Qt8XMR4ikOicVEGYBPF0hSvy4AbUGhfwVszXsBwWSXWmfSxz1bwbHQvKsZn2kuYqyyxUndY1Z8U5ekB90UdZ4gD00yvWKTbhy');

// URL base del server
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tuo-dominio.com'
  : 'http://localhost:3001';

const BeatCustomModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    numero: '',
    selectedService: '',
    genere: '',
    bpm: '',
    strumenti: '',
    struttura: '',
    effetti: '',
    esempi: '',
    altro: ''
  });

  const [error, setError] = useState('');

  const services = [
    { id: 'exclusive', name: 'Exclusive: 110€' },
    { id: 'exclusive-multitrack', name: 'Exclusive multitrack: 150€' }
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
    if (step === 1 && !formData.selectedService) {
      setError('Seleziona un tipo di servizio');
      return;
    }
    if (step === 2 && (!formData.nome || !formData.email || !formData.numero)) {
      setError('Compila tutti i campi richiesti');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.genere || !formData.bpm) {
      setError('Compila almeno genere e BPM');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Impossibile inizializzare Stripe');
      }
      
      // Mappa gli ID dei servizi
      const productId = formData.selectedService === 'exclusive' 
        ? 'prod_Rowuq1k6FUef57' 
        : 'prod_RowvdDV3wmoaf6';

      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerData: {
            email: formData.email,
            name: formData.nome,
            phone: formData.numero,
            metadata: {
              genere: formData.genere,
              bpm: formData.bpm,
              strumenti: formData.strumenti,
              struttura: formData.struttura,
              effetti: formData.effetti,
              esempi: formData.esempi,
              altro: formData.altro
            }
          }
        }),
      }).catch(error => {
        throw new Error('Errore di connessione al server. Verifica la tua connessione internet.');
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Prova a parsare come JSON
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Errore durante la creazione della sessione');
        } catch (e) {
          // Se non è JSON, usa il testo dell'errore
          console.error('Risposta server non valida:', errorText);
          throw new Error('Il server non risponde correttamente. Riprova più tardi.');
        }
      }

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

    } catch (error) {
      console.error('Errore durante il pagamento:', error);
      setError(error.message || 'Si è verificato un errore durante il pagamento. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="modal-content">
      <h2>SELEZIONA IL CONTRATTO</h2>
      <button className="close-button" onClick={onClose}>×</button>
      <div className="service-selection">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            className={`service-option ${formData.selectedService === service.id ? 'active' : ''}`}
            onClick={() => handleServiceSelect(service.id)}
          >
            {service.name}
          </button>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="button-container right">
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
      <h2>FORNISCI LE TUE INFORMAZIONI</h2>
      <button className="close-button" onClick={onClose}>×</button>
      <div className="upload-form">
        <input
          type="text"
          name="nome"
          placeholder="NOME COMPLETO"
          value={formData.nome}
          onChange={handleInputChange}
          required
        />

        <div className="form-row">
          <input
            type="email"
            name="email"
            placeholder="MAIL"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="tel"
            name="numero"
            placeholder="NUMERO"
            value={formData.numero}
            onChange={handleInputChange}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <div className="button-container">
          <button
            type="button"
            className="back-button"
            onClick={handlePrevStep}
          >
            INDIETRO
          </button>
          <button
            type="button"
            className="submit-button"
            onClick={handleNextStep}
          >
            AVANTI
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="modal-content">
      <h2>AIUTACI A CREARE IL TUO BEAT CUSTOM!</h2>
      <button className="close-button" onClick={onClose}>×</button>
      <form onSubmit={handleSubmit} className="upload-form">
        <select
          name="genere"
          value={formData.genere}
          onChange={handleInputChange}
          required
        >
          <option value="">GENERE</option>
          <option value="pop">Pop</option>
          <option value="rap">Rap</option>
          <option value="trap">Trap</option>
          <option value="altro">Altro</option>
        </select>

        <select
          name="bpm"
          value={formData.bpm}
          onChange={handleInputChange}
          required
        >
          <option value="">TEMPO BPM</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={(i + 7) * 10}>
              {(i + 7) * 10} BPM
            </option>
          ))}
        </select>

        <input
          type="text"
          name="strumenti"
          placeholder="STRUMENTI"
          value={formData.strumenti}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="struttura"
          placeholder="STRUTTURA"
          value={formData.struttura}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="effetti"
          placeholder="EFFETTI"
          value={formData.effetti}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="esempi"
          placeholder="ESEMPI"
          value={formData.esempi}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="altro"
          placeholder="ALTRO"
          value={formData.altro}
          onChange={handleInputChange}
        />

        {error && <div className="error-message">{error}</div>}
        
        <div className="button-container">
          <button
            type="button"
            className="back-button"
            onClick={handlePrevStep}
            disabled={loading}
          >
            INDIETRO
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'ELABORAZIONE...' : 'PAGA E ORDINA'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default BeatCustomModal; 