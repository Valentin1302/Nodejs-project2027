document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (res.ok) {
    alert('Inscription réussie ! Vous pouvez vous connecter.');
    window.location.href = '/views/login.html';
  } else {
    const data = await res.json();
    document.getElementById('error').textContent = data.error || 'Erreur d’inscription';
  }
});
