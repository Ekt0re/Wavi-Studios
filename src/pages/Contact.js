import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import emailjs from 'emailjs-com';
import '../styles/Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: <FiMail />,
      title: "Email",
      content: "mailwavystudios@gmail.com",
      link: "mailto:mailwavystudios@gmail.com"
    },
    {
      icon: <FiPhone />,
      title: "Telefono",
      content: "+39 328 648 8727",
      link: "tel:+393286488727"
    },
    {
      icon: <FiMapPin />,
      title: "Indirizzo",
      content: "Via Example, 123 - Roma",
      link: "https://maps.google.com"
    },
    {
      icon: <FiClock />,
      title: "Orari",
      content: "Lun - Ven: 9:00 - 18:00",
      link: null
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const result = await emailjs.send(
        'service_cs171u7',
        'template_ybqaba3',
        formData,
        'cfR2wQEzwmTLxVohm'
      );
      if (result.status === 200) {
        setStatus({
          type: 'success',
          message: 'Messaggio inviato con successo! Ti risponderemo presto.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Errore nell\'invio del messaggio.');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Si è verificato un errore. Riprova più tardi.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Contattaci
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Siamo qui per trasformare la tua visione musicale in realtà
        </motion.p>
      </div>

      <div className="contact-content">
        <motion.div 
          className="contact-info"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2>Informazioni di Contatto</h2>
          <div className="info-grid">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="info-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <div className="icon">{info.icon}</div>
                <h3>{info.title}</h3>
                {info.link ? (
                  <a href={info.link} target={info.title === "Indirizzo" ? "_blank" : undefined} rel="noopener noreferrer">
                    {info.content}
                  </a>
                ) : (
                  <p>{info.content}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="contact-form-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2>Inviaci un Messaggio</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Il tuo nome"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="La tua email"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Oggetto</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Oggetto del messaggio"
                required
              />
            </div>
            <div className="form-group">
              <label>Messaggio</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Il tuo messaggio"
                required
              ></textarea>
            </div>
            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia Messaggio'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 