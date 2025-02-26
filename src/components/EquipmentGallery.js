import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/EquipmentGallery.scss';

const EquipmentGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tutto' },
    { id: 'microphones', label: 'Microfoni' },
    { id: 'preamps', label: 'Pre-amplificatori' },
    { id: 'instruments', label: 'Strumenti' },
    { id: 'software', label: 'Software' }
  ];

  const equipment = [
    {
      id: 1,
      name: 'Neumann U87',
      category: 'microphones',
      description: 'Microfono a condensatore di alta qualità',
      specs: ['Diagramma polare multiplo', 'Risposta in frequenza: 20 Hz - 20 kHz']
    },
    {
      id: 2,
      name: 'Universal Audio 610',
      category: 'preamps',
      description: 'Pre-amplificatore valvolare classico',
      specs: ['2 canali', 'Equalizzatore integrato']
    },
    {
      id: 3,
      name: 'Yamaha C7',
      category: 'instruments',
      description: 'Pianoforte a coda professionale',
      specs: ['7 piedi e 4 pollici', 'Completamente restaurato']
    },
    {
      id: 4,
      name: 'Pro Tools Ultimate',
      category: 'software',
      description: 'DAW professionale',
      specs: ['HDX System', 'Plugins premium inclusi']
    }
  ];

  const filteredEquipment = selectedCategory === 'all'
    ? equipment
    : equipment.filter(item => item.category === selectedCategory);

  return (
    <div className="equipment-gallery">
      <div className="category-filters">
        {categories.map(category => (
          <motion.button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.label}
          </motion.button>
        ))}
      </div>

      <motion.div 
        className="equipment-grid"
        layout
      >
        <AnimatePresence>
          {filteredEquipment.map(item => (
            <motion.div
              key={item.id}
              className="equipment-card"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <ul className="specs">
                {item.specs.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EquipmentGallery; 