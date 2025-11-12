// routes/courses.ts
import express, { Request, Response } from 'express';
import models from '../models';
import { Op } from 'sequelize';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// 🔹 GET /api/courses : liste ou filtre par catégorie
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query; // Exemple : ?category=Math

    const whereClause: any = {};
    if (category) {
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

// 🔹 GET /api/courses/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err);
    return res.status(500).json({ error: 'Could not fetch course' });
  }
});

// 🔹 POST /api/courses
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, categoryName, instructorName, price } = req.body;

    if (!title || !categoryName || !instructorName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = await models.Course.create({
      title,
      description,
      categoryName,
      instructorName,
      price,
    });

    return res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err);
    return res.status(500).json({ error: 'Could not create course' });
  }
});

// 🔹 PUT /api/courses/:id
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, categoryName, instructorName, price } = req.body;
    const course = await models.Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.update({ title, description, categoryName, instructorName, price });

    return res.json(course);
  } catch (err) {
    console.error('Error updating course:', err);
    return res.status(500).json({ error: 'Could not update course' });
  }
});

// 🔹 DELETE /api/courses/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.destroy();
    return res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Error deleting course:', err);
    return res.status(500).json({ error: 'Could not delete course' });
  }
});

export default router;
