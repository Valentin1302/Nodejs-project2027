(function(){
  // Helper: fetch JSON safely
  async function fetchJson(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function fetchCategories(){
    try{
      return await fetchJson('/api/categories');
    }catch(e){
      console.warn('Could not fetch categories', e);
      return [];
    }
  }

  async function fetchCourseList(){
    try{
      const res = await fetch('/api/course-list');
      const json = await res.json();
      return json.data || [];
    }catch(e){
      console.error('Could not fetch course list', e);
      return [];
    }
  }

  async function fetchNearby(lat, lng, radiusKm){
    try{
      const q = `/api/courses/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radiusKm)}`;
      const res = await fetch(q);
      const json = await res.json();
      return json.data || [];
    }catch(e){
      console.error('Could not fetch nearby courses', e);
      return [];
    }
  }

  function clearGrid(){
    const grid = document.getElementById('courses-grid');
    if(grid) grid.innerHTML = '';
  }

  function renderCards(list){
    const grid = document.getElementById('courses-grid');
    const empty = document.getElementById('empty');
    if(!grid || !empty) return;
    grid.innerHTML = '';
    if(!list || list.length === 0){
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    for(const item of list){
      const card = document.createElement('article');
      card.className = 'card';
      const title = document.createElement('h3');
      title.textContent = item.courseTitle || item.title || '—';
      const meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = `${item.categoryName || item.category || '—'} • ${item.instructorName || '—'}`;
      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = item.price ? `${item.price} €` : '—';
      const footer = document.createElement('div');
      footer.className = 'card-footer';
      if(item.distanceKm != null) footer.textContent = `À ${item.distanceKm} km`;
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(price);
      card.appendChild(footer);
      grid.appendChild(card);
    }
  }

  // Wire controls
  async function init(){
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category-select');
    const nearbyBtn = document.getElementById('nearby-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const radiusInput = document.getElementById('radius');

    // Load categories
    const cats = await fetchCategories();
    if(categorySelect && Array.isArray(cats)){
      for(const c of cats){
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
      }
    }

    async function loadAndRenderAll(){
      const list = await fetchCourseList();
      // map items to unified shape (course_list view returns courseTitle/categoryName/instructorName)
      renderCards(list.map(i => ({
        courseTitle: i.courseTitle || i.title,
        categoryName: i.categoryName || i.category,
        instructorName: i.instructorName || i.instructorName,
        price: i.price || i.price,
      })));
    }

    // Debounced search
    let searchTimer = 0;
    function onSearchChange(){
      clearTimeout(searchTimer);
      searchTimer = window.setTimeout(async () => {
        const q = (searchInput && (searchInput.value || '')).toLowerCase();
        const all = await fetchCourseList();
        const filtered = all.filter(i => (i.courseTitle || i.title || '').toLowerCase().includes(q));
        renderCards(filtered.map(i => ({
          courseTitle: i.courseTitle || i.title,
          categoryName: i.categoryName || i.category,
          instructorName: i.instructorName || i.instructorName,
          price: i.price || i.price,
        })));
      }, 250);
    }

    if(searchInput) searchInput.addEventListener('input', onSearchChange);

    if(refreshBtn) refreshBtn.addEventListener('click', loadAndRenderAll);

    if(nearbyBtn){
      nearbyBtn.addEventListener('click', async () => {
        // Try geolocation first
        if(navigator.geolocation){
          nearbyBtn.textContent = 'Localisation...';
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const radius = Number(radiusInput.value || '5');
            const list = await fetchNearby(lat, lng, radius);
            renderCards(list.map(i => ({
              courseTitle: i.courseTitle,
              categoryName: i.categoryName,
              instructorName: i.instructorName,
              price: i.price,
              distanceKm: i.distanceKm
            })));
            nearbyBtn.textContent = 'Près de moi';
          }, async () => {
            // fallback: ask for manual coords
            nearbyBtn.textContent = 'Près de moi';
            const lat = prompt('Latitude (ex: 48.8566)');
            const lng = prompt('Longitude (ex: 2.3522)');
            if(!lat || !lng) return;
            const radius = Number(radiusInput.value || '5');
            const list = await fetchNearby(Number(lat), Number(lng), radius);
            renderCards(list.map(i => ({
              courseTitle: i.courseTitle,
              categoryName: i.categoryName,
              instructorName: i.instructorName,
              price: i.price,
              distanceKm: i.distanceKm
            })));
          });
        } else {
          alert('Géolocalisation non supportée, entre tes coordonnées manuellement.');
        }
      });
    }

    // Initial load
    loadAndRenderAll();
  }

  // Kick off
  document.addEventListener('DOMContentLoaded', init);
})();
