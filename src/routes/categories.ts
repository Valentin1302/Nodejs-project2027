import { Router, Request, Response } from 'express';
import models from '../models';

const router = Router();
const { Category } = models as any;

router.get('/', async (_req: Request, res: Response) => {
  const list = await Category.findAll();
  res.json(list);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const created = await Category.create({ name, description });
  res.status(201).json(created);
});

export default router;
