import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import models from '../models';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string) {
  const h = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return h === hash;
}

// Register
// When this router is mounted under /auth in app.ts, the final path will be /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await models.User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const { salt, hash } = hashPassword(password);
    const created = await models.User.create({ name, email, passwordHash: hash, salt });
    return res.status(201).json({ id: created.id, name: created.name, email: created.email });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Could not register' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await models.User.findOne({ where: { email } });
    if (!user || !user.salt || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    if (!verifyPassword(password, user.salt, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    // set token as httpOnly cookie
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Could not login' });
  }
});

// Logout
router.post('/logout', (_: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ ok: true });
});

// Me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const cookie = req.headers.cookie || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
    const token = match ? match.split('=')[1] : null;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await models.User.findByPk(payload.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Could not fetch user' });
  }
});

export default router;
