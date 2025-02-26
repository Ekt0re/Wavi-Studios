import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import EquipmentGallery from '../components/EquipmentGallery';
import ParallaxSection from '../components/ParallaxSection';
import '../styles/Studio.scss';

const Studio = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

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
    <div className="studio-page">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Il Nostro Studio
      </motion.h1>

      <ParallaxSection>
        <div className="studio-content">
          <motion.div
            className="studio-description"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Attrezzature Professionali
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Il nostro studio è equipaggiato con le migliori tecnologie audio per garantire
              una qualità sonora eccezionale. Disponiamo di una vasta gamma di microfoni,
              pre-amplificatori, strumenti musicali e software professionali per soddisfare
              ogni esigenza di produzione.
            </motion.p>
          </motion.div>
        </div>
      </ParallaxSection>

      <motion.div
        style={{ scale }}
        className="equipment-section"
      >
        <EquipmentGallery />
      </motion.div>

      <ParallaxSection offset={30}>
        <section className="studio-features">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Caratteristiche dello Studio
          </motion.h2>
          <motion.div
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Sala di Registrazione",
                description: "120m² di spazio acusticamente trattato"
              },
              {
                title: "Regia",
                description: "Ambiente professionale per mixing e mastering"
              },
              {
                title: "Area Relax",
                description: "Spazio confortevole per pause creative"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </ParallaxSection>
    </div>
  );
};

export default Studio; 