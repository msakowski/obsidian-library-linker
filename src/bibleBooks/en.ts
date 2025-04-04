import type { BibleBook } from '@/types';

export const bibleBooksEN: readonly Omit<BibleBook, 'chapters'>[] = [
  {
    id: 1,
    aliases: ['genesis'],
    name: {
      long: 'Genesis',
      medium: 'Gen.',
      short: 'Ge',
    },
  },
  {
    id: 2,
    aliases: ['exodus'],
    name: {
      long: 'Exodus',
      medium: 'Ex.',
      short: 'Ex',
    },
  },
  {
    id: 3,
    aliases: ['leviticus'],
    name: {
      long: 'Leviticus',
      medium: 'Le.',
      short: 'Le',
    },
  },
  {
    id: 4,
    aliases: ['numbers'],
    name: {
      long: 'Numbers',
      medium: 'Nu.',
      short: 'Nu',
    },
  },
  {
    id: 5,
    aliases: ['deuteronomy'],
    name: {
      long: 'Deuteronomy',
      medium: 'Deut.',
      short: 'De',
    },
  },
  {
    id: 6,
    aliases: ['joshua'],
    name: {
      long: 'Joshua',
      medium: 'Jos.',
      short: 'Jos',
    },
  },
  {
    id: 7,
    aliases: ['judges', 'jg'],
    name: {
      long: 'Judges',
      medium: 'Jg.',
      short: 'Jg',
    },
  },
  {
    id: 8,
    aliases: ['ruth'],
    name: {
      long: 'Ruth',
      medium: 'Ru.',
      short: 'Ru',
    },
  },
  {
    id: 9,
    prefix: '1',
    aliases: ['samuel'],
    name: {
      long: '1 Samuel',
      medium: '1 Sam.',
      short: '1Sa',
    },
  },
  {
    id: 10,
    prefix: '2',
    aliases: ['samuel'],
    name: {
      long: '2 Samuel',
      medium: '2 Sa.',
      short: '2Sa',
    },
  },
  {
    id: 11,
    prefix: '1',
    aliases: ['kings'],
    name: {
      long: '1 Kings',
      medium: '1 Ki.',
      short: '1Ki',
    },
  },
  {
    id: 12,
    prefix: '2',
    aliases: ['kings'],
    name: {
      long: '2 Kings',
      medium: '2 Ki.',
      short: '2Ki',
    },
  },
  {
    id: 13,
    prefix: '1',
    aliases: ['chronicles'],
    name: {
      long: '1 Chronicles',
      medium: '1 Ch.',
      short: '1Ch',
    },
  },
  {
    id: 14,
    prefix: '2',
    aliases: ['chronicles'],
    name: {
      long: '2 Chronicles',
      medium: '2 Ch.',
      short: '2Ch',
    },
  },
  {
    id: 15,
    aliases: ['ezra'],
    name: {
      long: 'Ezra',
      medium: 'Ezra',
      short: 'Ezr',
    },
  },
  {
    id: 16,
    aliases: ['nehemiah'],
    name: {
      long: 'Nehemiah',
      medium: 'Ne.',
      short: 'Ne',
    },
  },
  {
    id: 17,
    aliases: ['esther'],
    name: {
      long: 'Esther',
      medium: 'Es.',
      short: 'Es',
    },
  },
  {
    id: 18,
    aliases: ['job'],
    name: {
      long: 'Job',
      medium: 'Job',
      short: 'Job',
    },
  },
  {
    id: 19,
    aliases: ['psalms'],
    name: {
      long: 'Psalms',
      medium: 'Ps.',
      short: 'Ps',
    },
  },
  {
    id: 20,
    aliases: ['proverbs'],
    name: {
      long: 'Proverbs',
      medium: 'Prov.',
      short: 'Pr',
    },
  },
  {
    id: 21,
    aliases: ['ecclesiastes'],
    name: {
      long: 'Ecclesiastes',
      medium: 'Eccl.',
      short: 'Ec',
    },
  },
  {
    id: 22,
    aliases: ['can', 'songofsolomon', 'songofsongs'],
    name: {
      long: 'Song of Solomon',
      medium: 'Song of Sol.',
      short: 'Ca',
    },
  },
  {
    id: 23,
    aliases: ['isaiah'],
    name: {
      long: 'Isaiah',
      medium: 'Isa.',
      short: 'Isa',
    },
  },
  {
    id: 24,
    aliases: ['jeremiah'],
    name: {
      long: 'Jeremiah',
      medium: 'Jer.',
      short: 'Jer',
    },
  },
  {
    id: 25,
    aliases: ['lamentations'],
    name: {
      long: 'Lamentations',
      medium: 'La.',
      short: 'La',
    },
  },
  {
    id: 26,
    aliases: ['ezekiel'],
    name: {
      long: 'Ezekiel',
      medium: 'Eze.',
      short: 'Eze',
    },
  },
  {
    id: 27,
    aliases: ['daniel'],
    name: {
      long: 'Daniel',
      medium: 'Da.',
      short: 'Da',
    },
  },
  {
    id: 28,
    aliases: ['hosea'],
    name: {
      long: 'Hosea',
      medium: 'Ho.',
      short: 'Ho',
    },
  },
  {
    id: 29,
    aliases: ['joel'],
    name: {
      long: 'Joel',
      medium: 'Joel',
      short: 'Joe',
    },
  },
  {
    id: 30,
    aliases: ['amos'],
    name: {
      long: 'Amos',
      medium: 'Am.',
      short: 'Am',
    },
  },
  {
    id: 31,
    aliases: ['obadiah'],
    name: {
      long: 'Obadiah',
      medium: 'Ob.',
      short: 'Ob',
    },
  },
  {
    id: 32,
    aliases: ['jonah', 'jnh'],
    name: {
      long: 'Jonah',
      medium: 'Jon.',
      short: 'Jon',
    },
  },
  {
    id: 33,
    aliases: ['micah'],
    name: {
      long: 'Micah',
      medium: 'Mic.',
      short: 'Mic',
    },
  },
  {
    id: 34,
    aliases: ['nahum'],
    name: {
      long: 'Nahum',
      medium: 'Na.',
      short: 'Na',
    },
  },
  {
    id: 35,
    aliases: ['habakkuk'],
    name: {
      long: 'Habakkuk',
      medium: 'Hab.',
      short: 'Hab',
    },
  },
  {
    id: 36,
    aliases: ['zephaniah'],
    name: {
      long: 'Zephaniah',
      medium: 'Zep.',
      short: 'Zep',
    },
  },
  {
    id: 37,
    aliases: ['haggai'],
    name: {
      long: 'Haggai',
      medium: 'Hag.',
      short: 'Hag',
    },
  },
  {
    id: 38,
    aliases: ['zechariah'],
    name: {
      long: 'Zechariah',
      medium: 'Zec.',
      short: 'Zec',
    },
  },
  {
    id: 39,
    aliases: ['malachi'],
    name: {
      long: 'Malachi',
      medium: 'Mal.',
      short: 'Mal',
    },
  },
  {
    id: 40,
    aliases: ['matthew', 'mt'],
    name: {
      long: 'Matthew',
      medium: 'Matt.',
      short: 'Mt',
    },
  },
  {
    id: 41,
    aliases: ['mark', 'mr'],
    name: {
      long: 'Mark',
      medium: 'Mark',
      short: 'Mr',
    },
  },
  {
    id: 42,
    aliases: ['luke'],
    name: {
      long: 'Luke',
      medium: 'Luke',
      short: 'Lu',
    },
  },
  {
    id: 43,
    aliases: ['john'],
    name: {
      long: 'John',
      medium: 'John',
      short: 'Joh',
    },
  },
  {
    id: 44,
    aliases: ['acts'],
    name: {
      long: 'Acts',
      medium: 'Acts',
      short: 'Ac',
    },
  },
  {
    id: 45,
    aliases: ['romans'],
    name: {
      long: 'Romans',
      medium: 'Rom.',
      short: 'Ro',
    },
  },
  {
    id: 46,
    prefix: '1',
    aliases: ['corinthians'],
    name: {
      long: '1 Corinthians',
      medium: '1 Cor.',
      short: '1Co',
    },
  },
  {
    id: 47,
    prefix: '2',
    aliases: ['corinthians'],
    name: {
      long: '2 Corinthians',
      medium: '2 Cor.',
      short: '2Co',
    },
  },
  {
    id: 48,
    aliases: ['galatians'],
    name: {
      long: 'Galatians',
      medium: 'Gal.',
      short: 'Ga',
    },
  },
  {
    id: 49,
    aliases: ['ephesians'],
    name: {
      long: 'Ephesians',
      medium: 'Eph.',
      short: 'Eph',
    },
  },
  {
    id: 50,
    aliases: ['philippians', 'php'],
    name: {
      long: 'Philippians',
      medium: 'Phil.',
      short: 'Php',
    },
  },
  {
    id: 51,
    aliases: ['colossians'],
    name: {
      long: 'Colossians',
      medium: 'Col.',
      short: 'Col',
    },
  },
  {
    id: 52,
    prefix: '1',
    aliases: ['thessalonians'],
    name: {
      long: '1 Thessalonians',
      medium: '1 Thess.',
      short: '1Th',
    },
  },
  {
    id: 53,
    prefix: '2',
    aliases: ['thessalonians'],
    name: {
      long: '2 Thessalonians',
      medium: '2 Thess.',
      short: '2Th',
    },
  },
  {
    id: 54,
    prefix: '1',
    aliases: ['timothy'],
    name: {
      long: '1 Timothy',
      medium: '1 Tim.',
      short: '1Ti',
    },
  },
  {
    id: 55,
    prefix: '2',
    aliases: ['timothy'],
    name: {
      long: '2 Timothy',
      medium: '2 Tim.',
      short: '2Ti',
    },
  },
  {
    id: 56,
    aliases: ['titus'],
    name: {
      long: 'Titus',
      medium: 'Tit.',
      short: 'Tit',
    },
  },
  {
    id: 57,
    aliases: ['philemon', 'phm'],
    name: {
      long: 'Philemon',
      medium: 'Phil.',
      short: 'Phm',
    },
  },
  {
    id: 58,
    aliases: ['hebrews'],
    name: {
      long: 'Hebrews',
      medium: 'Heb.',
      short: 'Heb',
    },
  },
  {
    id: 59,
    aliases: ['james', 'jas'],
    name: {
      long: 'James',
      medium: 'Jas.',
      short: 'Jas',
    },
  },
  {
    id: 60,
    prefix: '1',
    aliases: ['peter'],
    name: {
      long: '1 Peter',
      medium: '1 Pet.',
      short: '1Pe',
    },
  },
  {
    id: 61,
    prefix: '2',
    aliases: ['peter'],
    name: {
      long: '2 Peter',
      medium: '2 Pet.',
      short: '2Pe',
    },
  },
  {
    id: 62,
    prefix: '1',
    aliases: ['john'],
    name: {
      long: '1 John',
      medium: '1 Jo.',
      short: '1Jo',
    },
  },
  {
    id: 63,
    prefix: '2',
    aliases: ['john'],
    name: {
      long: '2 John',
      medium: '2 Jo.',
      short: '2Jo',
    },
  },
  {
    id: 64,
    prefix: '3',
    aliases: ['john'],
    name: {
      long: '3 John',
      medium: '3 Jo.',
      short: '3Jo',
    },
  },
  {
    id: 65,
    aliases: ['jude'],
    name: {
      long: 'Jude',
      medium: 'Jude',
      short: 'Jude',
    },
  },
  {
    id: 66,
    aliases: ['revelation'],
    name: {
      long: 'Revelation',
      medium: 'Rev.',
      short: 'Re',
    },
  },
];
