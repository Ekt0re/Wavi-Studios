const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const archiver = require('archiver');
const mongoose = require('mongoose');
const stripe = require('stripe')('sk_test_51Qt8XMR4ikOicVEGYBPF0hSvy4AbUGhfwVszXsBwWSXWmfSxz1bwbHQvKsZn2kuYqyyxUndY1Z8U5ekB90UdZ4gD00yvWKTbhy'); // Chiave privata di test
const cookieParser = require('cookie-parser');
require('dotenv').config();
const logger = require('./src/utils/logger');

const app = express();
// Modificata configurazione della porta per compatibilità cross-platform
const PORT = process.env.SERVER_PORT || 3002;

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connesso a MongoDB');
  })
  .catch(err => {
    console.error('Errore di connessione a MongoDB:', err);
  });

// Middleware per il logging delle richieste
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Configurazione CORS più permissiva in sviluppo
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tuo-dominio.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware per i cookie
app.use(cookieParser());

// Middleware per il parsing del body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve i file statici di React in produzione
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Crea le cartelle necessarie se non esistono
const createRequiredDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'temp'),
    path.join(__dirname, 'uploads', 'completed')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createRequiredDirectories();

// Configurazione multer per upload file temporanei
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Estrai sessionId dalla richiesta
    const sessionId = req.body.sessionId || Date.now().toString();
    
    // Definisci il percorso base per gli upload
    const basePath = path.join(__dirname, 'uploads');
    const tempPath = path.join(basePath, 'temp', sessionId);
    
    // Crea le directory se non esistono
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
    if (!fs.existsSync(path.join(basePath, 'temp'))) {
      fs.mkdirSync(path.join(basePath, 'temp'), { recursive: true });
    }
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Funzione per creare un file ZIP
const createZipArchive = async (sourcePath, destPath, filename) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(sourcePath)) {
        console.error('Directory sorgente non trovata:', sourcePath);
        return reject(new Error('Directory sorgente non trovata'));
      }

      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }

      const outputPath = path.join(destPath, filename);
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        console.log('ZIP creato con successo:', outputPath);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('Errore durante la creazione del ZIP:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourcePath, false);
      archive.finalize();
    } catch (error) {
      console.error('Errore durante la creazione del ZIP:', error);
      reject(error);
    }
  });
};

// Funzione per eliminare una cartella e il suo contenuto
const deleteDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

// Endpoint per creare una sessione di checkout
app.post('/create-checkout-session', async (req, res) => {
  console.log('Ricevuta richiesta create-checkout-session');
  try {
    const { productId, customerData } = req.body;
    console.log('Dati ricevuti:', { productId, customerData });

    if (!customerData || !productId) {
      console.log('Dati mancanti:', { customerData, productId });
      return res.status(400).json({ 
        error: 'Dati mancanti: sono richiesti productId e customerData' 
      });
    }

    if (!customerData.email || !customerData.name || !customerData.phone) {
      return res.status(400).json({ 
        error: 'Dati cliente incompleti: email, nome e telefono sono richiesti' 
      });
    }

    // Verifica che il productId sia valido
    const price = getProductPrice(productId);
    if (!price) {
      return res.status(400).json({ 
        error: 'Prodotto non valido' 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product: productId,
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NODE_ENV === 'production' ? 'https://tuo-dominio.com' : 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NODE_ENV === 'production' ? 'https://tuo-dominio.com' : 'http://localhost:3000'}/cancel`,
      customer_email: customerData.email,
      metadata: {
        customerName: customerData.name,
        customerEmail: customerData.email,
        phone: customerData.phone,
        genere: customerData.metadata?.genere || '',
        bpm: customerData.metadata?.bpm || '',
        strumenti: customerData.metadata?.strumenti || '',
        struttura: customerData.metadata?.struttura || '',
        effetti: customerData.metadata?.effetti || '',
        esempi: customerData.metadata?.esempi || '',
        altro: customerData.metadata?.altro || ''
      }
    });

    console.log('Sessione di checkout creata:', {
      sessionId: session.id,
      metadata: session.metadata
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Errore dettagliato:', error);
    
    if (error.type === 'StripeError') {
      return res.status(400).json({ 
        error: 'Errore durante la comunicazione con Stripe: ' + error.message 
      });
    }

    return res.status(500).json({ 
      error: 'Errore interno del server durante la creazione della sessione di pagamento',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint per l'upload dei file
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const { email, sessionId, customerName } = req.body;
    
    if (!email || !sessionId || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }

    // Verifica che il pagamento sia stato effettuato
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Pagamento non completato' });
      }
    } catch (error) {
      console.error('Errore nella verifica del pagamento:', error);
      return res.status(400).json({ error: 'Errore nella verifica del pagamento' });
    }

    // Crea la directory finale
    const finalPath = path.join(__dirname, 'uploads', 'completed', email);
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }

    // Crea il ZIP
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFilename = `${customerName}_${timestamp}.zip`;
    
    // Crea una directory temporanea per questo upload
    const tempPath = path.join(__dirname, 'uploads', 'temp', sessionId);
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    // Crea il ZIP
    await createZipArchive(tempPath, finalPath, zipFilename);

    // Verifica che il file ZIP sia stato creato
    const zipPath = path.join(finalPath, zipFilename);
    if (!fs.existsSync(zipPath)) {
      throw new Error('Errore nella creazione del file ZIP');
    }

    // Pulisci i file temporanei
    deleteDirectory(tempPath);

    res.status(200).json({
      success: true,
      message: 'File caricati con successo',
      zipPath: zipFilename
    });
  } catch (error) {
    console.error('Errore durante l\'upload:', error);
    res.status(500).json({ error: 'Errore durante il caricamento dei file' });
  }
});

// Webhook per gestire gli eventi di Stripe
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('STRIPE_WEBHOOK_SECRET non configurato, utilizzo evento grezzo');
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    console.log('Evento Stripe ricevuto:', event.type);
  } catch (err) {
    console.error('Errore nella verifica del webhook:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Dati sessione completa:', session);
    console.log('Metadata sessione:', session.metadata);

    try {
      // Estrai i dati dalla sessione
      const sessionId = session.metadata?.sessionId;
      const customerEmail = session.customer_email || session.metadata?.customerEmail;
      const customerName = session.metadata?.customerName || 'unknown';

      console.log('Dati estratti:', { sessionId, customerEmail, customerName });

      if (!sessionId || !customerEmail) {
        console.error('Dati mancanti nei metadata:', { sessionId, customerEmail });
        return res.status(400).json({ error: 'Dati mancanti nei metadata' });
      }

      // Percorsi dei file
      const tempPath = path.join(__dirname, 'uploads', 'temp', sessionId);
      const finalPath = path.join(__dirname, 'uploads', 'completed', customerEmail);
      
      console.log('Verifica percorsi:', {
        tempPath,
        finalPath,
        tempExists: fs.existsSync(tempPath),
        finalExists: fs.existsSync(finalPath)
      });

      // Verifica l'esistenza della directory temporanea
      if (!fs.existsSync(tempPath)) {
        console.error('Directory temporanea non trovata:', tempPath);
        return res.status(404).json({ error: 'File temporanei non trovati' });
      }

      // Verifica che ci siano file nella directory temporanea
      const files = fs.readdirSync(tempPath);
      console.log('File trovati nella directory temporanea:', files);
      
      if (files.length === 0) {
        console.error('Nessun file trovato nella directory temporanea');
        return res.status(404).json({ error: 'Nessun file da processare' });
      }

      // Crea la directory finale se non esiste
      if (!fs.existsSync(finalPath)) {
        console.log('Creazione directory finale:', finalPath);
        fs.mkdirSync(finalPath, { recursive: true });
      }

      // Crea il file ZIP
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFilename = `${customerName}_${timestamp}.zip`;
      console.log('Creazione ZIP:', zipFilename);

      await createZipArchive(tempPath, finalPath, zipFilename);

      // Verifica che il file ZIP sia stato creato
      const zipPath = path.join(finalPath, zipFilename);
      if (!fs.existsSync(zipPath)) {
        console.error('File ZIP non creato:', zipPath);
        return res.status(500).json({ error: 'Errore nella creazione del file ZIP' });
      }

      console.log('File ZIP creato con successo:', zipPath);

      // Pulisci i file temporanei
      console.log('Pulizia file temporanei:', tempPath);
      deleteDirectory(tempPath);

      console.log('Elaborazione completata con successo');
      return res.json({ received: true, success: true });
    } catch (error) {
      console.error('Errore durante l\'elaborazione del webhook:', error);
      return res.status(500).json({ 
        error: 'Errore interno del server',
        details: error.message 
      });
    }
  }

  return res.json({ received: true });
});

// Funzione per ottenere il prezzo del prodotto
function getProductPrice(productId) {
  const prices = {
    'prod_Rowuq1k6FUef57': 110, // Exclusive
    'prod_RowvdDV3wmoaf6': 150, // Exclusive multitrack
    'prod_RohoBaCK6fjHPW': 30, // Solo Mix del Beat
    'prod_RohnguXrhSiAct': 20, // Solo Master
    'prod_Rna6aJau8sfFpw': 45, // Mix e Master
    'prod_RohmabUFRP7GGy': 35  // Mix Voce + Master
  };
  return prices[productId] || 0;
}

// Endpoint per i pagamenti (simulato)
app.post('/checkout', (req, res) => {
    const { email, amount } = req.body;
    if (!email || !amount) {
        return res.status(400).json({ error: 'Dati mancanti per il pagamento' });
    }

    // Simulazione del pagamento
    console.log(`Pagamento ricevuto da ${email} di €${amount}`);
    res.status(200).json({ message: 'Pagamento effettuato con successo' });
});

// Endpoint per health check
app.get('/api/health-check', (req, res) => {
  try {
    // Verifica la connessione al database
    const isDbConnected = mongoose.connection.readyState === 1;
    
    return res.status(200).json({
      status: 'ok',
      message: 'Server funzionante',
      dbConnected: isDbConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Errore nell\'health check:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Errore nell\'health check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Importa le rotte
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./src/routes/paymentRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

// Usa le rotte
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/purchases', purchaseRoutes);

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  // Log dell'errore
  logger.error('Errore del server:', err);
  
  // Determina codice di stato HTTP
  const statusCode = err.statusCode || 500;
  
  // Prepara il messaggio di errore
  const errorResponse = {
    status: 'error',
    message: err.message || 'Errore interno del server',
  };
  
  // Aggiungi dettagli solo in ambiente di sviluppo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || null;
  }
  
  // Invia risposta al client
  res.status(statusCode).json(errorResponse);
});

// Avvio server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
