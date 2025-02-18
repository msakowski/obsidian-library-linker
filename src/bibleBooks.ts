export type BibleBookAbbreviations = readonly string[];
export type BibleBooks = readonly BibleBookAbbreviations[];

interface BibleBook {
  id: number;
  aliases: string[];
  longName: string;
  shortName: string;
}

export const bibleBooksDE: BibleBook[] = [
  {
    id: 1,
    aliases: ['1mo', '1.mo', '1mose', '1.mose'],
    longName: '1. Mose',
    shortName: '1Mo'
  },
  {
    id: 2,
    aliases: ['2mo', '2.mo', '2mose', '2.mose'],
    longName: '2. Mose',
    shortName: '2Mo'
  },
  {
    id: 3,
    aliases: ['3mo', '3.mo', '3mose', '3.mose'],
    longName: '3. Mose',
    shortName: '3Mo'
  },
  {
    id: 4,
    aliases: ['4mo', '4.mo', '4mose', '4.mose'],
    longName: '4. Mose',
    shortName: '4Mo'
  },
  {
    id: 5,
    aliases: ['5mo', '5.mo', '5mose', '5.mose'],
    longName: '5. Mose',
    shortName: '5Mo'
  },
  {
    id: 6,
    aliases: ['jos', 'josua'],
    longName: 'Josua',
    shortName: 'Jos'
  },
  {
    id: 7,
    aliases: ['ri', 'richt', 'richter'],
    longName: 'Richter',
    shortName: 'Ri'
  },
  {
    id: 8,
    aliases: ['ru', 'rut', 'ruth'],
    longName: 'Ruth',
    shortName: 'Ru'
  },
  {
    id: 9,
    aliases: ['1sam', '1.sam', '1samuel', '1.samuel'],
    longName: '1. Samuel',
    shortName: '1Sam'
  },
  {
    id: 10,
    aliases: ['2sam', '2.sam', '2samuel', '2.samuel'],
    longName: '2. Samuel',
    shortName: '2Sam'
  },
  {
    id: 11,
    aliases: ['1kö', '1.kö', '1kön', '1.kön', '1könige', '1.könige'],
    longName: '1. Könige',
    shortName: '1Kö'
  },
  {
    id: 12,
    aliases: ['2kö', '2.kö', '2kön', '2.kön', '2könige', '2.könige'],
    longName: '2. Könige',
    shortName: '2Kö'
  },
  {
    id: 13,
    aliases: ['1chr', '1.chr', '1chron', '1.chron', '1chronik', '1.chronik', '1chronika', '1.chronika'],
    longName: '1. Chronika',
    shortName: '1Chr'
  },
  {
    id: 14,
    aliases: ['2chr', '2.chr', '2chron', '2.chron', '2chronik', '2.chronik', '2chronika', '2.chronika'],
    longName: '2. Chronika',
    shortName: '2Chr'
  },
  {
    id: 15,
    aliases: ['esr', 'esra'],
    longName: 'Esra',
    shortName: 'Esr'
  },
  {
    id: 16,
    aliases: ['neh', 'nehem', 'nehemia'],
    longName: 'Nehemia',
    shortName: 'Neh'
  },
  {
    id: 17,
    aliases: ['est', 'esth', 'ester', 'esther'],
    longName: 'Esther',
    shortName: 'Esth'
  },
  {
    id: 18,
    aliases: ['hi', 'hiob'],
    longName: 'Hiob',
    shortName: 'Hi'
  },
  {
    id: 19,
    aliases: ['ps', 'psa', 'psalm', 'psalmen'],
    longName: 'Psalm',
    shortName: 'Ps'
  },
  {
    id: 20,
    aliases: ['spr', 'sprü', 'sprue', 'sprüche'],
    longName: 'Sprüche',
    shortName: 'Spr'
  },
  {
    id: 21,
    aliases: ['pred', 'prediger'],
    longName: 'Prediger',
    shortName: 'Pred'
  },
  {
    id: 22,
    aliases: ['hoh', 'hl', 'hoheslied', 'hohes lied'],
    longName: 'Hohes Lied',
    shortName: 'Hoh'
  },
  {
    id: 23,
    aliases: ['jes', 'jesaja'],
    longName: 'Jesaja',
    shortName: 'Jes'
  },
  {
    id: 24,
    aliases: ['jer', 'jeremia'],
    longName: 'Jeremia',
    shortName: 'Jer'
  },
  {
    id: 25,
    aliases: ['klag', 'klg', 'klgl', 'klagelieder'],
    longName: 'Klagelieder',
    shortName: 'Klg'
  },
  {
    id: 26,
    aliases: ['hes', 'hesekiel', 'ez', 'ezechiel'],
    longName: 'Hesekiel',
    shortName: 'Hes'
  },
  {
    id: 27,
    aliases: ['dan', 'daniel'],
    longName: 'Daniel',
    shortName: 'Dan'
  },
  {
    id: 28,
    aliases: ['hos', 'hosea'],
    longName: 'Hosea',
    shortName: 'Hos'
  },
  {
    id: 29,
    aliases: ['joe', 'joel'],
    longName: 'Joel',
    shortName: 'Joel'
  },
  {
    id: 30,
    aliases: ['am', 'amos'],
    longName: 'Amos',
    shortName: 'Am'
  },
  {
    id: 31,
    aliases: ['ob', 'obd', 'obadja'],
    longName: 'Obadja',
    shortName: 'Ob'
  },
  {
    id: 32,
    aliases: ['jon', 'jona'],
    longName: 'Jona',
    shortName: 'Jon'
  },
  {
    id: 33,
    aliases: ['mi', 'micha'],
    longName: 'Micha',
    shortName: 'Mi'
  },
  {
    id: 34,
    aliases: ['nah', 'nahum'],
    longName: 'Nahum',
    shortName: 'Nah'
  },
  {
    id: 35,
    aliases: ['hab', 'habakuk'],
    longName: 'Habakuk',
    shortName: 'Hab'
  },
  {
    id: 36,
    aliases: ['zeph', 'zefanja', 'zephanja'],
    longName: 'Zephanja',
    shortName: 'Zeph'
  },
  {
    id: 37,
    aliases: ['hag', 'haggai'],
    longName: 'Haggai',
    shortName: 'Hag'
  },
  {
    id: 38,
    aliases: ['sach', 'sacharja'],
    longName: 'Sacharja',
    shortName: 'Sach'
  },
  {
    id: 39,
    aliases: ['mal', 'maleachi'],
    longName: 'Maleachi',
    shortName: 'Mal'
  },
  {
    id: 40,
    aliases: ['mt', 'mat', 'matt', 'matth', 'matthäus'],
    longName: 'Matthäus',
    shortName: 'Mat'
  },
  {
    id: 41,
    aliases: ['mar', 'markus'],
    longName: 'Markus',
    shortName: 'Mar'
  },
  {
    id: 42,
    aliases: ['lk', 'luk', 'lukas'],
    longName: 'Lukas',
    shortName: 'Luk'
  },
  {
    id: 43,
    aliases: ['joh', 'johannes'],
    longName: 'Johannes',
    shortName: 'Joh'
  },
  {
    id: 44,
    aliases: ['apg', 'apostelgeschichte'],
    longName: 'Apostelgeschichte',
    shortName: 'Apg'
  },
  {
    id: 45,
    aliases: ['röm', 'römer'],
    longName: 'Römer',
    shortName: 'Röm'
  },
  {
    id: 46,
    aliases: ['1kor', '1.kor', '1korinther', '1.korinther'],
    longName: '1. Korinther',
    shortName: '1Kor'
  },
  {
    id: 47,
    aliases: ['2kor', '2.kor', '2korinther', '2.korinther'],
    longName: '2. Korinther',
    shortName: '2Kor'
  },
  {
    id: 48,
    aliases: ['gal', 'galater'],
    longName: 'Galater',
    shortName: 'Gal'
  },
  {
    id: 49,
    aliases: ['eph', 'epheser'],
    longName: 'Epheser',
    shortName: 'Eph'
  },
  {
    id: 50,
    aliases: ['phil', 'philipper'],
    longName: 'Philipper',
    shortName: 'Phil'
  },
  {
    id: 51,
    aliases: ['kol', 'kolosser'],
    longName: 'Kolosser',
    shortName: 'Kol'
  },
  {
    id: 52,
    aliases: ['1th', '1.th', '1thes', '1.thes', '1thessalonicher', '1.thessalonicher'],
    longName: '1. Thessalonicher',
    shortName: '1Th'
  },
  {
    id: 53,
    aliases: ['2th', '2.th', '2thes', '2.thes', '2thessalonicher', '2.thessalonicher'],
    longName: '2. Thessalonicher',
    shortName: '2Th'
  },
  {
    id: 54,
    aliases: ['1tim', '1.tim', '1timotheus', '1.timotheus'],
    longName: '1. Timotheus',
    shortName: '1Tim'
  },
  {
    id: 55,
    aliases: ['2tim', '2.tim', '2timotheus', '2.timotheus'],
    longName: '2. Timotheus',
    shortName: '2Tim'
  },
  {
    id: 56,
    aliases: ['tit', 'titus'],
    longName: 'Titus',
    shortName: 'Tit'
  },
  {
    id: 57,
    aliases: ['phm', 'phlm', 'philemon'],
    longName: 'Philemon',
    shortName: 'Phm'
  },
  {
    id: 58,
    aliases: ['hebr', 'heb', 'hebräer'],
    longName: 'Hebräer',
    shortName: 'Hebr'
  },
  {
    id: 59,
    aliases: ['jak', 'jakobus'],
    longName: 'Jakobus',
    shortName: 'Jak'
  },
  {
    id: 60,
    aliases: ['1pe', '1.pe', '1pet', '1.pet', '1petrus', '1.petrus'],
    longName: '1. Petrus',
    shortName: '1Pe'
  },
  {
    id: 61,
    aliases: ['2pe', '2.pe', '2pet', '2.pet', '2petrus', '2.petrus'],
    longName: '2. Petrus',
    shortName: '2Pe'
  },
  {
    id: 62,
    aliases: ['1joh', '1.joh', '1johannes', '1.johannes'],
    longName: '1. Johannes',
    shortName: '1Joh'
  },
  {
    id: 63,
    aliases: ['2joh', '2.joh', '2johannes', '2.johannes'],
    longName: '2. Johannes',
    shortName: '2Joh'
  },
  {
    id: 64,
    aliases: ['3joh', '3.joh', '3johannes', '3.johannes'],
    longName: '3. Johannes',
    shortName: '3Joh'
  },
  {
    id: 65,
    aliases: ['jud', 'judas'],
    longName: 'Judas',
    shortName: 'Jud'
  },
  {
    id: 66,
    aliases: ['off','offb', 'offenbarung', 'offenb'],
    longName: 'Offenbarung',
    shortName: 'Off'
  }
] as const;

// Type for accessing bible books by ID
export type BibleBookId = typeof bibleBooksDE[number]['id'];
