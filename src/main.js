import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';

const API_JAVITASOK_URL = "https://retoolapi.dev/w7C9sW/javitasok";
const API_RAKTAR_URL = "https://retoolapi.dev/ljj6c0/raktar";

const HardwareHubAPI = {
  
  fetchRepairs: async () => {
    const response = await fetch(API_JAVITASOK_URL);
    return await response.json();
  },

  fetchInventory: async () => {
    const response = await fetch(API_RAKTAR_URL);
    return await response.json();
  },

  addRepair: async (repairData) => {
    const response = await fetch(API_JAVITASOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repairData)
    });
    return await response.json();
  },

  addPart: async (partData) => {
    const response = await fetch(API_RAKTAR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partData)
    });
    return await response.json();
  },

  updatePartQuantity: async (id, newQty) => {
    await fetch(`${API_RAKTAR_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ darabszam: newQty })
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const navLinks = document.querySelectorAll('#nav-links .nav-link');
  const pages = document.querySelectorAll('.page-section');

  async function populatePartDropdown() {
    const partSelect = document.getElementById('repair-part');
    if (!partSelect) return;
    
    try {
      const currentInventory = await HardwareHubAPI.fetchInventory();
      partSelect.innerHTML = '<option value="">-- Nem igényel raktári alkatrészt --</option>';
      
      currentInventory.forEach(part => {
        if (part.alkatresz_nev) {
          partSelect.innerHTML += `<option value="${part.id}">${part.alkatresz_nev} (${part.darabszam} db van)</option>`;
        }
      });
    } catch (error) {
      console.error("Hiba a legördülő menü betöltésekor:", error);
    }
  }
  
  await populatePartDropdown();

  navLinks.forEach(link => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      pages.forEach(page => page.classList.add('d-none'));

      const targetPageId = link.getAttribute('data-page');
      const targetPage = document.getElementById(`page-${targetPageId}`);
      if (targetPage) targetPage.classList.remove('d-none');

      if (targetPageId === 'dashboard') {
        const freshRepairs = await HardwareHubAPI.fetchRepairs();
        renderRepairs(freshRepairs);
      }
      if (targetPageId === 'raktar') {
        const freshInventory = await HardwareHubAPI.fetchInventory();
        renderInventory(freshInventory);
      }
      if (targetPageId === 'adatfelvetel') {
        await populatePartDropdown();
      }
    });
  });

  const tableBody = document.getElementById('repairs-table-body');
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const totalCountSpan = document.getElementById('total-repairs-count');

  function getStatusBadge(statusz) {
    const st = statusz ? statusz.toString().trim() : 'Alkatrészre vár';
    switch (st) {
      case 'Alkatrészre vár': return `<span class="badge bg-warning text-dark shadow-sm">⏳ Alkatrészre vár</span>`;
      case 'Folyamatban': return `<span class="badge bg-primary shadow-sm">⚙️ Folyamatban</span>`;
      case 'Kész': return `<span class="badge bg-success shadow-sm">✅ Kész</span>`;
      case 'Átvéve': return `<span class="badge bg-secondary shadow-sm">📦 Átvéve</span>`;
      default: return `<span class="badge bg-light text-dark shadow-sm">${st}</span>`;
    }
  }

  function renderRepairs(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    totalCountSpan.textContent = `${data.length} db munka a felhőben`;

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Nincs adat az online adatbázisban.</td></tr>`;
      return;
    }

    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="text-muted fw-bold">#${item.id}</td>
        <td class="fw-bold text-dark">${item.ugyfel_nev || 'Nincs név'}</td>
        <td><i class="bi bi-laptop me-1 text-muted"></i> ${item.eszkoz_tipus || 'Ismeretlen'}</td>
        <td><span class="d-inline-block text-truncate" style="max-width: 300px;" title="${item.hiba_leiras || ''}">${item.hiba_leiras || 'Nincs leírás.'}</span></td>
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
      const client = (item.ugyfel_nev || '').toLowerCase();
      const device = (item.eszkoz_tipus || '').toLowerCase();
      const matchesSearch = client.includes(searchText) || device.includes(searchText);
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
      if (!item.alkatresz_nev) return;
      const row = document.createElement('tr');
      const qty = parseInt(item.darabszam) || 0;
      const limit = parseInt(item.kritikus_szint) || 0;
      
      const isCritical = qty <= limit;
      if (isCritical) row.classList.add('table-danger');

      row.innerHTML = `
        <td class="text-muted fw-bold">#${item.id}</td>
        <td class="fw-bold">${item.alkatresz_nev}</td>
        <td class="text-center fs-6 fw-bold ${isCritical ? 'text-danger' : 'text-dark'}">${qty}</td>
        <td class="text-center text-muted">${limit}</td>
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

      const selectedPartId = document.getElementById('repair-part').value;

      if (selectedPartId) {
        const currentInventory = await HardwareHubAPI.fetchInventory();
        const part = currentInventory.find(p => p.id == selectedPartId);
        if (part && parseInt(part.darabszam) > 0) {
          const newQty = (parseInt(part.darabszam) || 1) - 1;
          await HardwareHubAPI.updatePartQuantity(selectedPartId, newQty);
        }
      }

      const newRepair = {
        ugyfel_nev: document.getElementById('repair-client').value,
        eszkoz_tipus: document.getElementById('repair-device').value,
        hiba_leiras: document.getElementById('repair-description').value || 'Nincs leírás.',
        statusz: 'Alkatrészre vár'
      };

      await HardwareHubAPI.addRepair(newRepair);

      repairForm.reset();
      repairForm.classList.remove('was-validated');
      await populatePartDropdown();
      alert('Szervizigény sikeresen beküldve az online Retool API-ba!');
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
        alkatresz_nev: document.getElementById('part-name').value,
        darabszam: parseInt(document.getElementById('part-qty').value) || 0,
        kritikus_szint: parseInt(document.getElementById('part-limit').value) || 0
      };

      await HardwareHubAPI.addPart(newPart);

      partForm.reset();
      partForm.classList.remove('was-validated');
      alert('Új alkatrész sikeresen feltöltve az online raktárba!');
    });
  }

  try {
    const initialRepairs = await HardwareHubAPI.fetchRepairs();
    renderRepairs(initialRepairs);
  } catch (err) {
    console.error("Nem sikerült elérni a Retool felhőt:", err);
  }
});