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

const SHEET_NAME = 'Clientas';
const HEADERS = [
  'id', 'registradaEl', 'nombre', 'telefono', 'fechaTurno', 'hora', 'sede',
  'anticipo', 'precio', 'precioRetoque', 'conocio', 'servicio', 'disenoCejas',
  'grosor', 'curvatura', 'tecnica', 'longInterior', 'longCentro', 'longExterior',
  'formaOjos', 'alergias', 'alergiasDetalle', 'disenoNotas', 'nota',
  'mappingLeft', 'mappingRight',
];

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

function doGet(e) {
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

  if (payload.action === 'delete') {
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
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
    return jsonOutput_({ ok: true });
  }

  const row = HEADERS.map((h) => (payload[h] !== undefined ? payload[h] : ''));
  sheet.appendRow(row);
  return jsonOutput_({ ok: true });
}
