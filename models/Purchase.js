const mongoose = require('mongoose');

// Evitiamo la ricompilazione del modello se già esiste
const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentIntentId: {
    type: String
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true }));

module.exports = Purchase; 