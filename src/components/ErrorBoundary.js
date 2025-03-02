import React from 'react';
import ErrorPage from '../pages/ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo stato in modo che il prossimo render mostri l'UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Puoi anche registrare l'errore in un servizio di reporting degli errori
    console.error('ErrorBoundary ha catturato un errore:', error, errorInfo);
    this.setState({ errorInfo });

    // Se hai un servizio di logging degli errori, puoi inviarlo qui
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puoi personalizzare la UI di fallback
      return (
        <ErrorPage 
          statusCode={500} 
          message={`Si è verificato un errore nell'applicazione: ${this.state.error?.message || 'Errore sconosciuto'}`} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 