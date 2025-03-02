const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  createPaymentIntent,
  confirmPayment,
  createRefund
} = require("../controllers/paymentController");

// Tutte le rotte dei pagamenti richiedono autenticazione
router.use(auth);

router.post("/create-payment", createPaymentIntent);
router.post("/confirm-payment", confirmPayment);
router.post("/create-refund", createRefund);

module.exports = router; 