import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51Qt8XMR4ikOicVEGOer2rzTZ7T25YfiemJdd1islusjiDhaJkK1HWUconcFEtkKjnyBAex8uOtx2JGwYkU9tVWO600m0wsgR48');

const SERVICES = {
  'solo-mix': {
    id: 'prod_RohoBaCK6fjHPW',
    name: 'Solo Mix del Beat',
    price: 30
  },
  'solo-master': {
    id: 'prod_RohnguXrhSiAct',
    name: 'Solo Master',
    price: 20
  },
  'mix-master': {
    id: 'prod_Rna6aJau8sfFpw',
    name: 'Mix e Master',
    price: 45
  },
  'mix-voice': {
    id: 'prod_RohmabUFRP7GGy',
    name: 'Mix Voce + Master',
    price: 35
  }
};

export const stripeService = {
  // Inizializza Stripe
  getStripe() {
    return stripePromise;
  },

  getServiceName(serviceId) {
    return SERVICES[serviceId]?.name || 'Servizio non specificato';
  },

  // Crea una sessione di checkout
  async createCheckoutSession(serviceId, formData) {
    try {
      const service = SERVICES[serviceId];
      if (!service) {
        throw new Error('Servizio non valido');
      }

      const response = await fetch('http://localhost:3001/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: service.id,
          customerData: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          serviceName: service.name,
          serviceType: serviceId,
          price: service.price
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella creazione della sessione di pagamento');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Errore nel processo di checkout:', error);
      throw error;
    }
  },

  // Reindirizza al checkout
  async redirectToCheckout(sessionId) {
    try {
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Errore durante il redirect al checkout:', error);
      window.location.href = '/cancel';
    }
  },

  // Verifica lo stato del pagamento
  async checkPaymentStatus(sessionId) {
    try {
      const response = await fetch(`http://localhost:3001/check-payment/${sessionId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella verifica del pagamento');
      }
      return await response.json();
    } catch (error) {
      console.error('Errore nella verifica del pagamento:', error);
      throw error;
    }
  },

  // Gestisce il completamento del pagamento
  async handlePaymentCompletion(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('ID sessione non valido');
      }

      const paymentStatus = await this.checkPaymentStatus(sessionId);
      
      if (paymentStatus.status === 'complete' || paymentStatus.status === 'paid') {
        // Recupera i dati dell'ordine
        const orderData = JSON.parse(localStorage.getItem('orderData') || '{}');
        
        const result = {
          success: true,
          customerEmail: paymentStatus.customerEmail,
          metadata: {
            ...paymentStatus.metadata,
            serviceName: orderData.serviceName
          },
          orderData: {
            ...orderData,
            paymentStatus: paymentStatus.status,
            paymentDate: new Date().toISOString()
          }
        };

        // Pulisci i dati dell'ordine
        localStorage.removeItem('orderData');

        return result;
      } else {
        throw new Error('Stato del pagamento non valido');
      }
    } catch (error) {
      console.error('Errore nella gestione del completamento del pagamento:', error);
      window.location.href = '/cancel';
      throw error;
    }
  },

  // Ottieni il prezzo del prodotto
  getProductPrice(productId) {
    const service = Object.values(SERVICES).find(s => s.id === productId);
    return service?.price || 0;
  }
}; 