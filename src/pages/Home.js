import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import BookingModal from '../components/BookingModal';
import ParallaxSection from '../components/ParallaxSection';
import Scene3D from '../components/Scene3D';
import '../styles/Home.scss';

const Home = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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
        <Scene3D rotation={0.1} modelType="headphones" />
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
            >
              Wavy Studios
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              The Best in the Game
            </motion.p>
          </motion.div>
          <motion.div className="hero-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              className="cta-button"
              onClick={() => setIsBookingModalOpen(true)}
            >
              Prenota una sessione
            </motion.button>
          </motion.div>
        </motion.div>
        <div className="hero-overlay" />
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