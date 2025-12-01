// src/routes/payments.ts
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 🔐 Clé secrète Stripe depuis .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

/**
 * 🔹 POST /api/stripe/create-session
 * Crée une session de paiement Stripe Checkout
 */
router.post("/create-session", async (req, res) => {
  try {
    const { courseTitle, categoryName, price, slot, instructor } = req.body;

    if (!courseTitle || !price || !slot || !slot.start || !slot.end) {
      return res.status(400).json({ error: "Paramètres manquants." });
    }

    // Stripe attend le prix en CENTIMES
    const amount = Math.round(price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${courseTitle} – ${categoryName}`,
              description: `Cours avec ${instructor}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3005/payment-success?slotStart=${encodeURIComponent(
        slot.start
      )}&slotEnd=${encodeURIComponent(
        slot.end
      )}&courseTitle=${encodeURIComponent(
        courseTitle
      )}&categoryName=${encodeURIComponent(
        categoryName
      )}&instructor=${encodeURIComponent(instructor)}`,
      cancel_url: "http://localhost:3005/payment-cancel",
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Erreur Stripe:", error);
    res.status(500).json({ error: "Impossible de créer la session Stripe." });
  }
});

/**
 * 🔹 GET /api/stripe/public-key
 * Renvoie la clé publique Stripe au frontend
 */
router.get("/public-key", (_req, res) => {
  res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY });
});

export default router;
