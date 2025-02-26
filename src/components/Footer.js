import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Wavy Studios</h3>
          <p>The best in the game</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/servizi">Servizi</Link>
            <Link to="/studio">Studio</Link>
            <Link to="/contatti">Contatti</Link>
          </nav>
        </div>
        
        <div className="footer-section">
          <h4>Contatti</h4>
          <p>Email: mailwavystudios@gmail.com</p>
          <p>Tel: +39 328 648 8727</p>
          <p>Indirizzo: Via Example, 123 - Roma</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Wavy Studios. Tutti i diritti riservati.</p>
        <p><a href="https://www.instagram.com/ettore_sartori">Sito web realizzato da Sartori Ettore</a></p>
      </div>
    </footer>
  );
};

export default Footer; 