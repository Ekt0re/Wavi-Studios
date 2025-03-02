import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../styles/ParallaxSection.scss';

// Hook personalizzato per sostituire useScroll
const useCustomScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { scrollY };
};

const ParallaxSection = ({ children, offset = 50 }) => {
  const [elementTop, setElementTop] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const ref = useRef(null);
  const { scrollY } = useCustomScroll();

  // Sostituisco useTransform con un calcolo diretto in un useEffect
  useEffect(() => {
    if (elementTop !== 0) {
      const inputRange = [elementTop - offset, elementTop + offset];
      const outputRange = [-offset, offset];
      
      // Mappo scrollY dagli input agli output
      const progress = (scrollY - inputRange[0]) / (inputRange[1] - inputRange[0]);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      const result = outputRange[0] + clampedProgress * (outputRange[1] - outputRange[0]);
      
      setParallaxY(result);
    }
  }, [scrollY, elementTop, offset]);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      const updateElementTop = () => {
        const rect = element.getBoundingClientRect();
        setElementTop(rect.top + window.scrollY);
      };
      
      updateElementTop();
      window.addEventListener('resize', updateElementTop);
      return () => window.removeEventListener('resize', updateElementTop);
    }
  }, [ref]);

  return (
    <div ref={ref} className="parallax-section">
      <motion.div 
        style={{ y: parallaxY }} 
        className="parallax-inner"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection; 