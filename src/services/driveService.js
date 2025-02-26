import JSZip from 'jszip';
import { DRIVE_CONFIG } from '../config/drive';

/* global gapi */

export const driveService = {
  async uploadFilesToDrive(files, formData) {
    try {
      // Creo un nuovo oggetto ZIP
      const zip = new JSZip();
      
      // Aggiungo i file allo ZIP
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
      }

      // Creo il nome del file ZIP con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFileName = `${formData.nome}_${timestamp}.zip`;

      // Genero il file ZIP
      const zipContent = await zip.generateAsync({ type: 'blob' });

      // Preparo i metadati del file
      const metadata = new Blob([JSON.stringify({
        name: zipFileName,
        mimeType: 'application/zip',
        parents: [DRIVE_CONFIG.FOLDER_ID]
      })], { type: 'application/json' });

      // Preparo il form data
      const form = new FormData();
      form.append('metadata', metadata);
      form.append('file', zipContent);

      // Effettuo l'upload
      const accessToken = window.gapi.auth.getToken().access_token;
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Errore durante l'upload: ${errorData.error?.message || 'Errore sconosciuto'}`);
      }

      const data = await response.json();
      console.log('File caricato con successo:', data);
      return data.id;

    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      throw error;
    }
  }
}; 