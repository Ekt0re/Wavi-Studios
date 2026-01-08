const Purchase = require('../models/Purchase');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Ottieni tutti gli acquisti di un utente
exports.getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }
    
    const purchases = await Purchase.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Errore nel recupero degli acquisti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli acquisti',
      error: error.message
    });
  }
};

// Crea una sessione di checkout per un servizio
exports.createCheckoutSession = async (req, res) => {
  try {
    const { serviceId, serviceName, price } = req.body;
    const userId = req.user.userId;
    
    if (!userId || !serviceId || !serviceName || !price) {
      return res.status(400).json({
        success: false,
        message: 'Dati mancanti per la creazione del checkout'
      });
    }
    
    // Ottieni l'utente
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }
    
    // Crea la sessione di checkout con Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: serviceName,
          },
          unit_amount: Math.round(price * 100), // Converte in centesimi per Stripe
        },
        quantity: 1,
      }],
      metadata: {
        userId: userId.toString(),
        serviceId,
        serviceName
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });
    
    // Salva l'acquisto come 'pending'
    const newPurchase = new Purchase({
      userId,
      serviceId,
      serviceName,
      price,
      status: 'pending',
      paymentIntentId: session.payment_intent
    });
    
    await newPurchase.save();
    
    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Errore nella creazione della sessione di checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione della sessione di checkout',
      error: error.message
    });
  }
};

// Webhook per gestire gli eventi di Stripe
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Errore nella verifica della firma webhook:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Gestisci gli eventi di pagamento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Aggiorna lo stato dell'acquisto
      await Purchase.findOneAndUpdate(
        { paymentIntentId: session.payment_intent },
        { 
          status: 'completed',
          metadata: {
            paymentId: session.id,
            paymentStatus: session.payment_status,
            customerEmail: session.customer_details?.email
          }
        }
      );
      
      console.log('Acquisto completato con successo:', session.id);
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'acquisto:', error);
    }
  }
  
  res.status(200).json({ received: true });
};

// Verifica lo stato di un pagamento
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'ID sessione mancante'
      });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.status(200).json({
      success: true,
      status: session.payment_status,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Errore nella verifica dello stato del pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella verifica dello stato del pagamento',
      error: error.message
    });
  }
}; 