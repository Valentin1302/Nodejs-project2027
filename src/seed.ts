import models from './models';

async function seed() {
  const { sequelize, Category, Instructor, Course } = models as any;
  await sequelize.sync();

  // Create categories
  const cat1 = await Category.create({ name: 'CSS', description: 'Cascading Style Sheets' });
  const cat2 = await Category.create({ name: 'JavaScript', description: 'JS courses' });

  // Create instructors with lat/lng
  const instr1 = await Instructor.create({ name: 'Alice Martin', bio: 'Front-end coach', latitude: 48.8566, longitude: 2.3522 });
  const instr2 = await Instructor.create({ name: 'Bob Durant', bio: 'Fullstack trainer', latitude: 48.8560, longitude: 2.2950 });

  // Create courses
  await Course.create({ title: 'CSS Grid masterclass', description: 'Learn CSS Grid', categoryId: cat1.id, instructorId: instr1.id, price: 30 });
  await Course.create({ title: 'Async JS deep dive', description: 'Promises, async/await', categoryId: cat2.id, instructorId: instr2.id, price: 40 });

  console.log('Seed completed');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error', err);
  process.exit(1);
});
