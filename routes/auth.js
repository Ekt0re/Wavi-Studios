const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Opzioni per cookie sicuri
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni in millisecondi
  sameSite: 'strict'
};

// Registrazione
router.post('/register', async (req, res) => {
  try {
    console.log('Richiesta di registrazione ricevuta:', {
      body: req.body,
      headers: req.headers['content-type']
    });

    console.log('Contenuto completo req.body:', JSON.stringify(req.body));
    
    const { name, email, password } = req.body;
    
    console.log('Dati estratti dalla richiesta:', { 
      name: name ? `${name.slice(0,3)}...` : 'mancante', 
      email: email ? `${email.slice(0,3)}...` : 'mancante',
      password: password ? 'presente' : 'mancante'
    });

    // Validazione dei dati
    if (!name || !email || !password) {
      console.log('Validazione fallita: campi mancanti', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ 
        message: 'Tutti i campi sono obbligatori' 
      });
    }

    if (name.length < 3) {
      console.log('Validazione fallita: nome troppo corto', { length: name.length });
      return res.status(400).json({ 
        message: 'Il nome utente deve contenere almeno 3 caratteri' 
      });
    }

    if (password.length < 6) {
      console.log('Validazione fallita: password troppo corta', { length: password.length });
      return res.status(400).json({ 
        message: 'La password deve contenere almeno 6 caratteri' 
      });
    }

    // Verifica se l'utente esiste già
    const existingUser = await User.findOne({ 
      $or: [{ email }, { name }] 
    });

    if (existingUser) {
      console.log('Validazione fallita: utente già esistente', { 
        userFound: true,
        emailMatch: existingUser.email === email,
        nameMatch: existingUser.name === name
      });
      return res.status(400).json({ 
        message: 'Nome o email già in uso' 
      });
    }

    // Validazione finale per garantire che name non sia null
    if (!name) {
      console.log('ERRORE CRITICO: name è null o undefined dopo la validazione');
      return res.status(400).json({ 
        message: 'Nome non può essere vuoto' 
      });
    }

    // Crea nuovo utente
    const user = new User({ name, email, password });
    console.log('Creazione nuovo utente...', { name, email });
    await user.save();
    console.log('Utente creato con successo:', { userId: user._id });

    // Genera token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    console.log('Token JWT generato');

    // Imposta cookie di sessione
    res.cookie('auth_token', token, COOKIE_OPTIONS);
    console.log('Cookie auth_token impostato');

    // Ritorna il token anche nella risposta
    res.status(201).json({
      message: 'Registrazione completata con successo',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
    console.log('Risposta di successo inviata al client');
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({ 
      message: 'Errore durante la registrazione',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validazione dei dati
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email e password sono obbligatori' 
      });
    }

    // Trova l'utente
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Credenziali non valide' 
      });
    }

    // Verifica password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Credenziali non valide' 
      });
    }

    // Genera token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Imposta cookie di sessione
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    // Ritorna token e dati utente
    res.json({
      message: 'Login effettuato con successo',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ 
      message: 'Errore durante il login',
      error: error.message 
    });
  }
});

// Verifica token
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json(user);
  } catch (error) {
    console.error('Errore verifica token:', error);
    res.status(500).json({ 
      message: 'Errore durante la verifica del token',
      error: error.message 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // Cancella il cookie di autenticazione
  res.clearCookie('auth_token');
  res.json({ message: 'Logout effettuato con successo' });
});

module.exports = router; 