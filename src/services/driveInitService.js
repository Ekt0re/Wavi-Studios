import { DRIVE_CONFIG } from '../config/drive';

/* global google */

let isInitializing = false;
let isInitialized = false;

export const initGoogleDrive = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: DRIVE_CONFIG.API_KEY,
            clientId: DRIVE_CONFIG.CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
          });

          // Forzo l'autenticazione
          if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
            await window.gapi.auth2.getAuthInstance().signIn();
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.body.appendChild(script);
  });
}; 