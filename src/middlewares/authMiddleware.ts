import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import models from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = req.headers.cookie || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
    const token = match ? match.split('=')[1] : null;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await models.User.findByPk(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // On attache l’utilisateur à la requête
    (req as any).user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
