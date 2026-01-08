const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const purchaseController = require('../controllers/purchaseController');

// Rotta per ottenere gli acquisti dell'utente
router.get('/user-purchases', auth, purchaseController.getUserPurchases);

// Rotta per creare una sessione di checkout
router.post('/create-checkout', auth, purchaseController.createCheckoutSession);

// Rotta per verificare lo stato di un pagamento
router.get('/check-payment/:sessionId', auth, purchaseController.checkPaymentStatus);

// Webhook per gli eventi di Stripe (non richiede autenticazione)
router.post('/webhook', express.raw({type: 'application/json'}), purchaseController.handleStripeWebhook);

module.exports = router; 