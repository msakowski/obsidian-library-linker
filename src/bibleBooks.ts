export type BibleBookAbbreviations = readonly string[];
export type BibleBooks = readonly BibleBookAbbreviations[];

export const bibleBooksDE = [
  { '1mo': '1. Mose' },
  { '2mo': '2. Mose' },
  { '3mo': '3. Mose' },
  { '4mo': '4. Mose' },
  { '5mo': '5. Mose' },
  { jos: 'Josua' },
  { ri: 'Richter' },
  { ru: 'Ruth' },
  { '1sam': '1. Samuel' },
  { '2sam': '2. Samuel' },
  { '1kö': '1. Könige' },
  { '2kö': '2. Könige' },
  { '1ch': '1. Chronika' },
  { '2ch': '2. Chronika' },
  { esr: 'Esra' },
  { neh: 'Nehemia' },
  { est: 'Esther' },
  { hi: 'Hiob' },
  { ps: 'Psalm' },
  { spr: 'Sprüche' },
  { pred: 'Prediger' },
  { hoh: 'Hohes Lied' },
  { jes: 'Jesaja' },
  { jer: 'Jeremia' },
  { klag: 'Klagelieder' },
  { hes: 'Hesekiel' },
  { dan: 'Daniel' },
  { hos: 'Hosea' },
  { joe: 'Joel' },
  { am: 'Amos' },
  { ob: 'Obadja' },
  { jon: 'Jona' },
  { mi: 'Micha' },
  { nah: 'Nahum' },
  { hab: 'Habakuk' },
  { zeph: 'Zephanja' },
  { hag: 'Haggai' },
  { sach: 'Sacharja' },
  { mal: 'Maleachi' },
  { mat: 'Matthäus' },
  { mar: 'Markus' },
  { luk: 'Lukas' },
  { joh: 'Johannes' },
  { apg: 'Apostelgeschichte' },
  { röm: 'Römer' },
  { '1kor': '1. Korinther' },
  { '2kor': '2. Korinther' },
  { gal: 'Galater' },
  { eph: 'Epheser' },
  { phil: 'Philipper' },
  { kol: 'Kolosser' },
  { '1thes': '1. Thessalonicher' },
  { '2thes': '2. Thessalonicher' },
  { '1tim': '1. Timotheus' },
  { '2tim': '2. Timotheus' },
  { tit: 'Titus' },
  { philem: 'Philemon' },
  { heb: 'Hebräer' },
  { jak: 'Jakobus' },
  { '1pet': '1. Petrus' },
  { '2pet': '2. Petrus' },
  { '1joh': '1. Johannes' },
  { '2joh': '2. Johannes' },
  { '3joh': '3. Johannes' },
  { jud: 'Judas' },
  { offb: 'Offenbarung' },
] as const;
