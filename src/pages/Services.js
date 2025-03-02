import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    link: "/servizi/beat-custom"
  },
  {
    title: "Registrazione",
    description: "Registra la nuova hit!",
    image: "/Assets/Servizi/Img_S_3.jpg",
    link: "/servizi/registrazione"
  },
  {
    title: "Mix e Master",
    description: "Mixiamo e masterizziamo la tua hit!",
    image: "/Assets/Servizi/Img_S_4.jpg",
    link: "/servizi/mix-master"
  }
];

const Services = () => {
  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="services-page">
      <h1>SERVIZI</h1>
      
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
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services; 