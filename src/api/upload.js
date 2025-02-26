//import { Readable } from 'stream';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuro multer per il salvataggio dei file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'User_Uploads');
    console.log('Directory di upload:', uploadDir);
    console.log('La directory esiste?', fs.existsSync(uploadDir));
    
    // Creo la directory se non esiste
    if (!fs.existsSync(uploadDir)) {
      try {
        console.log('Tentativo di creazione directory...');
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
        console.log('Directory creata con successo');
        
        // Su Windows, imposto i permessi dopo la creazione
        if (process.platform === 'win32') {
          console.log('Sistema Windows rilevato, imposto i permessi...');
          fs.chmodSync(uploadDir, 0o777);
          console.log('Permessi impostati con successo');
        }
      } catch (error) {
        console.error('Errore nella creazione della directory:', error);
        console.error('Stack trace:', error.stack);
        return cb(new Error('Impossibile creare la directory di upload'));
      }
    }
    
    // Verifica i permessi dopo la creazione
    try {
      const stats = fs.statSync(uploadDir);
      console.log('Permessi directory:', stats.mode.toString(8));
    } catch (error) {
      console.error('Errore nella lettura dei permessi:', error);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${file.originalname}`;
    console.log('Nome file generato:', fileName);
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB
  }
});

export default async function handler(req, res) {
  console.log('Richiesta ricevuta:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('Errore durante l\'upload:', err);
        console.error('Stack trace:', err.stack);
        return res.status(400).json({ error: err.message });
      }

      const file = req.file;
      console.log('File ricevuto:', file ? {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        path: file.path
      } : 'Nessun file');

      if (!file) {
        return res.status(400).json({ error: 'Nessun file caricato' });
      }

      try {
        const userData = {
          nome: req.body.nome,
          email: req.body.email,
          numero: req.body.numero,
          servizio: req.body.servizio,
          fileName: file.originalname,
          uploadDate: new Date().toISOString(),
          filePath: file.path
        };
        console.log('Dati utente da salvare:', userData);

        const userDataPath = path.join(process.cwd(), 'User_Uploads', `${req.body.nome}_info.json`);
        console.log('Percorso file JSON:', userDataPath);

        fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2), { mode: 0o666 });
        console.log('File JSON salvato con successo');

        res.status(200).json({
          message: 'File caricato con successo',
          path: file.path
        });
      } catch (error) {
        console.error('Errore durante il salvataggio dei dati:', error);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({ error: 'Errore durante il salvataggio dei dati utente' });
      }
    });
  } catch (error) {
    console.error('Errore durante il salvataggio del file:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Errore durante il salvataggio del file' });
  }
} 