// Backend gratuito para el registro de clientas, usando una Google Sheet como base de datos.
//
// Cómo instalarlo:
// 1. Creá una Google Sheet nueva (sheets.new).
// 2. Extensiones > Apps Script.
// 3. Borrá el contenido de Code.gs y pegá este archivo completo.
// 4. Implementar > Nueva implementación > tipo "Aplicación web".
//    - Ejecutar como: Yo (tu cuenta)
//    - Quién tiene acceso: Cualquier usuario
// 5. Copiá la URL de la aplicación web y pegala en esthetica-registro/js/config.js
//    como valor de window.SHEET_API_URL.
// 6. Una sola vez: en setAdminCredentials() de más abajo, cambiá el usuario y
//    contraseña de ejemplo por los tuyos, seleccioná esa función en el
//    desplegable de arriba del editor y tocá "Ejecutar". Después de correrla,
//    volvé a poner los valores de ejemplo (o dejá la función así, no se vuelve
//    a ejecutar sola) para no dejar tu contraseña real a la vista en el código.

const SHEET_NAME = 'Clientas';
const HEADERS = [
  'id', 'registradaEl', 'nombre', 'telefono', 'fechaTurno', 'hora', 'sede',
  'anticipo', 'precio', 'precioRetoque', 'conocio', 'servicio', 'disenoCejas',
  'grosor', 'curvatura', 'tecnica', 'longInterior', 'longCentro', 'longExterior',
  'formaOjos', 'alergias', 'alergiasDetalle', 'disenoNotas', 'nota',
  'mappingLeft', 'mappingRight',
];

const TURNO_DURATION_MIN = 150; // 2h30 fijas por turno, para detectar choques de horario
const SESSION_TTL_SECONDS = 21600; // 6 horas: el máximo que permite CacheService
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 900; // 15 minutos de bloqueo tras 5 intentos fallidos

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// --- Autenticación ---
//
// Ejecutar UNA SOLA VEZ, manualmente, desde el editor de Apps Script:
// cambiá 'CAMBIAR_USUARIO' / 'CAMBIAR_CONTRASEÑA' por tus datos reales,
// seleccioná "setAdminCredentials" en el desplegable de funciones y
// tocá "Ejecutar". La contraseña nunca se guarda en texto plano: se
// guarda solo un hash con sal en las Propiedades del script.
function setAdminCredentials() {
  const username = 'CAMBIAR_USUARIO';
  const password = 'CAMBIAR_CONTRASEÑA';
  const salt = Utilities.getUuid();
  const hash = hashPassword_(password, salt);
  PropertiesService.getScriptProperties().setProperties({
    ADMIN_USERNAME: username,
    ADMIN_PASSWORD_HASH: hash,
    ADMIN_PASSWORD_SALT: salt,
  });
}

function hashPassword_(password, salt) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + salt, Utilities.Charset.UTF_8);
  return bytes.map((b) => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function isLockedOut_() {
  const count = Number(CacheService.getScriptCache().get('loginFailCount') || 0);
  return count >= MAX_LOGIN_ATTEMPTS;
}

function recordFailedLogin_() {
  const cache = CacheService.getScriptCache();
  const count = Number(cache.get('loginFailCount') || 0) + 1;
  cache.put('loginFailCount', String(count), LOCKOUT_SECONDS);
}

function clearFailedLogins_() {
  CacheService.getScriptCache().remove('loginFailCount');
}

function login_(username, password) {
  const props = PropertiesService.getScriptProperties();
  const storedUser = props.getProperty('ADMIN_USERNAME');
  const storedHash = props.getProperty('ADMIN_PASSWORD_HASH');
  const salt = props.getProperty('ADMIN_PASSWORD_SALT');

  if (!storedUser || !storedHash) {
    return { ok: false, error: 'not_configured' };
  }
  if (isLockedOut_()) {
    return { ok: false, error: 'locked' };
  }
  if (username !== storedUser || hashPassword_(password || '', salt) !== storedHash) {
    recordFailedLogin_();
    return { ok: false, error: 'invalid_credentials' };
  }
  clearFailedLogins_();
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('session_' + token, 'admin', SESSION_TTL_SECONDS);
  return { ok: true, token: token };
}

function isValidToken_(token) {
  if (!token) return false;
  return CacheService.getScriptCache().get('session_' + token) === 'admin';
}

// --- Choque de horarios ---

function toMinutes_(hhmm) {
  if (!hhmm) return null;
  const parts = String(hhmm).split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function normalizeDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value || '').slice(0, 10);
}

function findConflict_(sheet, fechaTurno, hora) {
  const startMin = toMinutes_(hora);
  if (!fechaTurno || startMin === null) return false;
  const endMin = startMin + TURNO_DURATION_MIN;

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const fechaIdx = headers.indexOf('fechaTurno');
  const horaIdx = headers.indexOf('hora');
  if (fechaIdx === -1 || horaIdx === -1) return false;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0] === '') continue;
    if (normalizeDate_(row[fechaIdx]) !== normalizeDate_(fechaTurno)) continue;
    const rowStart = toMinutes_(row[horaIdx]);
    if (rowStart === null) continue;
    const rowEnd = rowStart + TURNO_DURATION_MIN;
    if (startMin < rowEnd && rowStart < endMin) return true;
  }
  return false;
}

// --- Endpoints ---

function doGet(e) {
  const token = e && e.parameter ? e.parameter.token : '';
  if (!isValidToken_(token)) {
    return jsonOutput_({ ok: false, error: 'unauthorized' });
  }

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1)
    .filter((row) => row[0] !== '')
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
  return jsonOutput_(rows);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const sheet = getSheet_();

  if (payload.action === 'login') {
    return jsonOutput_(login_(payload.username, payload.password));
  }

  if (payload.action === 'delete') {
    if (!isValidToken_(payload.token)) return jsonOutput_({ ok: false, error: 'unauthorized' });
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(payload.id)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return jsonOutput_({ ok: true });
  }

  if (payload.action === 'clearAll') {
    if (!isValidToken_(payload.token)) return jsonOutput_({ ok: false, error: 'unauthorized' });
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
    return jsonOutput_({ ok: true });
  }

  if (findConflict_(sheet, payload.fechaTurno, payload.hora)) {
    return jsonOutput_({ ok: false, error: 'conflict', message: 'Ese horario ya está ocupado. Elegí otro horario.' });
  }

  const row = HEADERS.map((h) => (payload[h] !== undefined ? payload[h] : ''));
  sheet.appendRow(row);
  return jsonOutput_({ ok: true });
}
