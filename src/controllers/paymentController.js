const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "eur" } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converti in centesimi
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({
      message: "Errore nella creazione del pagamento",
      error: error.message
    });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Qui puoi aggiungere la logica per aggiornare il tuo database
      res.json({
        success: true,
        message: "Pagamento confermato con successo"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Pagamento non completato",
        status: paymentIntent.status
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore nella conferma del pagamento",
      error: error.message
    });
  }
};

exports.createRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined
    });

    res.json({
      success: true,
      message: "Rimborso creato con successo",
      refund
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore nella creazione del rimborso",
      error: error.message
    });
  }
}; 