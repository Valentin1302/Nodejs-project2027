<<<<<<< HEAD
// appointment.js

// Récupérer l'ID du cours depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

// Titre de la page
const pageTitle = document.getElementById("pageTitle");
=======
// Récupérer l'ID du cours depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');

const pageTitle = document.getElementById('pageTitle');
>>>>>>> 803bd70679d7bd5521195b14a42f20a7bfaca636
pageTitle.textContent = `Prendre rendez-vous pour le cours #${courseId}`;

/**
 * 🔹 Charger les infos du cours
 */
async function getCourseInfo() {
  const res = await fetch(`/api/courses/${courseId}`);
<<<<<<< HEAD
  if (!res.ok) throw new Error("Impossible de charger le cours");
=======
  if (!res.ok) throw new Error('Impossible de charger le cours');
>>>>>>> 803bd70679d7bd5521195b14a42f20a7bfaca636
  return res.json();
}

/**
 * 🔹 Charger les créneaux disponibles
 */
async function loadAvailability(courseData) {
<<<<<<< HEAD
  const res = await fetch("/api/calendar/availability");
  const slots = await res.json();
  const calendarDiv = document.getElementById("calendar");
  calendarDiv.innerHTML = "";

  if (!slots.length) {
    calendarDiv.innerHTML = "<p>Aucune disponibilité pour les prochains jours.</p>";
=======
  const res = await fetch('/api/calendar/availability');
  const slots = await res.json();
  const calendarDiv = document.getElementById('calendar');
  calendarDiv.innerHTML = '';

  if (!slots.length) {
    calendarDiv.innerHTML = '<p>Aucune disponibilité pour les prochains jours.</p>';
>>>>>>> 803bd70679d7bd5521195b14a42f20a7bfaca636
    return;
  }

  slots.forEach(slot => {
<<<<<<< HEAD
    const btn = document.createElement("button");
    btn.textContent = new Date(slot.start).toLocaleString("fr-FR");

    btn.addEventListener("click", async () => {
      try {
        // Crée une session Stripe
        const sessionRes = await fetch("/api/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructor: courseData.instructorName,
            slot,
            courseTitle: courseData.title,
            categoryName: courseData.categoryName,
            price: courseData.price
          })
        });

        const session = await sessionRes.json();

        if (session.url) {
          // Stocker temporairement les infos pour la confirmation après paiement
          localStorage.setItem("appointmentInfo", JSON.stringify({
            instructor: courseData.instructorName,
            slot,
            courseTitle: courseData.title,
            categoryName: courseData.categoryName
          }));

          // Redirection vers Stripe Checkout
          window.location.href = session.url;
        } else {
          alert("Erreur lors de la redirection vers Stripe");
        }
      } catch (err) {
        console.error("Erreur Stripe:", err);
        alert("Impossible de créer la session de paiement.");
=======
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
>>>>>>> 803bd70679d7bd5521195b14a42f20a7bfaca636
      }
    });

    calendarDiv.appendChild(btn);
  });
}

/**
<<<<<<< HEAD
 * 🔹 Confirmer le rendez-vous après paiement réussi
 */
async function confirmAppointmentAfterPayment() {
  const appointmentInfo = localStorage.getItem("appointmentInfo");
  if (!appointmentInfo) return;

  const data = JSON.parse(appointmentInfo);

  try {
    const res = await fetch("/api/calendar/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (result.success) {
      alert(`✅ Paiement et réservation confirmés !\nRendez-vous ajouté à votre calendrier : ${result.link}`);
      localStorage.removeItem("appointmentInfo");
      window.location.href = "/"; // Redirige vers l'accueil
    } else {
      alert("❌ Paiement réussi mais impossible de créer le rendez-vous.");
    }
  } catch (err) {
    console.error("Erreur lors de la création du rendez-vous :", err);
    alert("Erreur lors de la création du rendez-vous après paiement.");
  }
}

/**
=======
>>>>>>> 803bd70679d7bd5521195b14a42f20a7bfaca636
 * 🔹 Initialisation de la page
 */
(async function init() {
  try {
    const courseData = await getCourseInfo();
    pageTitle.textContent = `Prendre rendez-vous pour ${courseData.title} (${courseData.categoryName})`;
<<<<<<< HEAD

    await loadAvailability(courseData);

    // Si on est sur la page success (après Stripe)
    if (window.location.pathname.includes("payment-success")) {
      await confirmAppointmentAfterPayment();
    }

  } catch (error) {
    console.error("Erreur:", error);
    document.getElementById("calendar").innerHTML =
      "<p>Erreur de chargement des données.</p>";
=======
    await loadAvailability(courseData);
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('calendar').innerHTML = '<p>Erreur de chargement des données.</p>';
>>>>>>> 803bd70679d7bd5521195b14a42f20a7bfaca636
  }
})();
