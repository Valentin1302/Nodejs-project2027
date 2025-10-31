import { Router, Request, Response } from 'express';
import models from '../models';

const router = Router();
const { Course, Instructor } = models as any;

// List all courses (basic)
router.get('/', async (_req: Request, res: Response) => {
  const list = await Course.findAll();
  res.json(list);
});

// Create course
router.post('/', async (req: Request, res: Response) => {
  const { title, description, categoryId, instructorId, price } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const created = await Course.create({ title, description, categoryId, instructorId, price });
  res.status(201).json(created);
});

// Nearby search: returns courses whose instructor is within radius (km) of provided lat/lng
router.get('/nearby', async (req: Request, res: Response) => {
  const latQ = req.query.lat as string | undefined;
  const lngQ = req.query.lng as string | undefined;
  const radiusQ = req.query.radius as string | undefined;

  if (!latQ || !lngQ) return res.status(400).json({ error: 'lat and lng query params are required' });
  const lat = parseFloat(latQ);
  const lng = parseFloat(lngQ);
  const radiusKm = radiusQ ? parseFloat(radiusQ) : 5;
  if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusKm)) {
    return res.status(400).json({ error: 'lat, lng and radius must be numbers' });
  }

  // Fetch courses with included instructor data
  const courses = await Course.findAll({ include: [{ model: Instructor, as: 'instructor' }] });

  // Haversine formula
  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const results = [] as any[];
  for (const c of courses) {
    const instr = (c as any).instructor;
    if (!instr || instr.latitude == null || instr.longitude == null) continue;
    const dist = haversineKm(lat, lng, Number(instr.latitude), Number(instr.longitude));
    if (dist <= radiusKm) {
      results.push({
        courseId: c.id,
        courseTitle: c.title,
        categoryId: c.categoryId,
        instructorId: instr.id,
        instructorName: instr.name,
        distanceKm: Number(dist.toFixed(3)),
      });
    }
  }

  // sort by distance
  results.sort((a, b) => a.distanceKm - b.distanceKm);
  res.json({ data: results });
});

export default router;
