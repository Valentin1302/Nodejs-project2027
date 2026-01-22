import nodemailer from "nodemailer";

const host = process.env.MAIL_HOST || 'smtp.mailtrap.io';
const port = Number(process.env.MAIL_PORT) || 2525;
const user = process.env.MAIL_USER || undefined;
const pass = process.env.MAIL_PASS || undefined;

const transporter = nodemailer.createTransport({
  host,
  port,
  auth: user && pass ? { user, pass } : undefined
});

export function sendConfirmationEmail(to: string, date: string) {
  // Format date en français
  let formatted = date;
  try {
    const d = new Date(date);
    formatted = d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ' à');
  } catch {}
  return transporter.sendMail({
    from: "no-reply@test.com",
    to,
    subject: "Rendez-vous confirmé",
    text: `Votre paiement a été validé. Votre rendez-vous est confirmé pour la date : ${formatted}.`
  });
}
