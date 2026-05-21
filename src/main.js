import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';

const mockRepairs = [
  { id: 1, ugyfel_nev: 'Kovács Péter', eszkoz_tipus: 'Asztali PC', hiba_leiras: 'Lassú a rendszer, Windows nem bootol. SSD csere szükséges.', statusz: 'Alkatrészre vár' },
  { id: 2, ugyfel_nev: 'Nagy Alíz', eszkoz_tipus: 'Lenovo IdeaPad', hiba_leiras: 'Nem kapcsol be, zárlatosnak tűnik a tápegység.', statusz: 'Folyamatban' },
  { id: 3, ugyfel_nev: 'Szabó Gábor', eszkoz_tipus: 'Asztali PC', hiba_leiras: 'Kékhalál játékok közben. Memóriateszt javasolt.', statusz: 'Folyamatban' },
  { id: 4, ugyfel_nev: 'Kiss Éva', eszkoz_tipus: 'Asus ROG Laptop', hiba_leiras: 'Gyorsítást kért a tulajdonos, 1TB M.2 SSD beépítve.', statusz: 'Kész' },
  { id: 5, ugyfel_nev: 'Tóth Dániel', eszkoz_tipus: 'MacBook Pro 2015', hiba_leiras: 'Akkumulátorcsere és teljes belső portalanítás.', statusz: 'Átvéve' }
];

document.addEventListener('DOMContentLoaded', () => {
  
  const navLinks = document.querySelectorAll('#nav-links .nav-link');
  const pages = document.querySelectorAll('.page-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      pages.forEach(page => page.classList.add('d-none'));

      const targetPageId = link.getAttribute('data-page');
      const targetPage = document.getElementById(`page-${targetPageId}`);
      if (targetPage) {
        targetPage.classList.remove('d-none');
      }
    });
  });


  const tableBody = document.getElementById('repairs-table-body');
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const totalCountSpan = document.getElementById('total-repairs-count');

  function getStatusBadge(statusz) {
    switch (statusz) {
      case 'Alkatrészre vár': return `<span class="badge bg-warning text-dark shadow-sm">⏳ Alkatrészre vár</span>`;
      case 'Folyamatban': return `<span class="badge bg-primary shadow-sm">⚙️ Folyamatban</span>`;
      case 'Kész': return `<span class="badge bg-success shadow-sm">✅ Kész</span>`;
      case 'Átvéve': return `<span class="badge bg-secondary shadow-sm">📦 Átvéve</span>`;
      default: return `<span class="badge bg-light text-dark shadow-sm">${statusz}</span>`;
    }
  }

  function renderRepairs(data) {
    tableBody.innerHTML = '';
    totalCountSpan.textContent = `${data.length} db aktív munka`;

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Nincs a keresésnek megfelelő találat.</td></tr>`;
      return;
    }

    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="text-muted fw-bold">#${item.id}</td>
        <td class="fw-bold text-dark">${item.ugyfel_nev}</td>
        <td><i class="bi bi-laptop me-1 text-muted"></i> ${item.eszkoz_tipus}</td>
        <td><span class="d-inline-block text-truncate" style="max-width: 300px;" title="${item.hiba_leiras}">${item.hiba_leiras}</span></td>
        <td>${getStatusBadge(item.statusz)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark me-1" title="Szerkesztés">
            <i class="bi bi-pencil-square"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function filterData() {
    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    const filtered = mockRepairs.filter(item => {
      const matchesSearch = item.ugyfel_nev.toLowerCase().includes(searchText) || 
                            item.eszkoz_tipus.toLowerCase().includes(searchText);
      
      const matchesStatus = selectedStatus === 'all' || item.statusz === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });

    renderRepairs(filtered);
  }

  if (searchInput && statusFilter) {
    searchInput.addEventListener('input', filterData);
    statusFilter.addEventListener('change', filterData);
  }

  if (tableBody) {
    renderRepairs(mockRepairs);
  }
});