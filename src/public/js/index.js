async function fetchUser() {
  const res = await fetch('/auth/me');
  if (res.ok) {
    const user = await res.json();
    document.getElementById('username').textContent = user.name;
  } else {
    // Si pas connecté, on redirige vers login
    window.location.href = '/views/login.html';
  }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' });
  window.location.href = '/views/login.html';
});

fetchUser();
