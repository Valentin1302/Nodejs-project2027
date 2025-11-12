// 🔹 Bouton retour
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '/views/index.html';
});

// 🔹 Soumission du formulaire d’ajout
document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    categoryName: document.getElementById('categoryName').value,
    instructorName: document.getElementById('instructorName').value,
    price: parseFloat(document.getElementById('price').value)
  };

  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      alert('Erreur : ' + (err.error || 'Impossible d’ajouter le cours.'));
      return;
    }

    alert('Cours ajouté avec succès ✅');
    window.location.href = '/views/index.html';
  } catch (err) {
    console.error('Erreur lors de l’ajout du cours :', err);
    alert('Erreur réseau ou serveur.');
  }
});
