// Questo file viene eseguito prima di tutto il resto e configura process.env
console.log('Bootstrap: inizializzo process.env');

// Se siamo nel browser e process non è definito, definiscilo
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  
  // Definisci NODE_ENV
  if (!window.process.env.NODE_ENV) {
    window.process.env.NODE_ENV = 'development';
  }
  
  console.log('Bootstrap: process.env.NODE_ENV =', window.process.env.NODE_ENV);
  
  // Definisci altre variabili d'ambiente
  window.process.env.PUBLIC_URL = window.process.env.PUBLIC_URL || '';
  
  // Fix per problemi di eventi touch in alcuni browser
  // Questo aiuta a garantire che i pulsanti siano cliccabili
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Applicazione di fix per interazioni touch/click');
    
    // Fix per dispositivi touch - assicura che gli eventi click funzionino correttamente
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Imposta uno stile globale per migliorare la cliccabilità degli elementi interattivi
    const style = document.createElement('style');
    style.textContent = `
      button, a, [role="button"], input[type="submit"], input[type="button"], .clickable {
        cursor: pointer !important;
        touch-action: manipulation;
        -webkit-tap-highlight-color: rgba(0,0,0,0);
      }
    `;
    document.head.appendChild(style);
  });
}

// Polyfill per process.env se non definito
if (typeof process === 'undefined' || !process.env) {
  window.process = {
    env: {
      NODE_ENV: 'development',
    }
  };
}

// Gestire gli errori per framer-motion
window.addEventListener('error', function(event) {
  // Ignorare errori specifici di framer-motion
  if (event.message && (
    event.message.includes('The animation value of "boxShadow" must be a string') ||
    event.message.includes('cannot be interpolated') ||
    event.message.includes('framer-motion')
  )) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Avviso framer-motion soppresso:', event.message);
    return true;
  }
  return false;
}, true);

// Migliorare il comportamento del touch e del click
document.addEventListener('DOMContentLoaded', function() {
  // Aggiungi stili per migliorare la clickabilità
  const style = document.createElement('style');
  style.textContent = `
    button, a, [role="button"], .clickable {
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }
    
    .glass-effect, .modal-overlay {
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);
  
  // Ascoltatori per eventi di touch
  document.addEventListener('touchstart', function() {}, {passive: true});
  document.addEventListener('touchmove', function() {}, {passive: true});
  document.addEventListener('touchend', function() {}, {passive: true});
});

export default window.process; 