import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRouter } from 'next-connect';

// Configuro multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'User_Uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${timestamp}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB
  }
});

// Configuro il router
const apiRoute = createRouter();

// Middleware per gestire gli errori
apiRoute.use(async (req, res, next) => {
  console.log('Richiesta ricevuta:', req.method);
  try {
    await next();
  } catch (error) {
    console.error('Errore nel middleware:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Gestisco il POST
apiRoute.post(upload.array('files', 10), async (req, res) => {
  console.log('Richiesta POST ricevuta');
  console.log('Files:', req.files);
  console.log('Body:', req.body);

  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    // Creo una cartella per l'utente
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const userDir = path.join(process.cwd(), 'User_Uploads', `${req.body.nome}_${timestamp}`);
    fs.mkdirSync(userDir, { recursive: true });

    // Sposto i file nella cartella dell'utente
    const fileInfos = files.map(file => {
      const newPath = path.join(userDir, file.originalname);
      fs.renameSync(file.path, newPath);
      return {
        originalName: file.originalname,
        size: file.size,
        path: newPath
      };
    });

    // Salvo i dati dell'utente
    const userData = {
      nome: req.body.nome,
      email: req.body.email,
      numero: req.body.numero,
      servizio: req.body.servizio,
      uploadDate: new Date().toISOString(),
      files: fileInfos
    };

    const userDataPath = path.join(userDir, 'info.json');
    fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));

    console.log('Upload completato con successo');
    res.status(200).json({
      success: true,
      message: 'Files caricati con successo',
      directory: userDir,
      files: fileInfos
    });
  } catch (error) {
    console.error('Errore durante l\'upload:', error);
    res.status(500).json({ error: 'Errore durante il caricamento dei file' });
  }
});

// Configuro il body parser
export const config = {
  api: {
    bodyParser: false
  }
};

export default apiRoute; 