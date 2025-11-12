// public/js/edit-course.js

// 🔹 Récupère l’ID depuis l’URL
const params = new URLSearchParams(window.location.search);
const courseId = params.get('id');

// 🔹 Bouton retour
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '/views/index.html';
});

// 🔹 Charger le cours existant
async function loadCourse() {
  try {
    const res = await fetch(`/api/courses/${courseId}`);
    if (!res.ok) throw new Error('Erreur API /api/courses');
    const course = await res.json();

    document.getElementById('title').value = course.title;
    document.getElementById('description').value = course.description || '';
    document.getElementById('categoryName').value = course.categoryName || '';
    document.getElementById('instructorName').value = course.instructorName || '';
    document.getElementById('price').value = course.price || '';
  } catch (err) {
    console.error('Erreur lors du chargement du cours :', err);
    alert('Impossible de charger le cours.');
    window.location.href = '/views/index.html';
  }
}

// 🔹 Soumission du formulaire de modification
document.getElementById('editCourseForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    categoryName: document.getElementById('categoryName').value,
    instructorName: document.getElementById('instructorName').value,
    price: parseFloat(document.getElementById('price').value)
  };

  const res = await fetch(`/api/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    alert('Cours mis à jour avec succès ✅');
    window.location.href = '/views/index.html';
  } else {
    const err = await res.json();
    alert('Erreur : ' + (err.error || 'Impossible de modifier le cours.'));
  }
});

// 🔹 Initialisation
loadCourse();
