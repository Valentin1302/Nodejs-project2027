// Récupérer la clé publique Stripe
async function getStripePublicKey() {
  const res = await fetch("/api/stripe/public-key");
  return res.json();
}
