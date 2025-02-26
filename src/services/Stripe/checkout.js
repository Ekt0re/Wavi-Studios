// This is your test secret API key.
const stripe = Stripe("pk_test_51Qt8XMR4ikOicVEGOer2rzTZ7T25YfiemJdd1islusjiDhaJkK1HWUconcFEtkKjnyBAex8uOtx2JGwYkU9tVWO600m0wsgR48");

initialize();

// Create a Checkout Session
async function initialize() {
  const fetchClientSecret = async () => {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}