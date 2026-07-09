(() => {
  const STORAGE_KEY = 'esteticaClientas';
  const TOKEN_KEY = 'esteticaAdminToken';
  const API_URL = window.SHEET_API_URL || '';
  const USE_REMOTE = Boolean(API_URL);

  function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
  function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }
  function isLoggedIn() { return Boolean(getToken()); }

  const form = document.getElementById('registroForm');
  const formMsg = document.getElementById('formMsg');
  const tableBody = document.getElementById('clientTableBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const countBadge = document.getElementById('countBadge');
  const searchInput = document.getElementById('searchInput');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const syncNote = document.getElementById('syncNote');

  const calendarLabel = document.getElementById('calendarLabel');
  const calendarGrid = document.getElementById('calendarGrid');
  const dayDetail = document.getElementById('dayDetail');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const todayBtn = document.getElementById('todayBtn');

  const detailModal = document.getElementById('detailModal');
  const detailContent = document.getElementById('detailContent');
  const closeDetailModal = document.getElementById('closeDetailModal');

  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const tabListBtn = document.getElementById('tabListBtn');
  const tabCalendarBtn = document.getElementById('tabCalendarBtn');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  let currentClients = [];
  let calendarDate = new Date();
  let selectedDay = null;

  const mapCanvasLeft = document.getElementById('mapCanvasLeft');
  const mapCanvasRight = document.getElementById('mapCanvasRight');

  function drawEyeGuide(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 6;
    const rx = w / 2 - 24;
    const ry = h / 3;

    ctx.strokeStyle = '#d9be86';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy);
    ctx.quadraticCurveTo(cx, cy - ry, cx + rx, cy);
    ctx.quadraticCurveTo(cx, cy + ry * 0.55, cx - rx, cy);
    ctx.stroke();

    for (let i = -4; i <= 4; i++) {
      const t = i / 4;
      const x = cx + t * rx;
      const topY = cy - Math.sqrt(Math.max(0, 1 - t * t)) * ry;
      ctx.beginPath();
      ctx.moveTo(x, topY + 5);
      ctx.lineTo(x, topY - 6);
      ctx.stroke();
    }
  }

  function canvasPoint(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const src = evt.touches && evt.touches.length ? evt.touches[0] : evt;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function setupMappingCanvas(canvas) {
    if (!canvas) return;
    drawEyeGuide(canvas);
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let last = null;

    const start = (evt) => {
      evt.preventDefault();
      drawing = true;
      last = canvasPoint(canvas, evt);
    };
    const move = (evt) => {
      if (!drawing) return;
      evt.preventDefault();
      const p = canvasPoint(canvas, evt);
      ctx.strokeStyle = '#201f1c';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    };
    const end = () => { drawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
  }

  setupMappingCanvas(mapCanvasLeft);
  setupMappingCanvas(mapCanvasRight);

  const blankMappingLeft = mapCanvasLeft ? mapCanvasLeft.toDataURL('image/png') : '';
  const blankMappingRight = mapCanvasRight ? mapCanvasRight.toDataURL('image/png') : '';

  function mappingDataUrl(canvas, blank) {
    if (!canvas) return '';
    const url = canvas.toDataURL('image/png');
    return url === blank ? '' : url;
  }

  document.querySelectorAll('.mapping-clear-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const canvas = document.getElementById(btn.dataset.target);
      drawEyeGuide(canvas);
    });
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      if (btn.dataset.tab === 'list') renderTable();
      if (btn.dataset.tab === 'calendar') renderCalendar();
    });
  });

  function goToTab(tabName) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (btn) btn.click();
  }

  function applyAuthState() {
    const loggedIn = isLoggedIn();
    tabListBtn.hidden = !loggedIn;
    tabCalendarBtn.hidden = !loggedIn;
    loginBtn.hidden = loggedIn;
    logoutBtn.hidden = !loggedIn;

    const activeBtn = document.querySelector('.tab-btn.active');
    const onRestrictedTab = activeBtn && (activeBtn.dataset.tab === 'list' || activeBtn.dataset.tab === 'calendar');
    if (!loggedIn && onRestrictedTab) goToTab('form');
  }

  function openLogin() {
    loginError.textContent = '';
    loginForm.reset();
    loginModal.classList.remove('hidden');
  }

  function closeLogin() {
    loginModal.classList.add('hidden');
  }

  loginBtn.addEventListener('click', openLogin);
  closeLoginModal.addEventListener('click', closeLogin);
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLogin();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const fd = new FormData(loginForm);
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const result = await postRemote({
        action: 'login',
        username: fd.get('username'),
        password: fd.get('password'),
      });
      if (result.ok) {
        setToken(result.token);
        closeLogin();
        applyAuthState();
        goToTab('list');
      } else if (result.error === 'locked') {
        loginError.textContent = 'Demasiados intentos fallidos. Probá de nuevo en unos minutos.';
      } else {
        loginError.textContent = 'Usuario o contraseña incorrectos.';
      }
    } catch (err) {
      loginError.textContent = 'No se pudo conectar. Intentá de nuevo.';
    } finally {
      submitBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearToken();
    applyAuthState();
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
    const url = `${API_URL}?token=${encodeURIComponent(getToken() || '')}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) {
      if (data && data.error === 'unauthorized') {
        clearToken();
        applyAuthState();
      }
      throw new Error((data && data.error) || 'unauthorized');
    }
    return data;
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

  const DETAIL_FIELDS = [
    ['fechaTurno', 'Fecha del turno'],
    ['hora', 'Hora'],
    ['sede', 'Sede'],
    ['precio', 'Precio'],
    ['anticipo', 'Anticipo'],
    ['precioRetoque', 'Precio de retoque'],
    ['conocio', '¿Cómo nos conoció?'],
    ['servicio', 'Servicio'],
    ['disenoCejas', 'Diseño de cejas'],
    ['grosor', 'Grosor'],
    ['curvatura', 'Curvatura'],
    ['tecnica', 'Técnica / Efecto'],
    ['longInterior', 'Longitud interior'],
    ['longCentro', 'Longitud centro'],
    ['longExterior', 'Longitud exterior'],
    ['formaOjos', 'Forma de ojos'],
    ['alergias', 'Alergias'],
    ['alergiasDetalle', 'Detalle de alergias'],
    ['disenoNotas', 'Notas del mapping / diseño'],
    ['nota', 'Nota'],
  ];

  function findClientById(id) {
    return currentClients.find((c) => c.id === id);
  }

  function openDetail(client) {
    if (!client) return;
    const rows = DETAIL_FIELDS
      .filter(([key]) => client[key])
      .map(([key, label]) => `
        <div class="detail-item${key === 'disenoNotas' || key === 'nota' ? ' full' : ''}">
          <span class="detail-label">${label}</span>
          <span class="detail-value">${escapeHtml(client[key])}</span>
        </div>
      `).join('');

    const mappingImgs = [
      client.mappingLeft ? `<img src="${client.mappingLeft}" title="Ojo izquierdo" data-full="${client.mappingLeft}">` : '',
      client.mappingRight ? `<img src="${client.mappingRight}" title="Ojo derecho" data-full="${client.mappingRight}">` : '',
    ].join('');

    detailContent.innerHTML = `
      <h3>${escapeHtml(client.nombre)}</h3>
      <p class="muted">${escapeHtml(client.telefono)}</p>
      <div class="detail-grid">${rows || '<p class="empty-msg">Sin datos adicionales.</p>'}</div>
      ${mappingImgs ? `<span class="detail-label">Mapping</span><div class="detail-mapping-imgs">${mappingImgs}</div>` : ''}
    `;
    detailModal.classList.remove('hidden');
  }

  function closeDetail() {
    detailModal.classList.add('hidden');
  }

  closeDetailModal.addEventListener('click', closeDetail);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeDetail();
  });
  detailModal.addEventListener('click', (e) => {
    const img = e.target.closest('.detail-mapping-imgs img');
    if (img) {
      const win = window.open();
      if (win) win.document.write(`<img src="${img.dataset.full}" style="max-width:100%">`);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetail();
      closeLogin();
    }
  });

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
    if (!data.servicio) {
      setError('servicio', 'Seleccioná un servicio.');
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
      fechaTurno: fd.get('fechaTurno'),
      hora: fd.get('hora'),
      sede: fd.get('sede').trim(),
      anticipo: fd.get('anticipo'),
      precio: fd.get('precio'),
      precioRetoque: fd.get('precioRetoque'),
      conocio: fd.get('conocio'),
      servicio: fd.get('servicio'),
      disenoCejas: fd.get('disenoCejas'),
      grosor: fd.get('grosor'),
      curvatura: fd.get('curvatura'),
      tecnica: fd.get('tecnica'),
      longInterior: fd.get('longInterior'),
      longCentro: fd.get('longCentro'),
      longExterior: fd.get('longExterior'),
      formaOjos: fd.get('formaOjos'),
      alergias: fd.get('alergias'),
      alergiasDetalle: fd.get('alergiasDetalle').trim(),
      disenoNotas: fd.get('disenoNotas').trim(),
      nota: fd.get('nota').trim(),
      mappingLeft: mappingDataUrl(mapCanvasLeft, blankMappingLeft),
      mappingRight: mappingDataUrl(mapCanvasRight, blankMappingRight),
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
        const result = await postRemote(data);
        if (result && result.ok === false) {
          formMsg.textContent = result.error === 'conflict'
            ? (result.message || 'Ese horario ya está ocupado. Elegí otro horario.')
            : 'No se pudo registrar el turno. Intentá de nuevo o contactanos directamente.';
          formMsg.classList.add('error');
          return;
        }
      } else {
        const clients = getLocalClients();
        clients.push(data);
        saveLocalClients(clients);
      }
      form.reset();
      if (mapCanvasLeft) drawEyeGuide(mapCanvasLeft);
      if (mapCanvasRight) drawEyeGuide(mapCanvasRight);
      formMsg.textContent = `¡Gracias, ${data.nombre}! Tu registro fue guardado.`;
      formMsg.classList.add('success');
      if (isLoggedIn()) await renderTable();
    } catch (err) {
      const clients = getLocalClients();
      clients.push(data);
      saveLocalClients(clients);
      form.reset();
      if (mapCanvasLeft) drawEyeGuide(mapCanvasLeft);
      if (mapCanvasRight) drawEyeGuide(mapCanvasRight);
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
        tr.dataset.id = c.id;
        const registrada = new Date(c.registradaEl).toLocaleDateString('es-AR');
        const mappingCell = [
          c.mappingLeft ? `<img src="${c.mappingLeft}" class="mapping-thumb" title="Ojo izquierdo" data-full="${c.mappingLeft}" />` : '',
          c.mappingRight ? `<img src="${c.mappingRight}" class="mapping-thumb" title="Ojo derecho" data-full="${c.mappingRight}" />` : '',
        ].join('') || '—';
        tr.innerHTML = `
          <td>${escapeHtml(c.nombre)}</td>
          <td>${escapeHtml(c.telefono)}</td>
          <td>${escapeHtml(c.servicio) || '—'}</td>
          <td>${escapeHtml(c.tecnica) || '—'}</td>
          <td>${escapeHtml(c.fechaTurno) || '—'}</td>
          <td>${mappingCell}</td>
          <td>${registrada}</td>
          <td><button class="row-delete" title="Eliminar" data-id="${c.id}">🗑️</button></td>
        `;
        tableBody.appendChild(tr);
      });
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async function renderCalendar() {
    currentClients = await loadClients();

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    calendarLabel.textContent = capitalize(calendarDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }));

    const turnosByDay = {};
    currentClients.forEach((c) => {
      if (!c.fechaTurno) return;
      const key = String(c.fechaTurno).slice(0, 10);
      (turnosByDay[key] = turnosByDay[key] || []).push(c);
    });

    const firstWeekday = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    calendarGrid.innerHTML = '';

    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-cell cal-blank';
      calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const turnos = turnosByDay[dateStr] || [];

      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      if (dateStr === todayStr) cell.classList.add('cal-today');
      if (turnos.length) cell.classList.add('cal-has-turnos');
      if (dateStr === selectedDay) cell.classList.add('cal-selected');
      cell.innerHTML = `
        <span class="cal-daynum">${day}</span>
        ${turnos.length ? `<span class="cal-badge">${turnos.length}</span>` : ''}
      `;
      cell.addEventListener('click', () => {
        selectedDay = dateStr;
        renderCalendar();
      });
      calendarGrid.appendChild(cell);
    }

    renderDayDetail(selectedDay, selectedDay ? (turnosByDay[selectedDay] || []) : []);
  }

  function renderDayDetail(dateStr, turnos) {
    if (!dateStr) {
      dayDetail.innerHTML = '<p class="empty-msg">Hacé clic en un día para ver los turnos agendados.</p>';
      return;
    }
    const label = capitalize(new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
    }));
    if (turnos.length === 0) {
      dayDetail.innerHTML = `<h3>${label}</h3><p class="empty-msg">No hay turnos agendados este día.</p>`;
      return;
    }
    const sorted = turnos.slice().sort((a, b) => String(a.hora || '99:99').localeCompare(String(b.hora || '99:99')));

    dayDetail.innerHTML = `
      <h3>${label} · ${turnos.length} turno${turnos.length > 1 ? 's' : ''}</h3>
      <ul class="day-turnos-list">
        ${sorted.map((c) => `
          <li data-id="${c.id}">
            ${c.hora ? `<span class="turno-hora">${escapeHtml(c.hora)}</span>` : ''}
            <strong>${escapeHtml(c.nombre)}</strong> — ${escapeHtml(c.servicio)}${c.tecnica ? ` (${escapeHtml(c.tecnica)})` : ''}<br>
            <span class="muted">${escapeHtml(c.telefono)}</span>
            ${c.mappingLeft || c.mappingRight ? `<br>${c.mappingLeft ? `<img src="${c.mappingLeft}" class="mapping-thumb" title="Ojo izquierdo">` : ''}${c.mappingRight ? `<img src="${c.mappingRight}" class="mapping-thumb" title="Ojo derecho">` : ''}` : ''}
          </li>
        `).join('')}
      </ul>
    `;
  }

  dayDetail.addEventListener('click', (e) => {
    const li = e.target.closest('.day-turnos-list li[data-id]');
    if (li) openDetail(findClientById(li.dataset.id));
  });

  prevMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });

  todayBtn.addEventListener('click', () => {
    calendarDate = new Date();
    selectedDay = new Date().toISOString().slice(0, 10);
    renderCalendar();
  });

  tableBody.addEventListener('click', async (e) => {
    const thumb = e.target.closest('.mapping-thumb');
    if (thumb) {
      const win = window.open();
      if (win) win.document.write(`<img src="${thumb.dataset.full}" style="max-width:100%">`);
      return;
    }
    const btn = e.target.closest('.row-delete');
    if (btn) {
      const id = btn.dataset.id;
      btn.disabled = true;
      try {
        if (USE_REMOTE) {
          const result = await postRemote({ action: 'delete', id, token: getToken() });
          if (result && result.ok === false) {
            if (result.error === 'unauthorized') {
              clearToken();
              applyAuthState();
              alert('Tu sesión expiró. Iniciá sesión de nuevo.');
            } else {
              alert('No se pudo borrar el registro. Intentá de nuevo.');
            }
          }
        } else {
          saveLocalClients(getLocalClients().filter((c) => c.id !== id));
        }
      } catch (err) {
        alert('No se pudo borrar el registro en la planilla compartida. Intentá de nuevo.');
      }
      await renderTable();
      return;
    }
    const row = e.target.closest('tr[data-id]');
    if (row) openDetail(findClientById(row.dataset.id));
  });

  searchInput.addEventListener('input', renderTable);

  clearAllBtn.addEventListener('click', async () => {
    if (currentClients.length === 0) return;
    if (!confirm('¿Seguro que querés borrar todos los registros? Esta acción no se puede deshacer.')) return;
    try {
      if (USE_REMOTE) {
        const result = await postRemote({ action: 'clearAll', token: getToken() });
        if (result && result.ok === false) {
          if (result.error === 'unauthorized') {
            clearToken();
            applyAuthState();
            alert('Tu sesión expiró. Iniciá sesión de nuevo.');
          } else {
            alert('No se pudo borrar la planilla compartida. Intentá de nuevo.');
          }
        }
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
    const headers = [
      'Nombre', 'Telefono', 'FechaTurno', 'Hora', 'Sede', 'Anticipo', 'Precio', 'PrecioRetoque', 'ComoConocio',
      'Servicio', 'DisenoCejas', 'Grosor', 'Curvatura', 'Tecnica',
      'LongInterior', 'LongCentro', 'LongExterior', 'FormaOjos',
      'Alergias', 'AlergiasDetalle', 'DisenoNotas', 'Nota', 'Registrada',
    ];
    const rows = currentClients.map((c) => [
      c.nombre, c.telefono, c.fechaTurno, c.hora, c.sede, c.anticipo, c.precio, c.precioRetoque, c.conocio,
      c.servicio, c.disenoCejas, c.grosor, c.curvatura, c.tecnica,
      c.longInterior, c.longCentro, c.longExterior, c.formaOjos,
      c.alergias, c.alergiasDetalle, c.disenoNotas, c.nota, c.registradaEl,
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

  applyAuthState();
  if (isLoggedIn()) renderTable();
})();
