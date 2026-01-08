// Rimuovo l'importazione inutilizzata di loadStripe
// import { loadStripe } from '@stripe/stripe-js';

const API_URL = 'http://localhost:3002/api/purchases';
// Questa variabile sarà utilizzata in futuro per integrazioni lato client con Stripe
// const stripePromise = loadStripe('pk_test_51Qt8XMR4ikOicVEGOer2rzTZ7T25YfiemJdd1islusjiDhaJkK1HWUconcFEtkKjnyBAex8uOtx2JGwYkU9tVWO600m0wsgR48');

// Servizi disponibili per l'acquisto
export const SERVICES = {
  'beat-custom': {
    id: 'beat-custom',
    name: 'Beat Custom',
    description: 'Beat personalizzato creato su misura per te',
    price: 120,
    imageUrl: '/Assets/Servizi/Img_S_2.jpg'
  },
  'registrazione': {
    id: 'registrazione',
    name: 'Sessione di Registrazione',
    description: 'Sessione di registrazione professionale in studio',
    price: 80,
    imageUrl: '/Assets/Servizi/Img_S_3.jpg'
  },
  'mix-master': {
    id: 'mix-master',
    name: 'Mix e Master',
    description: 'Servizio completo di mix e mastering per la tua traccia',
    price: 70,
    imageUrl: '/Assets/Servizi/Img_S_4.jpg'
  }
};

export const purchaseService = {
  // Ottieni i dettagli di un servizio
  getServiceDetails(serviceId) {
    return SERVICES[serviceId] || null;
  },
  
  // Ottieni tutti i servizi
  getAllServices() {
    return Object.values(SERVICES);
  },
  
  // Ottieni gli acquisti dell'utente
  async getUserPurchases() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Utente non autenticato');
      }
      
      const response = await fetch(`${API_URL}/user-purchases`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nel recupero degli acquisti');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Errore nel recupero degli acquisti:', error);
      throw error;
    }
  },
  
  // Crea una sessione di checkout e reindirizza a Stripe
  async createCheckoutSession(serviceId) {
    try {
      const service = this.getServiceDetails(serviceId);
      if (!service) {
        throw new Error('Servizio non valido');
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Utente non autenticato');
      }
      
      const response = await fetch(`${API_URL}/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          price: service.price
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nella creazione della sessione di checkout');
      }
      
      const { sessionId, url } = await response.json();
      
      // Salva i dati dell'ordine in localStorage per recuperarli dopo il pagamento
      localStorage.setItem('pendingPurchase', JSON.stringify({
        serviceId: service.id,
        sessionId
      }));
      
      // Reindirizza all'URL di checkout di Stripe
      window.location.href = url;
      
      return { success: true };
    } catch (error) {
      console.error('Errore nella creazione della sessione di checkout:', error);
      throw error;
    }
  },
  
  // Verifica lo stato del pagamento
  async checkPaymentStatus(sessionId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Utente non autenticato');
      }
      
      const response = await fetch(`${API_URL}/check-payment/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nella verifica dello stato del pagamento');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Errore nella verifica dello stato del pagamento:', error);
      throw error;
    }
  }
}; 