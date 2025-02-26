import { CALENDLY_CONFIG } from '../config/calendly';

const headers = {
  'Authorization': `Bearer ${CALENDLY_CONFIG.API_KEY}`,
  'Content-Type': 'application/json'
};

export const calendlyService = {
  // Ottieni gli eventi programmati
  getScheduledEvents: async () => {
    try {
      const response = await fetch(`${CALENDLY_CONFIG.EVENTS_URL}?user=${CALENDLY_CONFIG.USER_UUID}`, {
        method: 'GET',
        headers
      });
      return await response.json();
    } catch (error) {
      console.error('Errore nel recupero degli eventi:', error);
      throw error;
    }
  },

  // Ottieni i dettagli di un evento specifico
  getEventDetails: async (eventId) => {
    try {
      const response = await fetch(`${CALENDLY_CONFIG.EVENTS_URL}/${eventId}`, {
        method: 'GET',
        headers
      });
      return await response.json();
    } catch (error) {
      console.error('Errore nel recupero dei dettagli evento:', error);
      throw error;
    }
  },

  // Ottieni gli slot disponibili per un tipo di evento
  getAvailableSlots: async (eventTypeUrl, startTime, endTime) => {
    try {
      const response = await fetch(`${eventTypeUrl}/available_times?start_time=${startTime}&end_time=${endTime}`, {
        method: 'GET',
        headers
      });
      return await response.json();
    } catch (error) {
      console.error('Errore nel recupero degli slot disponibili:', error);
      throw error;
    }
  }
}; 