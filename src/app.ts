

import express, { Application, Request, Response } from 'express';
import path from 'node:path';
import models from './models';
import categoriesRouter from './routes/categories';
import instructorsRouter from './routes/instructors';
import coursesRouter from './routes/courses';
import authRouter from './routes/auth';

export const app: Application = express();
const PORT: number = 3005;


app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public', 'views')));

// Initialize SQLite + Sequelize and sync models
const inTest = process.env.NODE_ENV === 'test';
const { sequelize } = models;
// Use `alter: true` so Sequelize will modify existing tables to match models
// (adds missing columns like `passwordHash` during development).
// In production you may prefer migrations instead of `alter`.
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

// Mount API routes
// Mount auth routes under /auth so frontend and API paths match
app.use('/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/instructors', instructorsRouter);
app.use('/api/courses', coursesRouter);

