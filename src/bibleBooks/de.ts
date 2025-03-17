import type { BibleBook } from '@/types';

export const bibleBooksDE: readonly Omit<BibleBook, 'chapters'>[] = [
  {
    id: 1,
    prefix: '1',
    aliases: ['mose'],
    longName: '1. Mose',
    shortName: '1Mo',
  },
  {
    id: 2,
    prefix: '2',
    aliases: ['mose'],
    longName: '2. Mose',
    shortName: '2Mo',
  },
  {
    id: 3,
    prefix: '3',
    aliases: ['mose'],
    longName: '3. Mose',
    shortName: '3Mo',
  },
  {
    id: 4,
    prefix: '4',
    aliases: ['mose'],
    longName: '4. Mose',
    shortName: '4Mo',
  },
  {
    id: 5,
    prefix: '5',
    aliases: ['mose'],
    longName: '5. Mose',
    shortName: '5Mo',
  },
  {
    id: 6,
    aliases: ['josua'],
    longName: 'Josua',
    shortName: 'Jos',
  },
  {
    id: 7,
    aliases: ['richter'],
    longName: 'Richter',
    shortName: 'Ri',
  },
  {
    id: 8,
    aliases: ['ruth'],
    longName: 'Ruth',
    shortName: 'Ru',
  },
  {
    id: 9,
    prefix: '1',
    aliases: ['samuel'],
    longName: '1. Samuel',
    shortName: '1Sa',
  },
  {
    id: 10,
    prefix: '2',
    aliases: ['samuel'],
    longName: '2. Samuel',
    shortName: '2Sa',
  },
  {
    id: 11,
    prefix: '1',
    aliases: ['könige', 'koenige'],
    longName: '1. Könige',
    shortName: '1Kö',
  },
  {
    id: 12,
    prefix: '2',
    aliases: ['könige', 'koenige'],
    longName: '2. Könige',
    shortName: '2Kö',
  },
  {
    id: 13,
    prefix: '1',
    aliases: ['chronika'],
    longName: '1. Chronika',
    shortName: '1Ch',
  },
  {
    id: 14,
    prefix: '2',
    aliases: ['chronika'],
    longName: '2. Chronika',
    shortName: '2Ch',
  },
  {
    id: 15,
    aliases: ['esra'],
    longName: 'Esra',
    shortName: 'Esr',
  },
  {
    id: 16,
    aliases: ['nehemia'],
    longName: 'Nehemia',
    shortName: 'Ne',
  },
  {
    id: 17,
    aliases: ['esther'],
    longName: 'Esther',
    shortName: 'Est',
  },
  {
    id: 18,
    aliases: ['hiob'],
    longName: 'Hiob',
    shortName: 'Hi',
  },
  {
    id: 19,
    aliases: ['psalm'],
    longName: 'Psalm',
    shortName: 'Ps',
  },
  {
    id: 20,
    aliases: ['sprüche', 'sprueche'],
    longName: 'Sprüche',
    shortName: 'Spr',
  },
  {
    id: 21,
    aliases: ['prediger'],
    longName: 'Prediger',
    shortName: 'Pr',
  },
  {
    id: 22,
    aliases: ['hoheslied', 'hohes lied'],
    longName: 'Hohes Lied',
    shortName: 'Hoh',
  },
  {
    id: 23,
    aliases: ['jesaja'],
    longName: 'Jesaja',
    shortName: 'Jes',
  },
  {
    id: 24,
    aliases: ['jeremia'],
    longName: 'Jeremia',
    shortName: 'Jer',
  },
  {
    id: 25,
    aliases: ['klagelieder', 'klg'],
    longName: 'Klagelieder',
    shortName: 'Klg',
  },
  {
    id: 26,
    aliases: ['hesekiel'],
    longName: 'Hesekiel',
    shortName: 'Hes',
  },
  {
    id: 27,
    aliases: ['daniel'],
    longName: 'Daniel',
    shortName: 'Da',
  },
  {
    id: 28,
    aliases: ['hosea'],
    longName: 'Hosea',
    shortName: 'Hos',
  },
  {
    id: 29,
    aliases: ['joel'],
    longName: 'Joel',
    shortName: 'Joel',
  },
  {
    id: 30,
    aliases: ['amos'],
    longName: 'Amos',
    shortName: 'Am',
  },
  {
    id: 31,
    aliases: ['obadja'],
    longName: 'Obadja',
    shortName: 'Ob',
  },
  {
    id: 32,
    aliases: ['jona'],
    longName: 'Jona',
    shortName: 'Jon',
  },
  {
    id: 33,
    aliases: ['micha'],
    longName: 'Micha',
    shortName: 'Mi',
  },
  {
    id: 34,
    aliases: ['nahum'],
    longName: 'Nahum',
    shortName: 'Nah',
  },
  {
    id: 35,
    aliases: ['habakuk'],
    longName: 'Habakuk',
    shortName: 'Hab',
  },
  {
    id: 36,
    aliases: ['zephanja', 'zefanja'],
    longName: 'Zephanja',
    shortName: 'Ze',
  },
  {
    id: 37,
    aliases: ['haggai'],
    longName: 'Haggai',
    shortName: 'Hag',
  },
  {
    id: 38,
    aliases: ['sacharja'],
    longName: 'Sacharja',
    shortName: 'Sach',
  },
  {
    id: 39,
    aliases: ['maleachi'],
    longName: 'Maleachi',
    shortName: 'Mal',
  },
  {
    id: 40,
    aliases: ['matthäus', 'matthaeus', 'mtt'],
    longName: 'Matthäus',
    shortName: 'Mat',
  },
  {
    id: 41,
    aliases: ['markus'],
    longName: 'Markus',
    shortName: 'Mar',
  },
  {
    id: 42,
    aliases: ['lukas'],
    longName: 'Lukas',
    shortName: 'Luk',
  },
  {
    id: 43,
    aliases: ['johannes'],
    longName: 'Johannes',
    shortName: 'Joh',
  },
  {
    id: 44,
    aliases: ['apostelgeschichte', 'apg'],
    longName: 'Apostelgeschichte',
    shortName: 'Apg',
  },
  {
    id: 45,
    aliases: ['römer', 'roemer'],
    longName: 'Römer',
    shortName: 'Rö',
  },
  {
    id: 46,
    prefix: '1',
    aliases: ['korinther'],
    longName: '1. Korinther',
    shortName: '1Ko',
  },
  {
    id: 47,
    prefix: '2',
    aliases: ['korinther'],
    longName: '2. Korinther',
    shortName: '2Ko',
  },
  {
    id: 48,
    aliases: ['galater'],
    longName: 'Galater',
    shortName: 'Gal',
  },
  {
    id: 49,
    aliases: ['epheser'],
    longName: 'Epheser',
    shortName: 'Eph',
  },
  {
    id: 50,
    aliases: ['philipper'],
    longName: 'Philipper',
    shortName: 'Phil',
  },
  {
    id: 51,
    aliases: ['kolosser'],
    longName: 'Kolosser',
    shortName: 'Kol',
  },
  {
    id: 52,
    prefix: '1',
    aliases: ['thessalonicher'],
    longName: '1. Thessalonicher',
    shortName: '1Th',
  },
  {
    id: 53,
    prefix: '2',
    aliases: ['thessalonicher'],
    longName: '2. Thessalonicher',
    shortName: '2Th',
  },
  {
    id: 54,
    prefix: '1',
    aliases: ['timotheus'],
    longName: '1. Timotheus',
    shortName: '1Ti',
  },
  {
    id: 55,
    prefix: '2',
    aliases: ['timotheus'],
    longName: '2. Timotheus',
    shortName: '2Ti',
  },
  {
    id: 56,
    aliases: ['titus'],
    longName: 'Titus',
    shortName: 'Tit',
  },
  {
    id: 57,
    aliases: ['philemon', 'phlm', 'phm'],
    longName: 'Philemon',
    shortName: 'Phm',
  },
  {
    id: 58,
    aliases: ['hebräer', 'hebraeer'],
    longName: 'Hebräer',
    shortName: 'Heb',
  },
  {
    id: 59,
    aliases: ['jakobus'],
    longName: 'Jakobus',
    shortName: 'Jak',
  },
  {
    id: 60,
    prefix: '1',
    aliases: ['petrus'],
    longName: '1. Petrus',
    shortName: '1Pe',
  },
  {
    id: 61,
    prefix: '2',
    aliases: ['petrus'],
    longName: '2. Petrus',
    shortName: '2Pe',
  },
  {
    id: 62,
    prefix: '1',
    aliases: ['johannes'],
    longName: '1. Johannes',
    shortName: '1Jo',
  },
  {
    id: 63,
    prefix: '2',
    aliases: ['johannes'],
    longName: '2. Johannes',
    shortName: '2Jo',
  },
  {
    id: 64,
    prefix: '3',
    aliases: ['johannes'],
    longName: '3. Johannes',
    shortName: '3Jo',
  },
  {
    id: 65,
    aliases: ['judas'],
    longName: 'Judas',
    shortName: 'Jud',
  },
  {
    id: 66,
    aliases: ['offenbarung', 'offb'],
    longName: 'Offenbarung',
    shortName: 'Off',
  },
] as const;
