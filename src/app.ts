import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import path from 'node:path';
import models from './models';
import categoriesRouter from './routes/categories';
import instructorsRouter from './routes/instructors';
import coursesRouter from './routes/courses';
import authRouter from './routes/auth';
import calendarRoutes from './routes/calendar';
import paymentRouter from './routes/payments';
import { sendConfirmationEmail } from "./utils/mailer";


export const app: Application = express();
const PORT: number = 3005;


app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/instructors', instructorsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/calendar', calendarRoutes);
app.use('/api/stripe', paymentRouter);

const inTest = process.env.NODE_ENV === 'test';
const { sequelize } = models;

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log('Database synchronized');
    // Create a SQL view combining courses, categories and instructors
    try {
      await sequelize.query(
        `CREATE VIEW IF NOT EXISTS course_list AS
         SELECT
           courses.id AS courseId,
           courses.title AS courseTitle,
           categories.name AS categoryName,
           instructors.name AS instructorName
         FROM courses
         LEFT JOIN categories ON courses.categoryId = categories.id
         LEFT JOIN instructors ON courses.instructorId = instructors.id;`
      );
      console.log('View "course_list" ensured');
    } catch (err) {
      console.error('Could not create view course_list:', err);
    }
  })
  .catch((err) => {
    console.error('Database sync error:', err);
  });

app.get('/', (_: Request, res: Response) => {
  // Serve the main app (home) at root
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Endpoint to read the SQL view combining courses/categories/instructors
app.get('/api/course-list', async (_: Request, res: Response) => {
  try {
    const [results] = await sequelize.query('SELECT * FROM course_list;');
    return res.json({ data: results });
  } catch (err) {
    console.error('Error querying course_list view:', err);
    return res.status(500).json({ error: 'Could not read course list' });
  }
});

// Only start server when not under test
if (!inTest) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

app.get('/payment-success', async (req: Request, res: Response) => {
  const { slotStart, slotEnd, instructor, courseTitle, categoryName } = req.query;

  if (!slotStart || !slotEnd || !instructor || !courseTitle || !categoryName) {
    return res.status(400).send(`<h2>Paramètres manquants pour confirmer le rendez-vous</h2>`);
  }

  try {
    const response = await fetch('http://localhost:3005/api/calendar/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot: { start: slotStart, end: slotEnd },
        instructor,
        courseTitle,
        categoryName
      })
    });

    const result = await response.json();

    if (!result.success) {
      return res.send(`
        <h2>Paiement OK mais impossible de créer le rendez-vous</h2>
        <p>${result.error || 'Erreur inconnue.'}</p>
        <button onclick="window.location.href='/'" style="padding:10px 20px; font-size:16px; cursor:pointer;">
          Retour à l'accueil
        </button>
      `);
    }

    // Si succès: on tente d'envoyer l'email puis on affiche une seule réponse indiquant
    // que le rendez-vous est confirmé et qu'un email va/ a été envoyé (Mailtrap selon consigne).
    let emailStatus = 'Un email de confirmation va être envoyé (vous recevrez le mail via Mailtrap).';
    try {
      await sendConfirmationEmail("etudiant@test.com", String(slotStart));
      emailStatus = 'Un email de confirmation a été envoyé (Mailtrap).';
    } catch (err) {
      console.error('Erreur envoi email:', err);
      emailStatus = 'Impossible d\'envoyer l\'email de confirmation pour le moment.';
    }

    return res.send(`
      <h2>Paiement et rendez-vous confirmés !</h2>
      <p>Votre rendez-vous pour <strong>${courseTitle} (${categoryName})</strong> avec <strong>${instructor}</strong> est ajouté au calendrier.</p>
      <p>${emailStatus}</p>
      <button onclick="window.location.href='/'" style="padding:10px 20px; font-size:16px; cursor:pointer;">
        Retour à l'accueil
      </button>
    `);
  } catch (err) {
    console.error('Erreur lors de la réservation après paiement:', err);
    return res.send(`
      <h2>Une erreur est survenue lors de la réservation du rendez-vous</h2>
      <button onclick="window.location.href='/'" style="padding:10px 20px; font-size:16px; cursor:pointer;">
        Retour à l'accueil
      </button>
    `);
  }
});


