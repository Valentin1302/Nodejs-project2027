import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 🔹 Chemins vers les fichiers sensibles (gitignored)
const credentialsPath = path.resolve(__dirname, '../config/google-credentials.json');
const tokenPath = path.resolve(__dirname, '../config/token.json');

// 🔹 Charger les credentials Google OAuth
if (!fs.existsSync(credentialsPath)) {
  throw new Error("⚠️ Le fichier google-credentials.json est introuvable !");
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const { client_id, client_secret, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// 🔹 Charger le token si existant
if (fs.existsSync(tokenPath)) {
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  oAuth2Client.setCredentials(token);
  console.log("✅ Token Google chargé :", oAuth2Client.credentials);
} else {
  console.warn("⚠️ Aucun token trouvé, lance d'abord /auth pour générer le token.");
}

// 🔹 GET /availability
router.get('/availability', async (_req: Request, res: Response) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 30);

    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const busyEvents = events.data.items || [];
    const freeSlots: { start: string; end: string }[] = [];
    const slotDuration = 30 * 60 * 1000; // 30 min

    for (let day = new Date(now); day < end; day.setDate(day.getDate() + 1)) {
      const currentDay = new Date(day);
      for (let hour = 9; hour < 18; hour++) {
        const slotStart = new Date(currentDay);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + slotDuration);

        const isFree = !busyEvents.some(e => {
          const eStart = new Date(e.start?.dateTime || e.start?.date);
          const eEnd = new Date(e.end?.dateTime || e.end?.date);
          return slotStart < eEnd && slotEnd > eStart;
        });

        if (isFree) freeSlots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
      }
    }

    console.log(`📅 ${freeSlots.length} créneaux libres générés sur 30 jours`);
    res.json(freeSlots);
  } catch (error) {
    console.error('Erreur Google Calendar:', error);
    res.status(500).json({ error: 'Impossible de récupérer les disponibilités.' });
  }
});

// 🔹 POST /book
router.post('/book', async (req: Request, res: Response) => {
  try {
    const { instructor, slot, courseTitle, categoryName } = req.body;

    if (!instructor || !slot?.start || !slot?.end || !courseTitle || !categoryName) {
      return res.status(400).json({ error: 'Paramètres manquants.' });
    }

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const event = {
      summary: `${courseTitle} (${categoryName}) – avec ${instructor}`,
      description: `Cours : ${courseTitle}\nCatégorie : ${categoryName}\nInstructeur : ${instructor}\nRéservé via la plateforme.`,
      start: { dateTime: slot.start },
      end: { dateTime: slot.end },
    };

    const created = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log(`✅ Événement créé : ${created.data.htmlLink}`);
    res.json({ success: true, link: created.data.htmlLink });
  } catch (error) {
    console.error('Erreur création rendez-vous:', error);
    res.status(500).json({ error: 'Impossible de réserver le rendez-vous.' });
  }
});

// 🔹 GET /auth : flux OAuth
router.get('/auth', (_req: Request, res: Response) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
  console.log("🔗 Redirection vers l'URL OAuth :", authUrl);
  res.redirect(authUrl);
});

// 🔹 GET /oauth2callback : callback OAuth
router.get('/oauth2callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
    console.log("✅ Token Google enregistré !");

    res.send('✅ Authentification réussie ! Vous pouvez fermer cette page et revenir à votre application.');
  } catch (err) {
    console.error("❌ Erreur pendant le callback OAuth:", err);
    res.status(500).send('Erreur pendant l’authentification.');
  }
});

export default router;
