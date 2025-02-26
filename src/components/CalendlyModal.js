import React, { useState } from 'react';
import { InlineWidget } from 'react-calendly';
import { motion, AnimatePresence } from 'framer-motion';
import { CALENDLY_CONFIG } from '../config/calendly';
import '../styles/CalendlyModal.scss';

const CalendlyModal = ({ isOpen, onClose }) => {
  const [selectedDuration, setSelectedDuration] = useState('2H');

  const pageSettings = {
    backgroundColor: '1a1a1a',
    hideEventTypeDetails: false,
    hideLandingPageDetails: false,
    primaryColor: 'ff4d4d',
    textColor: 'ffffff'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="calendly-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="calendly-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button className="close-button" onClick={onClose}>×</button>
            
            <div className="duration-selector">
              <button 
                className={`duration-button ${selectedDuration === '2H' ? 'active' : ''}`}
                onClick={() => setSelectedDuration('2H')}
              >
                2 ORE
              </button>
              <button 
                className={`duration-button ${selectedDuration === '3H' ? 'active' : ''}`}
                onClick={() => setSelectedDuration('3H')}
              >
                3 ORE
              </button>
            </div>

            <InlineWidget
              url={`${CALENDLY_CONFIG.SCHEDULING_URL}/${CALENDLY_CONFIG.EVENT_TYPES[selectedDuration]}`}
              styles={{
                height: '650px',
                width: '100%'
              }}
              pageSettings={pageSettings}
              prefill={{
                email: '',
                firstName: '',
                lastName: '',
                name: ''
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalendlyModal; 