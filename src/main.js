import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';

let mockRepairs = [
  { id: 1, ugyfel_nev: 'Kovács Péter', eszkoz_tipus: 'Asztali PC', hiba_leiras: 'Lassú a rendszer, Windows nem bootol. SSD csere szükséges.', statusz: 'Alkatrészre vár' },
  { id: 2, ugyfel_nev: 'Nagy Alíz', eszkoz_tipus: 'Lenovo IdeaPad', hiba_leiras: 'Nem kapcsol be, zárlatosnak tűnik a tápegység.', statusz: 'Folyamatban' },
  { id: 3, ugyfel_nev: 'Szabó Gábor', eszkoz_tipus: 'Asztali PC', hiba_leiras: 'Kékhalál játékok közben. Memóriateszt javasolt.', statusz: 'Folyamatban' },
  { id: 4, ugyfel_nev: 'Kiss Éva', eszkoz_tipus: 'Asus ROG Laptop', hiba_leiras: 'Gyorsítást kért a tulajdonos, 1TB M.2 SSD beépítve.', statusz: 'Kész' },
  { id: 5, ugyfel_nev: 'Tóth Dániel', eszkoz_tipus: 'MacBook Pro 2015', hiba_leiras: 'Akkumulátorcsere és teljes belső portalanítás.', statusz: 'Átvéve' }
];

let mockInventory = [
  { id: 1, alkatresz_nev: 'Kingston A400 480GB SSD', darabszam: 12, kritikus_szint: 3 },
  { id: 2, alkatresz_nev: 'Crucial 8GB DDR4 3200MHz RAM', darabszam: 5, kritikus_szint: 4 },
  { id: 3, alkatresz_nev: 'GIGABYTE P650B 650W Tápegység', darabszam: 1, kritikus_szint: 3 },
  { id: 4, alkatresz_nev: 'Samsung 980 1TB M.2 NVMe SSD', darabszam: 8, kritikus_szint: 2 },
  { id: 5, alkatresz_nev: 'Corsair Vengeance 16GB DDR5 RAM', darabszam: 0, kritikus_szint: 2 }
];

const HardwareHubAPI = {
  fetchRepairs: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockRepairs]), 300);
    });
  },
  fetchInventory: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockInventory]), 300);
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  
  const navLinks = document.querySelectorAll('#nav-links .nav-link');
  const pages = document.querySelectorAll('.page-section');

  navLinks.forEach(link => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      pages.forEach(page => page.classList.add('d-none'));

      const targetPageId = link.getAttribute('data-page');
      const targetPage = document.getElementById(`page-${targetPageId}`);
      if (targetPage) targetPage.classList.remove('d-none');

      if (targetPageId === 'raktar') {
        const freshInventory = await HardwareHubAPI.fetchInventory();
        renderInventory(freshInventory);
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
    if (!tableBody) return;
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

  async function filterData() {
    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;
    
    const repairsFromServer = await HardwareHubAPI.fetchRepairs();

    const filtered = repairsFromServer.filter(item => {
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

  const inventoryTableBody = document.getElementById('inventory-table-body');

  function renderInventory(inventoryData) {
    if (!inventoryTableBody) return;
    inventoryTableBody.innerHTML = '';

    inventoryData.forEach(item => {
      const row = document.createElement('tr');
      const isCritical = item.darabszam <= item.kritikus_szint;
      if (isCritical) row.classList.add('table-danger');

      row.innerHTML = `
        <td class="text-muted fw-bold">#${item.id}</td>
        <td class="fw-bold">${item.alkatresz_nev}</td>
        <td class="text-center fs-6 fw-bold ${isCritical ? 'text-danger' : 'text-dark'}">${item.darabszam}</td>
        <td class="text-center text-muted">${item.kritikus_szint}</td>
        <td>
          ${isCritical 
            ? `<span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i> Beszerzés szükséges!</span>` 
            : `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Megfelelő</span>`
          }
        </td>
      `;
      inventoryTableBody.appendChild(row);
    });
  }

  const repairForm = document.getElementById('form-new-repair');
  const partForm = document.getElementById('form-new-part');

  if (repairForm) {
    repairForm.addEventListener('submit', async (event) => {
      if (!repairForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        repairForm.classList.add('was-validated');
        return;
      }
      event.preventDefault();

      const newRepair = {
        id: mockRepairs.length + 1,
        ugyfel_nev: document.getElementById('repair-client').value,
        eszkoz_tipus: document.getElementById('repair-device').value,
        hiba_leiras: document.getElementById('repair-description').value || 'Nincs leírás.',
        statusz: 'Alkatrészre vár'
      };

      mockRepairs.push(newRepair);
      
      const freshData = await HardwareHubAPI.fetchRepairs();
      renderRepairs(freshData);

      repairForm.reset();
      repairForm.classList.remove('was-validated');
      alert('Szervizigény sikeresen rögzítve!');
    });
  }

  if (partForm) {
    partForm.addEventListener('submit', async (event) => {
      if (!partForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        partForm.classList.add('was-validated');
        return;
      }
      event.preventDefault();

      const newPart = {
        id: mockInventory.length + 1,
        alkatresz_nev: document.getElementById('part-name').value,
        darabszam: parseInt(document.getElementById('part-qty').value),
        kritikus_szint: parseInt(document.getElementById('part-limit').value)
      };

      mockInventory.push(newPart);

      partForm.reset();
      partForm.classList.remove('was-validated');
      alert('Új alkatrész sikeresen hozzáadva a raktárhoz!');
    });
  }

  if (tableBody) {
    const initialRepairs = await HardwareHubAPI.fetchRepairs();
    renderRepairs(initialRepairs);
  }
});