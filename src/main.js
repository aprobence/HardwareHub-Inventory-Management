import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';

const API_JAVITASOK_URL = "https://retoolapi.dev/w7C9sW/javitasok";
const API_RAKTAR_URL = "https://retoolapi.dev/ljj6c0/raktar";

const HardwareHubAPI = {
    fetchRepairs: async () => {
        const response = await fetch(API_JAVITASOK_URL);
        if (!response.ok) {
            throw new Error('Nem sikerült betölteni a javításokat.');
        }
        return await response.json();
    },

    fetchInventory: async () => {
        const response = await fetch(API_RAKTAR_URL);
        if (!response.ok) {
            throw new Error('Nem sikerült betölteni a raktárkészletet.');
        }
        return await response.json();
    },

    addRepair: async (repairData) => {
        const response = await fetch(API_JAVITASOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(repairData)
        });
        if (!response.ok) {
            throw new Error('Nem sikerült hozzáadni a javítást.');
        }
    },

    addPart: async (partData) => {
        const response = await fetch(API_RAKTAR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partData)
        });
        if (!response.ok) {
            throw new Error('Nem sikerült hozzáadni az alkatrészt.');
        }
    },

    updatePartQuantity: async (id, newQty) => {
        const response = await fetch(`${API_RAKTAR_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ darabszam: newQty })
        });
        if (!response.ok) {
            throw new Error('Nem sikerült frissíteni a készletet.');
        }
    },

    updateRepairStatus: async (id, statusz) => {
        const response = await fetch(`${API_JAVITASOK_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statusz })
        });
        if (!response.ok) {
            throw new Error('Nem sikerült módosítani a státuszt.');
        }
    },

    deleteRepair: async (id) => {
        const response = await fetch(`${API_JAVITASOK_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Nem sikerült törölni a javítást.');
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {

    const themeToggles = document.querySelectorAll('[data-theme-toggle]');
    const themeIcons = document.querySelectorAll('[data-theme-icon]');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    });

    function applyTheme(theme) {
        htmlElement.setAttribute('data-bs-theme', theme);
        themeIcons.forEach(icon => {
            icon.className =
                theme === 'dark'
                    ? 'bi bi-sun-fill text-warning'
                    : 'bi bi-moon-stars-fill text-secondary';
        });
    }

    const navLinks = document.querySelectorAll('#nav-links .nav-link');
    const pages = document.querySelectorAll('.page-section');
    const roleSelectorScreen = document.getElementById('role-selector-screen');
    const mainNavbar = document.getElementById('main-navbar');
    const pageContentWrapper = document.getElementById('page-content-wrapper');
    const enterAdminModeBtn = document.getElementById('enter-admin-mode');
    const enterUserModeBtn = document.getElementById('enter-user-mode');
    const returnToMenuAdminBtn = document.getElementById('return-to-menu-admin');
    const returnToMenuUserBtn = document.getElementById('return-to-menu-user');
    const selectorTopControls = document.getElementById('selector-top-controls');
    const userNavbar = document.getElementById('user-navbar');
    const newPartColumn = document.getElementById('new-part-column');
    const newRepairColumn = document.getElementById('new-repair-column');

    const tableBody = document.getElementById('repairs-table-body');
    const archiveTableBody = document.getElementById('archive-table-body');
    const searchInput = document.getElementById('search-input');
    const totalCountSpan = document.getElementById('total-repairs-count');
    const inventoryTableBody = document.getElementById('inventory-table-body');

    async function refreshAllData() {
        try {
            const [freshRepairs, freshInventory] = await Promise.all([
                HardwareHubAPI.fetchRepairs(),
                HardwareHubAPI.fetchInventory()
            ]);

            renderRepairs(freshRepairs);
            renderInventory(freshInventory);
            populatePartDropdown(freshInventory);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    function populatePartDropdown(inventoryData) {
        const partSelect = document.getElementById('repair-part');
        if (!partSelect) return;

        partSelect.innerHTML = '<option value="">-- Nem igényel raktári alkatrészt --</option>';

        inventoryData.forEach(part => {
            if (part.alkatresz_nev) {
                partSelect.innerHTML += `
          <option value="${part.id}">
            ${part.alkatresz_nev} (${part.darabszam} db van)
          </option>
        `;
            }
        });
    }

    function showOnlyPage(pageName) {
        pages.forEach(page => page.classList.add('d-none'));
        const activePage = document.getElementById(`page-${pageName}`);
        if (activePage) {
            activePage.classList.remove('d-none');
        }
    }

    function setActiveNav(pageName) {
        navLinks.forEach(link => {
            const isActive = link.getAttribute('data-page') === pageName;
            link.classList.toggle('active', isActive);
        });
    }

    async function enterAdminMode() {
        roleSelectorScreen?.classList.add('d-none');
        mainNavbar?.classList.remove('d-none');
        pageContentWrapper?.classList.remove('d-none');
        selectorTopControls?.classList.add('d-none');
        userNavbar?.classList.add('d-none');
        newPartColumn?.classList.remove('d-none');
        newRepairColumn?.classList.remove('col-12');
        newRepairColumn?.classList.add('col-lg-6');
        setActiveNav('dashboard');
        showOnlyPage('dashboard');
        await refreshAllData();
    }

    async function enterUserMode() {
        roleSelectorScreen?.classList.add('d-none');
        mainNavbar?.classList.add('d-none');
        pageContentWrapper?.classList.remove('d-none');
        selectorTopControls?.classList.add('d-none');
        userNavbar?.classList.remove('d-none');
        newPartColumn?.classList.add('d-none');
        newRepairColumn?.classList.remove('col-lg-6');
        newRepairColumn?.classList.add('col-12');
        setActiveNav('adatfelvetel');
        showOnlyPage('adatfelvetel');
        await refreshAllData();
    }

    function returnToMenu() {
        roleSelectorScreen?.classList.remove('d-none');
        mainNavbar?.classList.add('d-none');
        pageContentWrapper?.classList.add('d-none');
        selectorTopControls?.classList.remove('d-none');
        userNavbar?.classList.add('d-none');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            pages.forEach(page => page.classList.add('d-none'));

            document
                .getElementById(`page-${link.getAttribute('data-page')}`)
                .classList.remove('d-none');

            const navbarCollapse = document.getElementById('navbarNav');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }

            await refreshAllData();
        });
    });

    function renderRepairs(data) {
        if (!tableBody || !archiveTableBody) return;

        tableBody.innerHTML = '';
        archiveTableBody.innerHTML = '';

        const activeRepairs = data.filter(
            item => item.statusz !== 'Kész' && item.statusz !== 'Átvéve'
        );

        const completedRepairs = data.filter(
            item => item.statusz === 'Kész' || item.statusz === 'Átvéve'
        );

        totalCountSpan.textContent = `${activeRepairs.length} db aktív`;

        const createRow = (item, isActive) => `
      <tr>
        <td class="text-muted fw-bold">#${item.id}</td>

        <td class="fw-bold text-body">
          ${item.ugyfel_nev || 'Nincs név'}
        </td>

        <td>
          <i class="bi bi-laptop me-1 text-muted"></i>
          ${item.eszkoz_tipus || 'Ismeretlen'}
        </td>

        <td>
          <span
            class="d-inline-block text-truncate"
            style="max-width: 200px;"
            title="${item.hiba_leiras || ''}"
          >
            ${item.hiba_leiras || '-'}
          </span>
        </td>

        <td>
          <select
            class="form-select form-select-sm status-select shadow-sm fw-bold ${isActive ? 'bg-body border-0' : 'bg-success text-white border-success'
            }"
            data-id="${item.id}"
            style="cursor: pointer; min-height: 35px;"
          >
            <option value="Alkatrészre vár"
              ${item.statusz === 'Alkatrészre vár' ? 'selected' : ''}>
              ⏳ Alkatrészre vár
            </option>

            <option value="Folyamatban"
              ${item.statusz === 'Folyamatban' ? 'selected' : ''}>
              ⚙️ Folyamatban
            </option>

            <option value="Kész"
              ${item.statusz === 'Kész' ? 'selected' : ''}>
              ✅ Kész
            </option>

            <option value="Átvéve"
              ${item.statusz === 'Átvéve' ? 'selected' : ''}>
              📦 Átvéve
            </option>
          </select>
        </td>

        <td class="text-end">
          <button
            class="btn btn-sm btn-outline-danger delete-btn"
            data-id="${item.id}"
            title="Törlés"
          >
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;

        activeRepairs.forEach(item => {
            tableBody.innerHTML += createRow(item, true);
        });

        completedRepairs.forEach(item => {
            archiveTableBody.innerHTML += createRow(item, false);
        });

        if (activeRepairs.length === 0) {
            tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            Nincs aktív munka.
          </td>
        </tr>
      `;
        }

        if (completedRepairs.length === 0) {
            archiveTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            Az archívum üres.
          </td>
        </tr>
      `;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', async () => {
            try {
                const text = searchInput.value.toLowerCase();

                const allData = await HardwareHubAPI.fetchRepairs();

                const filtered = allData.filter(item =>
                    (item.ugyfel_nev || '').toLowerCase().includes(text) ||
                    (item.eszkoz_tipus || '').toLowerCase().includes(text)
                );

                renderRepairs(filtered);
            } catch (error) {
                console.error(error);
            }
        });
    }

    function renderInventory(inventoryData) {
        if (!inventoryTableBody) return;

        inventoryTableBody.innerHTML = '';

        inventoryData.forEach(item => {
            if (!item.alkatresz_nev) return;

            const qty = parseInt(item.darabszam) || 0;
            const limit = parseInt(item.kritikus_szint) || 0;

            const isCritical = qty <= limit;

            inventoryTableBody.innerHTML += `
        <tr class="${isCritical ? 'table-danger' : ''}">
          <td class="text-muted fw-bold">#${item.id}</td>

          <td class="fw-bold text-body">${item.alkatresz_nev}</td>

          <td class="text-center fs-6 fw-bold ${isCritical ? 'text-danger' : 'text-body'
                }">
            ${qty}
          </td>

          <td class="text-center text-muted">${limit}</td>

          <td>
            ${isCritical
                    ? `
                  <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    Beszerzés!
                  </span>
                `
                    : `
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-check-circle-fill"></i>
                    Megfelelő
                  </span>
                `
                }
          </td>

          <td class="text-end">
            <button
              class="btn btn-sm btn-outline-success add-stock-btn shadow-sm"
              data-id="${item.id}"
              data-qty="${qty}"
              title="Készlet növelése"
            >
              <i class="bi bi-plus-lg"></i>
              Darab
            </button>
          </td>
        </tr>
      `;
        });
    }

    document.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');

            if (confirm('Biztosan törölni szeretnéd ezt a bejegyzést?')) {
                try {
                    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

                    await HardwareHubAPI.deleteRepair(btn.dataset.id);

                    await refreshAllData();
                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            }
        }

        if (e.target.closest('.add-stock-btn')) {
            const btn = e.target.closest('.add-stock-btn');

            const amount = parseInt(
                prompt('Hány darabot hozott a futár ebből az alkatrészből?')
            );

            if (!isNaN(amount) && amount > 0) {
                try {
                    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

                    const newQty = parseInt(btn.dataset.qty) + amount;

                    await HardwareHubAPI.updatePartQuantity(
                        btn.dataset.id,
                        newQty
                    );

                    await refreshAllData();
                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            }
        }
    });

    document.addEventListener('change', async (e) => {
        if (e.target.classList.contains('status-select')) {
            try {
                e.target.disabled = true;

                await HardwareHubAPI.updateRepairStatus(
                    e.target.dataset.id,
                    e.target.value
                );

                await refreshAllData();
            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                e.target.disabled = false;
            }
        }
    });

    const repairForm = document.getElementById('form-new-repair');

    if (repairForm) {
        repairForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!repairForm.checkValidity()) {
                repairForm.classList.add('was-validated');
                return;
            }

            try {
                const selectedPartId =
                    document.getElementById('repair-part').value;

                if (selectedPartId) {
                    const inventory = await HardwareHubAPI.fetchInventory();

                    const part = inventory.find(
                        p => p.id == selectedPartId
                    );

                    if (part && parseInt(part.darabszam) > 0) {
                        await HardwareHubAPI.updatePartQuantity(
                            selectedPartId,
                            parseInt(part.darabszam) - 1
                        );
                    }
                }

                await HardwareHubAPI.addRepair({
                    ugyfel_nev:
                        document.getElementById('repair-client').value,

                    eszkoz_tipus:
                        document.getElementById('repair-device').value,

                    hiba_leiras:
                        document.getElementById('repair-description').value ||
                        'Nincs leírás.',

                    statusz: 'Alkatrészre vár'
                });

                repairForm.reset();
                repairForm.classList.remove('was-validated');

                await refreshAllData();

                alert('Sikeresen beküldve!');
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    }

    const partForm = document.getElementById('form-new-part');

    if (partForm) {
        partForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!partForm.checkValidity()) {
                partForm.classList.add('was-validated');
                return;
            }

            try {
                await HardwareHubAPI.addPart({
                    alkatresz_nev:
                        document.getElementById('part-name').value,

                    darabszam:
                        parseInt(document.getElementById('part-qty').value) || 0,

                    kritikus_szint:
                        parseInt(document.getElementById('part-limit').value) || 0
                });

                partForm.reset();
                partForm.classList.remove('was-validated');

                await refreshAllData();

                alert('Új alkatrész rögzítve!');
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    }

    enterAdminModeBtn?.addEventListener('click', async () => {
        await enterAdminMode();
    });

    enterUserModeBtn?.addEventListener('click', async () => {
        await enterUserMode();
    });

    returnToMenuAdminBtn?.addEventListener('click', () => {
        returnToMenu();
    });

    returnToMenuUserBtn?.addEventListener('click', () => {
        returnToMenu();
    });
});