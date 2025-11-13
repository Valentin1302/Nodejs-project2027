// Récupérer l'ID du cours depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');

const pageTitle = document.getElementById('pageTitle');
pageTitle.textContent = `Prendre rendez-vous pour le cours #${courseId}`;

/**
 * 🔹 Charger les infos du cours
 */
async function getCourseInfo() {
  const res = await fetch(`/api/courses/${courseId}`);
  if (!res.ok) throw new Error('Impossible de charger le cours');
  return res.json();
}

/**
 * 🔹 Charger les créneaux disponibles
 */
async function loadAvailability(courseData) {
  const res = await fetch('/api/calendar/availability');
  const slots = await res.json();
  const calendarDiv = document.getElementById('calendar');
  calendarDiv.innerHTML = '';

  if (!slots.length) {
    calendarDiv.innerHTML = '<p>Aucune disponibilité pour les prochains jours.</p>';
    return;
  }

  slots.forEach(slot => {
    const btn = document.createElement('button');
    btn.textContent = new Date(slot.start).toLocaleString('fr-FR');

    btn.addEventListener('click', async () => {
      const bookRes = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructor: courseData.instructorName,
          slot,
          courseTitle: courseData.title,
          categoryName: courseData.categoryName
        })
      });

      if (bookRes.ok) {
        const result = await bookRes.json();
        alert(`✅ Rendez-vous réservé !\nLien Google Calendar : ${result.link}`);
      } else {
        alert('❌ Erreur lors de la réservation');
      }
    });

    calendarDiv.appendChild(btn);
  });
}

/**
 * 🔹 Initialisation de la page
 */
(async function init() {
  try {
    const courseData = await getCourseInfo();
    pageTitle.textContent = `Prendre rendez-vous pour ${courseData.title} (${courseData.categoryName})`;
    await loadAvailability(courseData);
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('calendar').innerHTML = '<p>Erreur de chargement des données.</p>';
  }
})();
