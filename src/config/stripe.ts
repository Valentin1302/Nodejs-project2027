import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_xxx';
export const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-10-29.clover' });
