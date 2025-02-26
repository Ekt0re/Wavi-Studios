import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import '../styles/Registrazione.scss';

const faq = [
  {
    domanda: "Quanto dura una sessione di registrazione?",
    risposta: "Una sessione standard dura 2 ore, ma può essere estesa in base alle tue esigenze."
  },
  {
    domanda: "Che tipo di attrezzatura utilizzate?",
    risposta: "Utilizziamo microfoni professionali, interfacce audio di alta qualità e una cabina insonorizzata."
  },
  {
    domanda: "Posso portare il mio producer?",
    risposta: "Sì, sei libero di portare il tuo producer o lavorare con i nostri professionisti."
  }
];

const Registrazione = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="registrazione-page">
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1>PRENOTA</h1>
        <button 
          className="prenota-button"
          onClick={() => setIsBookingModalOpen(true)}
        >
          PRENOTA ORA
        </button>
      </motion.div>

      <section className="info-section">
        <div className="info-content">
          <h2>INFO:</h2>
          <p>
            Il nostro studio di registrazione offre un ambiente professionale e creativo 
            per dare vita alla tua musica. Con attrezzature di alta qualità e tecnici 
            esperti, garantiamo la migliore qualità di registrazione per il tuo progetto.
          </p>
          <div className="studio-image">
            <img src="/Assets/Servizi/Img_S_3.jpg" alt="Studio di registrazione" />
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>DOMANDE FREQUENTI</h2>
        <div className="faq-list">
          {faq.map((item, index) => (
            <motion.div 
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3>{item.domanda}</h3>
              <p>{item.risposta}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="contact-section">
        <h2>ALTRE DOMANDE?</h2>
        <Link to="/contatti" className="contact-button">
          CONTATTACI
        </Link>
      </section>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)}
        service="Registrazione"
      />
    </div>
  );
};

export default Registrazione; 