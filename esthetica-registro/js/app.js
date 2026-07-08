(() => {
  const STORAGE_KEY = 'esteticaClientas';

  const form = document.getElementById('registroForm');
  const formMsg = document.getElementById('formMsg');
  const tableBody = document.getElementById('clientTableBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const countBadge = document.getElementById('countBadge');
  const searchInput = document.getElementById('searchInput');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      if (btn.dataset.tab === 'list') renderTable();
    });
  });

  function getClients() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveClients(clients) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach((el) => { el.textContent = ''; });
  }

  function setError(field, message) {
    const el = form.querySelector(`.error[data-for="${field}"]`);
    if (el) el.textContent = message;
  }

  function validate(data) {
    let valid = true;
    if (!data.nombre.trim()) {
      setError('nombre', 'Ingresá el nombre completo.');
      valid = false;
    }
    if (!data.telefono.trim()) {
      setError('telefono', 'Ingresá un teléfono de contacto.');
      valid = false;
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('email', 'Ingresá un email válido.');
      valid = false;
    }
    if (!data.tratamiento) {
      setError('tratamiento', 'Seleccioná un tratamiento.');
      valid = false;
    }
    if (!data.consentimiento) {
      setError('consentimiento', 'Es necesario tu consentimiento para registrar el turno.');
      valid = false;
    }
    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    formMsg.textContent = '';
    formMsg.className = 'form-msg';

    const fd = new FormData(form);
    const data = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nombre: fd.get('nombre').trim(),
      telefono: fd.get('telefono').trim(),
      email: fd.get('email').trim(),
      nacimiento: fd.get('nacimiento'),
      direccion: fd.get('direccion').trim(),
      tipoPiel: fd.get('tipoPiel'),
      alergias: fd.get('alergias').trim(),
      tratamiento: fd.get('tratamiento'),
      fechaTurno: fd.get('fechaTurno'),
      conocio: fd.get('conocio'),
      consentimiento: fd.get('consentimiento') === 'on',
      registradaEl: new Date().toISOString(),
    };

    if (!validate(data)) {
      formMsg.textContent = 'Revisá los campos marcados en rojo.';
      formMsg.classList.add('error');
      return;
    }

    const clients = getClients();
    clients.push(data);
    saveClients(clients);

    form.reset();
    formMsg.textContent = `¡Gracias, ${data.nombre}! Tu registro fue guardado.`;
    formMsg.classList.add('success');
    renderTable();
  });

  function renderTable() {
    const clients = getClients();
    const query = (searchInput.value || '').toLowerCase().trim();
    const filtered = clients.filter((c) => {
      if (!query) return true;
      return c.nombre.toLowerCase().includes(query) || c.telefono.toLowerCase().includes(query);
    });

    countBadge.textContent = clients.length;

    tableBody.innerHTML = '';
    if (filtered.length === 0) {
      emptyMsg.style.display = 'block';
      emptyMsg.textContent = clients.length === 0
        ? 'Todavía no hay clientas registradas.'
        : 'No se encontraron resultados para la búsqueda.';
      return;
    }
    emptyMsg.style.display = 'none';

    filtered
      .slice()
      .sort((a, b) => new Date(b.registradaEl) - new Date(a.registradaEl))
      .forEach((c) => {
        const tr = document.createElement('tr');
        const registrada = new Date(c.registradaEl).toLocaleDateString('es-AR');
        tr.innerHTML = `
          <td>${escapeHtml(c.nombre)}</td>
          <td>${escapeHtml(c.telefono)}</td>
          <td>${escapeHtml(c.email) || '—'}</td>
          <td>${escapeHtml(c.tratamiento)}</td>
          <td>${escapeHtml(c.fechaTurno) || '—'}</td>
          <td>${registrada}</td>
          <td><button class="row-delete" title="Eliminar" data-id="${c.id}">🗑️</button></td>
        `;
        tableBody.appendChild(tr);
      });
  }

  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.row-delete');
    if (!btn) return;
    const id = btn.dataset.id;
    const clients = getClients().filter((c) => c.id !== id);
    saveClients(clients);
    renderTable();
  });

  searchInput.addEventListener('input', renderTable);

  clearAllBtn.addEventListener('click', () => {
    if (getClients().length === 0) return;
    if (confirm('¿Seguro que querés borrar todos los registros? Esta acción no se puede deshacer.')) {
      saveClients([]);
      renderTable();
    }
  });

  exportCsvBtn.addEventListener('click', () => {
    const clients = getClients();
    if (clients.length === 0) {
      alert('No hay clientas registradas para exportar.');
      return;
    }
    const headers = ['Nombre', 'Telefono', 'Email', 'Nacimiento', 'Direccion', 'TipoPiel', 'Alergias', 'Tratamiento', 'FechaTurno', 'ComoConocio', 'Registrada'];
    const rows = clients.map((c) => [
      c.nombre, c.telefono, c.email, c.nacimiento, c.direccion,
      c.tipoPiel, c.alergias, c.tratamiento, c.fechaTurno, c.conocio, c.registradaEl,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  renderTable();
})();
