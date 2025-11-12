let editingCourseId = null;

// 🔹 Charger l'utilisateur
async function fetchUser() {
  const res = await fetch('/auth/me');
  if (res.ok) {
    const user = await res.json();
    document.getElementById('username').textContent = `Connecté : ${user.name}`;
    loadCourses(); // Charger la liste des cours
  } else {
    window.location.href = '/views/login.html';
  }
}

// 🔹 Déconnexion
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' });
  window.location.href = '/views/login.html';
});

// 🔹 Ouvrir le formulaire Ajouter
document.getElementById('addCourseBtn').addEventListener('click', () => {
  document.getElementById('formTitle').textContent = 'Ajouter un cours';
  document.getElementById('courseForm').reset();
  editingCourseId = null;
  document.getElementById('courseFormSection').classList.remove('hidden');
});

// 🔹 Annuler le formulaire
document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('courseFormSection').classList.add('hidden');
  editingCourseId = null;
});

// 🔹 Charger tous les cours
async function loadCourses() {
  try {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error('Erreur API /api/courses');
    const courses = await res.json();
    if (!Array.isArray(courses)) throw new Error('Réponse inattendue');

    const list = document.getElementById('courseList');
    list.innerHTML = '';

    courses.forEach(c => {
      const li = document.createElement('li');
      li.className = 'course-item';
      li.innerHTML = `
        <strong>${c.title}</strong> (${c.price || 0} €)
        <br><em>${c.description || 'Aucune description'}</em>
        <br>Catégorie : ${c.categoryName}
        <br>Instructeur : ${c.instructorName}
        <div class="course-actions">
          <button class="edit" data-id="${c.id}">Modifier</button>
          <button class="delete" data-id="${c.id}">Supprimer</button>
        </div>
      `;
      list.appendChild(li);
    });

    // 🔹 Boutons modifier
    document.querySelectorAll('.edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const res = await fetch(`/api/courses/${id}`);
        const course = await res.json();

        document.getElementById('formTitle').textContent = 'Modifier un cours';
        document.getElementById('title').value = course.title;
        document.getElementById('description').value = course.description || '';
        document.getElementById('categoryName').value = course.categoryName;
        document.getElementById('instructorName').value = course.instructorName;
        document.getElementById('price').value = course.price || '';

        editingCourseId = id;
        document.getElementById('courseFormSection').classList.remove('hidden');
      });
    });

    // 🔹 Boutons supprimer
    document.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Supprimer ce cours ?')) {
          await fetch(`/api/courses/${id}`, { method: 'DELETE' });
          loadCourses();
        }
      });
    });

  } catch (err) {
    console.error('Erreur lors du chargement des cours :', err);
  }
}

// 🔹 Soumission du formulaire
document.getElementById('courseForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    categoryName: document.getElementById('categoryName').value,
    instructorName: document.getElementById('instructorName').value,
    price: parseFloat(document.getElementById('price').value)
  };

  const method = editingCourseId ? 'PUT' : 'POST';
  const url = editingCourseId ? `/api/courses/${editingCourseId}` : '/api/courses';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    alert('Erreur : ' + (err.error || 'Impossible d’enregistrer le cours.'));
    return;
  }

  document.getElementById('courseFormSection').classList.add('hidden');
  editingCourseId = null;
  loadCourses();
});

// 🔹 Initialisation
fetchUser();
