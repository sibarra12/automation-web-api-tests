(() => {
  const STORAGE_KEY = 'esteticaClientas';
  const API_URL = window.SHEET_API_URL || '';
  const USE_REMOTE = Boolean(API_URL);

  const form = document.getElementById('registroForm');
  const formMsg = document.getElementById('formMsg');
  const tableBody = document.getElementById('clientTableBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const countBadge = document.getElementById('countBadge');
  const searchInput = document.getElementById('searchInput');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const syncNote = document.getElementById('syncNote');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  let currentClients = [];

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      if (btn.dataset.tab === 'list') renderTable();
    });
  });

  function getLocalClients() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLocalClients(clients) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }

  async function fetchRemoteClients() {
    const res = await fetch(API_URL, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function postRemote(payload) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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

  form.addEventListener('submit', async (e) => {
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

    const submitBtn = form.querySelector('.btn-primary');
    submitBtn.disabled = true;

    try {
      if (USE_REMOTE) {
        await postRemote(data);
      } else {
        const clients = getLocalClients();
        clients.push(data);
        saveLocalClients(clients);
      }
      form.reset();
      formMsg.textContent = `¡Gracias, ${data.nombre}! Tu registro fue guardado.`;
      formMsg.classList.add('success');
      await renderTable();
    } catch (err) {
      const clients = getLocalClients();
      clients.push(data);
      saveLocalClients(clients);
      form.reset();
      formMsg.textContent = 'No se pudo conectar con la planilla; tu registro quedó guardado localmente en este navegador.';
      formMsg.classList.add('error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  async function loadClients() {
    if (!USE_REMOTE) return getLocalClients();
    try {
      const remote = await fetchRemoteClients();
      if (syncNote) syncNote.textContent = '';
      return remote;
    } catch (err) {
      if (syncNote) syncNote.textContent = '⚠️ No se pudo conectar con la planilla compartida; mostrando datos guardados en este navegador.';
      return getLocalClients();
    }
  }

  async function renderTable() {
    currentClients = await loadClients();
    const query = (searchInput.value || '').toLowerCase().trim();
    const filtered = currentClients.filter((c) => {
      if (!query) return true;
      return String(c.nombre).toLowerCase().includes(query) || String(c.telefono).toLowerCase().includes(query);
    });

    countBadge.textContent = currentClients.length;

    tableBody.innerHTML = '';
    if (filtered.length === 0) {
      emptyMsg.style.display = 'block';
      emptyMsg.textContent = currentClients.length === 0
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

  tableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.row-delete');
    if (!btn) return;
    const id = btn.dataset.id;
    btn.disabled = true;
    try {
      if (USE_REMOTE) {
        await postRemote({ action: 'delete', id });
      } else {
        saveLocalClients(getLocalClients().filter((c) => c.id !== id));
      }
    } catch (err) {
      alert('No se pudo borrar el registro en la planilla compartida. Intentá de nuevo.');
    }
    await renderTable();
  });

  searchInput.addEventListener('input', renderTable);

  clearAllBtn.addEventListener('click', async () => {
    if (currentClients.length === 0) return;
    if (!confirm('¿Seguro que querés borrar todos los registros? Esta acción no se puede deshacer.')) return;
    try {
      if (USE_REMOTE) {
        await postRemote({ action: 'clearAll' });
      } else {
        saveLocalClients([]);
      }
    } catch (err) {
      alert('No se pudo borrar la planilla compartida. Intentá de nuevo.');
    }
    await renderTable();
  });

  exportCsvBtn.addEventListener('click', () => {
    if (currentClients.length === 0) {
      alert('No hay clientas registradas para exportar.');
      return;
    }
    const headers = ['Nombre', 'Telefono', 'Email', 'Nacimiento', 'Direccion', 'TipoPiel', 'Alergias', 'Tratamiento', 'FechaTurno', 'ComoConocio', 'Registrada'];
    const rows = currentClients.map((c) => [
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
