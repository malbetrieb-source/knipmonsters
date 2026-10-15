/**
 * Capaldi Kids – scores naar Google Sheets
 * Plak dit in: Spreadsheet > Extensies > Apps Script, en publiceer als web-app
 * (Uitvoeren als: ik, Toegang: iedereen). Zie README in deze map.
 */
const TAB = 'Scores';
const KOP = ['Datum', 'Tijd', 'Bijnaam', 'Spel', 'Groep', 'Score', 'Sterren', 'Tablet', 'Id'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = blad_();
    const rijen = [].concat(JSON.parse(e.postData.contents || '[]'));
    const n = Math.max(0, sh.getLastRow() - 1);
    const bekend = new Set(n ? sh.getRange(2, 9, n, 1).getValues().flat().map(String) : []);
    const nieuw = [];
    rijen.forEach(r => {
      const id = String(r.id || '');
      if (!id || bekend.has(id)) return;
      bekend.add(id);
      const d = new Date(Number(r.d) || Date.now());
      nieuw.push([
        Utilities.formatDate(d, 'Europe/Amsterdam', 'yyyy-MM-dd'),
        Utilities.formatDate(d, 'Europe/Amsterdam', 'HH:mm'),
        veilig_(r.nick, 16), veilig_(r.game, 40), veilig_(r.group, 20),
        Number(r.score) || 0, Number(r.stars) || 0, veilig_(r.tablet, 20), id
      ]);
    });
    if (nieuw.length) {
      const r0 = sh.getLastRow() + 1;
      sh.getRange(r0, 1, nieuw.length, 2).setNumberFormat('@'); // datum en tijd als tekst
      sh.getRange(r0, 1, nieuw.length, KOP.length).setValues(nieuw);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true, toegevoegd: nieuw.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Capaldi Kids scorekoppeling is actief.');
}

function blad_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(KOP);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, KOP.length).setFontWeight('bold').setBackground('#fff2c2');
    maakOverzicht_(ss);
  }
  return sh;
}

// Tabblad met de beste score per spel en groep, per maand
function maakOverzicht_(ss) {
  if (ss.getSheetByName('Winnaars per maand')) return;
  const o = ss.insertSheet('Winnaars per maand');
  o.getRange('A1').setValue('Maand (jjjj-mm):');
  o.getRange('B1').setFormula('=TEXT(TODAY(),"yyyy-mm")');
  o.getRange('A3').setFormula(
    '=QUERY(Scores!A:I,"select D, E, max(F) where A starts with \'"&B1&"\' group by D, E order by D, E label max(F) \'Beste score\'",1)');
  o.getRange('A1:B1').setFontWeight('bold');
  o.setColumnWidths(1, 3, 180);
}

// voorkomt dat een bijnaam als formule wordt gelezen
function veilig_(v, max) {
  let s = String(v == null ? '' : v).slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
