import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BookingModal from '../components/BookingModal';
import CalendlyModal from '../components/CalendlyModal';
import FileUploadModal from '../components/FileUploadModal';
import MixMasterModal from '../components/FileUploadModal';
import BeatCustomModal from '../components/BeatCustomModal';
import '../styles/ServiceDetail.scss';

const serviceDetails = {
  'beat-pronto': {
    name: 'Beat Pronto',
    description: 'Esplora la nostra collezione di beat pronti per l\'uso.',
    longDescription: 'Il nostro catalogo di beat pronti offre una vasta selezione di produzioni di alta qualità. Ogni beat è mixato e masterizzato professionalmente, pronto per essere utilizzato nel tuo prossimo progetto.',
    faq: [
      { q: "Come funziona il lease?", a: "Il lease ti dà il diritto di utilizzare il beat secondo i termini specificati nel contratto." },
      { q: "Posso utilizzare il beat su Spotify?", a: "Sì, tutti i nostri lease includono i diritti per lo streaming." }
    ],
    options: ['MP3 Lease', 'WAV Lease', 'Multitrack Lease', 'Unlimited Lease'],
    image: '/Assets/Servizi/Img_S_1.jpg'
  },
  'beat-custom': {
    name: 'Beat Custom',
    description: 'Crea un beat su misura per le tue esigenze.',
    longDescription: 'Creiamo beat personalizzati seguendo le tue indicazioni e preferenze. Lavoriamo insieme per sviluppare il sound perfetto per il tuo progetto.',
    faq: [
      { q: "Quanto tempo ci vuole?", a: "Generalmente da 3 a 7 giorni lavorativi." },
      { q: "Posso richiedere modifiche?", a: "Sì, il servizio include due round di revisioni." }
    ],
    options: ['Exclusive', 'Exclusive Multitrack'],
    image: '/Assets/Servizi/Img_S_2.jpg'
  },
  'registrazione': {
    name: 'Registrazione',
    description: 'Prenota una sessione di registrazione professionale.',
    longDescription: 'Il nostro studio di registrazione è equipaggiato con attrezzature professionali di alta qualità. Offriamo un ambiente creativo e confortevole per dare vita alla tua musica, con tecnici esperti pronti ad assisterti.',
    faq: [
      { q: "Quanto dura una sessione?", a: "Una sessione standard dura 2 ore, ma può essere estesa secondo le tue esigenze." },
      { q: "Che attrezzatura utilizzate?", a: "Microfoni professionali, interfacce audio di alta qualità e una cabina insonorizzata." },
      { q: "Posso portare il mio producer?", a: "Sì, sei libero di portare il tuo producer o lavorare con i nostri professionisti." }
    ],
    options: ['1 ora', '2 ore', '3 ore'],
    image: '/Assets/Servizi/Img_S_3.jpg'
  },
  'mix-master': {
    name: 'Mix e Master',
    description: 'Dai al tuo progetto il suono professionale che merita.',
    longDescription: 'Offriamo servizi di mixing e mastering professionale per portare il tuo progetto al livello successivo. Utilizziamo plugin e attrezzature di alta qualità per garantire risultati eccellenti.',
    faq: [
      { q: "Quanto tempo richiede il processo?", a: "Generalmente 3-5 giorni lavorativi per mix e master." },
      { q: "Posso richiedere revisioni?", a: "Sì, includiamo due round di revisioni nel servizio." }
    ],
    options: ['Solo Mix', 'Solo Master', 'Mix e Master'],
    image: '/Assets/Servizi/Img_S_4.jpg'
  }
};

const ServiceDetail = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isMixMasterModalOpen, setIsMixMasterModalOpen] = useState(false);
  const [isBeatCustomModalOpen, setIsBeatCustomModalOpen] = useState(false);
  const { id } = useParams();
  const service = serviceDetails[id];

  if (!service) {
    return <Navigate to="/servizi" replace />;
  }

  console.log('Service image path:', service.image);

  const handleBookingClick = () => {
    if (id === 'registrazione') {
      setIsCalendlyModalOpen(true);
    } else if (id === 'mix-master') {
      setIsMixMasterModalOpen(true);
    } else if (id === 'beat-custom') {
      setIsBeatCustomModalOpen(true);
    } else {
      setIsBookingModalOpen(true);
    }
  };

  const handleBeatCustomSubmit = (formData) => {
    console.log('Beat custom form data:', formData);
    // Qui implementerai la logica per gestire l'ordine
  };

  return (
    <div className="service-detail-page">
      {/* Hero Section con Titolo e Pulsante Prenota */}
      <div 
        className="service-hero" 
        style={{ 
          backgroundImage: `url(${service.image})`,
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {service.name}
          </motion.h1>
          <motion.button
            className="prenota-button"
            onClick={handleBookingClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {id === 'mix-master' ? 'CARICA I FILE' : id === 'beat-custom' ? 'ORDINA ORA' : 'PRENOTA ORA'}
          </motion.button>
        </div>
      </div>

      {/* Sezione Info */}
      <motion.section 
        className="info-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="info-content">
          <div className="info-text">
            <h2>INFO:</h2>
            <p>{service.longDescription}</p>
          </div>
          <div className="info-image">
            <img src={service.image} alt={service.name} />
          </div>
        </div>
      </motion.section>

      {/* Sezione FAQ */}
      <motion.section 
        className="faq-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2>DOMANDE FREQUENTI</h2>
        <div className="faq-list">
          {service.faq.map((item, index) => (
            <motion.div
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </motion.div>
          ))}
        </div>
        <div className="contact-section">
          <h3>ALTRE DOMANDE?</h3>
          <Link to="/contatti" className="contact-button">
            CONTATTACI
          </Link>
        </div>
      </motion.section>

      {id === 'registrazione' ? (
        <CalendlyModal 
          isOpen={isCalendlyModalOpen} 
          onClose={() => setIsCalendlyModalOpen(false)} 
        />
      ) : id === 'mix-master' ? (
        <MixMasterModal
          isOpen={isMixMasterModalOpen}
          onClose={() => setIsMixMasterModalOpen(false)}
        />
      ) : id === 'beat-custom' ? (
        <BeatCustomModal
          isOpen={isBeatCustomModalOpen}
          onClose={() => setIsBeatCustomModalOpen(false)}
        />
      ) : (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)}
          service={service.name}
        />
      )}
    </div>
  );
};

export default ServiceDetail; 