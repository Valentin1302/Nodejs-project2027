

import express, { Application, Request, Response } from 'express';
import models from './models';

export const app: Application = express();
const PORT: number = 3005;

// Parse JSON bodies
app.use(express.json());

// Initialize SQLite + Sequelize and sync models
const inTest = process.env.NODE_ENV === 'test';
const { sequelize } = models;
sequelize.sync().then(() => {
  console.log('Database synchronized');
}).catch((err) => {
  console.error('Database sync error:', err);
});

app.get('/', (_: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.post('/animals', async (req: Request, res: Response) => {
  console.info('Received animal creation request:', req.body);
  const created = await models.Animal.create(req.body);
  res.status(201).json({ created });
});

// Only start server when not under test
if (!inTest) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

