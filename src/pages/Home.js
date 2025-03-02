import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import BookingModal from '../components/BookingModal';
import ParallaxSection from '../components/ParallaxSection';
import '../styles/Home.scss';

// Hook personalizzato per sostituire useScroll
const useCustomScroll = () => {
  const [scrollYProgress, setScrollYProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      setScrollYProgress(scrollPercent);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { scrollYProgress };
};

const Home = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { scrollYProgress } = useCustomScroll();
  
  // Sostituisco useTransform con valori statici o calcoli semplici
  // poiché useTransform richiede un oggetto MotionValue
  const opacity = { current: 1 - Math.min(1, scrollYProgress * 5) };
  const scale = { current: 1 - Math.min(0.05, scrollYProgress * 0.25) };

  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="scene-placeholder" style={{ 
          position: 'absolute', 
          left: '50%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '100%', 
          height: '100vh',
          zIndex: -1,
          backgroundColor: '#121212',
          backgroundImage: 'linear-gradient(135deg, #1a1a1a, #333333)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.8,
          pointerEvents: 'none'
        }}>
        </div>
        <motion.div
          className="hero-content"
          style={{ opacity, scale }}
        >
          <motion.div className="hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ 
                color: 'var(--primary-color)', 
                textShadow: '0 2px 10px rgba(255, 77, 77, 0.5)',
                fontSize: '4rem'
              }}
            >
              Wavy Studios
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{ 
                color: 'white', 
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              The Best in the Game
            </motion.p>
          </motion.div>
          <motion.div className="hero-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            style={{ position: 'relative', zIndex: 20 }}
          >
            <button
              className="cta-button"
              onClick={() => setIsBookingModalOpen(true)}
              style={{
                padding: '1.2rem 3rem',
                fontSize: '1.2rem',
                background: 'rgba(255, 77, 77, 0.2)',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '50px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: '600',
                position: 'relative',
                zIndex: 20
              }}
            >
              Prenota una sessione
            </button>
          </motion.div>
        </motion.div>
        <div className="hero-overlay" style={{ pointerEvents: 'none' }} />
      </section>

      <ParallaxSection>
        <section className="services" ref={ref}>
          <motion.div
            className="services-grid"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {[
              {
                title: "Registrazione Professionale",
                description: "Attrezzature di alta qualità per catturare il tuo suono perfetto"
              },
              {
                title: "Mixing & Mastering",
                description: "Dai al tuo progetto il suono professionale che merita"
              },
              {
                title: "Produzione Musicale",
                description: "Sviluppa il tuo sound con i nostri producer esperti"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                className="service-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
                }}
                transition={{ duration: 0.3 }}
              >
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </ParallaxSection>

      <section className="about">
        <motion.div
          className="about-content"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Il Nostro Studio
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Con oltre 10 anni di esperienza nel settore musicale, offriamo un ambiente
            creativo e professionale per dare vita ai tuoi progetti musicali.
            Il nostro studio è equipaggiato con le migliori tecnologie audio
            per garantire risultati di altissima qualità.
          </motion.p>
        </motion.div>
      </section>

      <ParallaxSection offset={30}>
        <section className="testimonials">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Cosa Dicono di Noi
          </motion.h2>
          <motion.div
            className="testimonials-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
                }}
                transition={{ duration: 0.3 }}
              >
                <p>"Esperienza incredibile, professionalità al top!"</p>
                <h4>Cliente {index}</h4>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </ParallaxSection>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
};

export default Home; 