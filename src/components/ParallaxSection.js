import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import '../styles/ParallaxSection.scss';

const ParallaxSection = ({ children, offset = 50 }) => {
  const [elementTop, setElementTop] = useState(0);
  const { scrollY } = useScroll();

  const y = useTransform(
    scrollY,
    [elementTop - offset, elementTop + offset],
    [-offset, offset]
  );

  useEffect(() => {
    const element = document.getElementById('parallax-wrapper');
    const onResize = () => {
      if (element) {
        setElementTop(element.offsetTop);
      }
    };
    
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div id="parallax-wrapper" className="parallax-section">
      <motion.div style={{ y }} className="parallax-content">
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection; 