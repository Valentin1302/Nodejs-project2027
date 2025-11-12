// routes/courses.ts
import express, { Request, Response } from 'express';
import models from '../models';
import { Op } from 'sequelize';

const router = express.Router();

// 🔹 GET /api/courses : liste tous les cours ou filtre par catégorie
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query; // ?category=Informatique

    const whereClause: any = {};

    if (category) {
      // Si on cherche par nom de catégorie
      whereClause.categoryName = { [Op.like]: `%${category}%` };
    }

    const courses = await models.Course.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
    });

    return res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ error: 'Could not fetch courses' });
  }
});

export default router;
