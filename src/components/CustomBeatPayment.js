import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Box, Button, Typography, Card, CardContent, Grid } from '@mui/material';

const stripePromise = loadStripe('pk_test_51Qt8XMR4ikOicVEGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

const CustomBeatPayment = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (productId) => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      
      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerData: {
            email: '', // Verrà richiesto da Stripe durante il checkout
            name: '', // Verrà richiesto da Stripe durante il checkout
            phone: '', // Verrà richiesto da Stripe durante il checkout
          }
        }),
      });

      const session = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Errore durante il pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Beat Custom
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Exclusive
              </Typography>
              <Typography variant="h4" component="p" color="primary" gutterBottom>
                110€
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handlePayment('prod_Rowuq1k6FUef57')}
                disabled={loading}
              >
                {loading ? 'Caricamento...' : 'Acquista Ora'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Exclusive Multitrack
              </Typography>
              <Typography variant="h4" component="p" color="primary" gutterBottom>
                150€
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handlePayment('prod_RowvdDV3wmoaf6')}
                disabled={loading}
              >
                {loading ? 'Caricamento...' : 'Acquista Ora'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomBeatPayment; 