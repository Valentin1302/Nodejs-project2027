let editingCourseId = null;

// 🔹 Charger l'utilisateur
async function fetchUser() {
  const res = await fetch('/auth/me');
  if (res.ok) {
    const user = await res.json();
    const usernameEl = document.getElementById('username');
    if (usernameEl) usernameEl.textContent = `Connecté : ${user.name}`;
    loadCourses();
  } else {
    window.location.href = '/views/login.html';
  }
}

// 🔹 Déconnexion
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/views/login.html';
  });
}

// 🔹 Bouton “Ajouter un cours”
const addCourseBtn = document.getElementById('addCourseBtn');
if (addCourseBtn) {
  addCourseBtn.addEventListener('click', () => {
    window.location.href = '/views/create.html';
  });
}

// 🔹 Bouton “Annuler”
const cancelBtn = document.getElementById('cancelBtn');
if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    const formSection = document.getElementById('courseFormSection');
    if (formSection) formSection.classList.add('hidden');
    editingCourseId = null;
  });
}

// 🔹 Chargement des cours (avec filtre)
async function loadCourses(category = '') {
  const list = document.getElementById('courseList');
  if (!list) return; // si on n'est pas sur la page liste

  try {
    const url = category
      ? `/api/courses?category=${encodeURIComponent(category)}`
      : '/api/courses';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erreur API /api/courses');
    const courses = await res.json();

    list.innerHTML = '';

    if (!Array.isArray(courses) || courses.length === 0) {
      list.innerHTML = `<li>Aucun cours trouvé${category ? ` pour "${category}"` : ''}</li>`;
      return;
    }

    courses.forEach(c => {
      const li = document.createElement('li');
      li.className = 'course-item';
      li.innerHTML = `
        <strong>${c.title}</strong> (${c.price || 0} €)
        <br><em>${c.description || 'Aucune description'}</em>
        <br>Catégorie : ${c.categoryName || '—'}
        <br>Instructeur : ${c.instructorName || '—'}
        <div class="course-actions">
          <button class="edit" data-id="${c.id}">Modifier</button>
          <button class="delete" data-id="${c.id}">Supprimer</button>
        </div>
      `;
      list.appendChild(li);
    });

    // Boutons Modifier
    document.querySelectorAll('.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        window.location.href = `/views/edit.html?id=${id}`;
      });
    });

    // Boutons Supprimer
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

// 🔹 Filtrage instantané à la saisie
const filterInput = document.getElementById('filterCategory');
if (filterInput) {
  filterInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    loadCourses(value);
  });
}

// 🔹 Bouton Réinitialiser
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (filterInput) filterInput.value = '';
    loadCourses();
  });
}

// 🔹 Soumission du formulaire
const courseForm = document.getElementById('courseForm');
if (courseForm) {
  courseForm.addEventListener('submit', async (e) => {
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

    const formSection = document.getElementById('courseFormSection');
    if (formSection) formSection.classList.add('hidden');
    editingCourseId = null;
    loadCourses();
  });
}

// 🔹 Initialisation
fetchUser();
