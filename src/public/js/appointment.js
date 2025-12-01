// appointment.js

// Récupérer l'ID du cours depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

// Titre de la page
const pageTitle = document.getElementById("pageTitle");
pageTitle.textContent = `Prendre rendez-vous pour le cours #${courseId}`;

/**
 * 🔹 Charger les infos du cours
 */
async function getCourseInfo() {
  const res = await fetch(`/api/courses/${courseId}`);
  if (!res.ok) throw new Error("Impossible de charger le cours");
  return res.json();
}

/**
 * 🔹 Charger les créneaux disponibles
 */
async function loadAvailability(courseData) {
  const res = await fetch("/api/calendar/availability");
  const slots = await res.json();
  const calendarDiv = document.getElementById("calendar");
  calendarDiv.innerHTML = "";

  if (!slots.length) {
    calendarDiv.innerHTML = "<p>Aucune disponibilité pour les prochains jours.</p>";
    return;
  }

  slots.forEach(slot => {
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
      }
    });

    calendarDiv.appendChild(btn);
  });
}

/**
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
 * 🔹 Initialisation de la page
 */
(async function init() {
  try {
    const courseData = await getCourseInfo();
    pageTitle.textContent = `Prendre rendez-vous pour ${courseData.title} (${courseData.categoryName})`;

    await loadAvailability(courseData);

    // Si on est sur la page success (après Stripe)
    if (window.location.pathname.includes("payment-success")) {
      await confirmAppointmentAfterPayment();
    }

  } catch (error) {
    console.error("Erreur:", error);
    document.getElementById("calendar").innerHTML =
      "<p>Erreur de chargement des données.</p>";
  }
})();
