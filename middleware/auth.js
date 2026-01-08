const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Ottieni il token dall'header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Autenticazione richiesta' });
    }

    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Trova l'utente
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error();
    }

    // Aggiungi l'utente alla richiesta
    req.user = { userId: user._id, email: user.email };
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token non valido' });
  }
};

module.exports = { auth }; 