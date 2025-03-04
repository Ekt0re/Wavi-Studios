import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.scss';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Chiudi il menu dell'account quando si cambia pagina
  useEffect(() => {
    setAccountMenuOpen(false);
    setIsOpen(false); // Chiudi anche il menu mobile quando si cambia pagina
  }, [location]);
  
  // Aggiungi event listener per chiudere i menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
        
        // Non chiudiamo il menu mobile quando si clicca fuori per evitare comportamenti indesiderati
        // su dispositivi touch. Il menu mobile si chiuderà solo quando si clicca su un link o sull'icona di chiusura.
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountClick = () => {
    // Rimuovi il focus dopo il click per evitare contorni indesiderati
    document.activeElement.blur();
    
    if (currentUser) {
      setAccountMenuOpen(!accountMenuOpen);
    } else {
      navigate('/login');
    }
  };
  
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const handleLogoClick = () => {
    if (currentUser) {
      navigate('/account');
    } else {
      navigate('/login');
    }
  };
  
  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
    // Quando apriamo il menu mobile, chiudiamo il menu dell'account se è aperto
    if (!isOpen && accountMenuOpen) {
      setAccountMenuOpen(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/servizi', label: 'Servizi' },
    //{ path: '/studio', label: 'Studio' },
    { path: '/contatti', label: 'Contatti' }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} ref={navRef}>
      <div className="navbar-container">
        <button 
          className="logo" 
          onClick={handleLogoClick}
          style={{ border: 'none', cursor: 'pointer', padding: 0, background: 'transparent' }}
        >
          <div>
            <motion.h1>
              Wavy Studios
            </motion.h1>
            <p className="slogan">
              the best in the game
            </p>
          </div>
        </button>

        <div className="menu-icon" onClick={handleMenuToggle}>
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </div>

        <motion.div
          className={`nav-links ${isOpen ? 'active' : ''}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="nav-links-wrapper">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="account-container">
            <div 
              className={`account-icon ${accountMenuOpen ? 'active' : ''}`} 
              onClick={handleAccountClick}
              style={{ outline: 'none' }}
              tabIndex="-1"
            >
              <AccountCircleIcon fontSize="medium" />
              {currentUser && (
                <span className="account-name">
                  {currentUser.name || currentUser.username || 'Account'}
                </span>
              )}
            </div>
            
            <AnimatePresence>
              {accountMenuOpen && currentUser && (
                <motion.div 
                  className="account-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/account" onClick={() => {
                    setAccountMenuOpen(false);
                    setIsOpen(false);
                  }}>
                    Il Mio Profilo
                  </Link>
                  <a href="/" onClick={(e) => {
                    handleLogout(e);
                    setIsOpen(false);
                  }}>
                    Logout
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar; 