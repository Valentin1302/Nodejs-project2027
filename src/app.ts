

import express, { Application, Request, Response } from 'express';
import path from 'node:path';
import models from './models';
import categoriesRouter from './routes/categories';
import instructorsRouter from './routes/instructors';
import coursesRouter from './routes/courses';

export const app: Application = express();
const PORT: number = 3005;

// Parse JSON bodies
app.use(express.json());

// Serve static files from src/public (useful for frontend demo assets)
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite + Sequelize and sync models
const inTest = process.env.NODE_ENV === 'test';
const { sequelize } = models;
sequelize
  .sync()
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
  // Serve the SPA entrypoint
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// Minimal animals endpoint used by tests
app.post('/animals', (req: Request, res: Response) => {
  const { name, description, price, number } = req.body || {};
  const created = {
    type: name,
    size: description,
    genre: price,
    age: number,
  };
  return res.status(201).json({ created });
});

// Only start server when not under test
if (!inTest) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Mount API routes
app.use('/api/categories', categoriesRouter);
app.use('/api/instructors', instructorsRouter);
app.use('/api/courses', coursesRouter);

