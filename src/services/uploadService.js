export const uploadService = {
  async uploadFiles(formData) {
    try {
      console.log('Invio richiesta di upload con sessionId:', formData.get('sessionId'));
      
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Errore risposta server:', errorData);
        throw new Error(errorData || 'Errore durante il caricamento dei file');
      }

      const result = await response.json();
      console.log('Upload completato:', result);
      
      return result;
    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      throw error;
    }
  }
};
