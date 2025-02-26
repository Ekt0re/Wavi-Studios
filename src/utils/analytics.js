// Funzione per inviare eventi a Google Analytics
export const sendGAEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Eventi predefiniti
export const GA_EVENTS = {
  // Eventi di navigazione
  PAGE_VIEW: 'page_view',
  
  // Eventi dei servizi
  SERVICE_VIEW: 'service_view',
  SERVICE_SELECTION: 'service_selection',
  
  // Eventi del form
  FORM_START: 'form_start',
  FORM_STEP_COMPLETE: 'form_step_complete',
  FORM_SUBMISSION: 'form_submission',
  
  // Eventi di interazione
  BUTTON_CLICK: 'button_click',
  FILE_UPLOAD: 'file_upload',
  
  // Eventi di prenotazione
  BOOKING_START: 'booking_start',
  BOOKING_COMPLETE: 'booking_complete',
  
  // Eventi di pagamento
  PAYMENT_START: 'payment_start',
  PAYMENT_COMPLETE: 'payment_complete',
  
  // Eventi di errore
  ERROR_OCCURRED: 'error_occurred'
}; 