const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Registrazione
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verifica se l'utente esiste già
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username o email già in uso' 
      });
    }

    // Crea nuovo utente
    const user = new User({ username, email, password });
    await user.save();

    // Genera token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registrazione completata con successo',
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Errore durante la registrazione',
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

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
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login effettuato con successo',
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Errore durante il login',
      error: error.message 
    });
  }
});

// Ottieni profilo utente
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Errore nel recupero del profilo',
      error: error.message 
    });
  }
});

module.exports = router; 