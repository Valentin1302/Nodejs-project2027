import { Router, Request, Response } from 'express';
import models from '../models';

const router = Router();
const { Instructor } = models as any;

router.get('/', async (_req: Request, res: Response) => {
  const list = await Instructor.findAll();
  res.json(list);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, bio, latitude, longitude } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const created = await Instructor.create({ name, bio, latitude, longitude });
  res.status(201).json(created);
});

export default router;
