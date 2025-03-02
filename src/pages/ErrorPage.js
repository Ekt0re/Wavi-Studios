import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ErrorPage.scss';

const ErrorPage = ({ statusCode = 404, message }) => {
  const defaultMessages = {
    404: 'Pagina non trovata',
    500: 'Errore del server',
    403: 'Accesso negato'
  };

  const errorMessage = message || defaultMessages[statusCode] || 'Si è verificato un errore';

  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-code">{statusCode}</h1>
        <h2 className="error-message">{errorMessage}</h2>
        <p>Ci dispiace per l'inconveniente. Torna alla home page per continuare la navigazione.</p>
        <Link to="/" className="btn-primary">
          Torna alla Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage; 