import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { purchaseService, SERVICES } from '../services/purchaseService';
import '../styles/Services.scss';

const services = [
  {
    title: "Beat Pronto",
    description: "Sfoglia i nostri beat e trova quello adatto a te!",
    image: "/Assets/Servizi/Img_S_1.jpg",
    link: "/shop"
  },
  {
    title: "Beat Custom",
    description: "Creiamo il tuo beat su misura",
    image: "/Assets/Servizi/Img_S_2.jpg",
    link: "/servizi/beat-custom",
    purchaseId: "beat-custom"
  },
  {
    title: "Registrazione",
    description: "Registra la nuova hit!",
    image: "/Assets/Servizi/Img_S_3.jpg",
    link: "/servizi/registrazione",
    purchaseId: "registrazione"
  },
  {
    title: "Mix e Master",
    description: "Mixiamo e masterizziamo la tua hit!",
    image: "/Assets/Servizi/Img_S_4.jpg",
    link: "/servizi/mix-master",
    purchaseId: "mix-master"
  }
];

const Services = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Gestisci l'acquisto di un servizio
  const handlePurchase = async (serviceId) => {
    if (!isAuthenticated()) {
      // Se l'utente non è autenticato, reindirizza al login
      navigate('/login?redirect=servizi');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Ottieni i dettagli del servizio
      const service = purchaseService.getServiceDetails(serviceId);
      if (!service) {
        setError('Servizio non disponibile');
        return;
      }
      
      // Crea sessione di checkout e reindirizza a Stripe
      await purchaseService.createCheckoutSession(serviceId);
      
      // La pagina verrà reindirizzata dal servizio
    } catch (error) {
      console.error('Errore durante l\'acquisto:', error);
      setError('Si è verificato un errore durante l\'acquisto. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="services-page">
      <h1>SERVIZI</h1>
      
      {/* Messaggi di errore */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Navigation buttons */}
      <div className="service-navigation">
        {services.map((service, index) => (
          <Link key={index} to={service.link} className="nav-button">
            {service.title}
          </Link>
        ))}
      </div>

      {/* Service sections */}
      <div className="services-content">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="service-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            style={{
              backgroundImage: `url(${service.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="service-info">
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              <Link to={service.link} className="service-button">
                Scopri di più
              </Link>
              
              {/* Pulsante di acquisto per i servizi acquistabili */}
              {service.purchaseId && (
                <button 
                  className="purchase-button"
                  onClick={() => handlePurchase(service.purchaseId)}
                  disabled={loading}
                >
                  {loading ? 'Elaborazione...' : `Acquista - €${SERVICES[service.purchaseId]?.price || '--'}`}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services; 