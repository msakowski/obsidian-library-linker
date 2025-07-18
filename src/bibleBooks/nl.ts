import type { BibleBook } from '@/types';

export const bibleBooksNL: readonly Omit<BibleBook, 'chapters'>[] = [
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
    aliases: ['numeri'],
    name: {
      long: 'Numeri',
      medium: 'Nu.',
      short: 'Nu',
    },
  },
  {
    id: 5,
    aliases: ['deuteronium'],
    name: {
      long: 'Deuteronomium',
      medium: 'Deut.',
      short: 'De',
    },
  },
  {
    id: 6,
    aliases: ['jozua'],
    name: {
      long: 'Jozua',
      medium: 'Joz.',
      short: 'Joz',
    },
  },
  {
    id: 7,
    aliases: ['rechters'],
    name: {
      long: 'Rechters',
      medium: 'Recht.',
      short: 'Re',
    },
  },
  {
    id: 8,
    aliases: ['ruth'],
    name: {
      long: 'Ruth',
      medium: 'Ruth',
      short: 'Ru',
    },
  },
  {
    id: 9,
    prefix: '1',
    aliases: ['samuël', 'samuel'],
    name: {
      long: '1 Samuël',
      medium: '1 Sam.',
      short: '1Sa',
    },
  },
  {
    id: 10,
    prefix: '2',
    aliases: ['samuël', 'samuel'],
    name: {
      long: '2 Samuël',
      medium: '2 Sam.',
      short: '2Sa',
    },
  },
  {
    id: 11,
    prefix: '1',
    aliases: ['koningen'],
    name: {
      long: '1 Koningen',
      medium: '1 Kon.',
      short: '1Ko',
    },
  },
  {
    id: 12,
    prefix: '2',
    aliases: ['koningen'],
    name: {
      long: '2 Koningen',
      medium: '2 Kon.',
      short: '2Ko',
    },
  },
  {
    id: 13,
    prefix: '1',
    aliases: ['kronieken'],
    name: {
      long: '1 Kronieken',
      medium: '1 Kron.',
      short: '1Kr',
    },
  },
  {
    id: 14,
    prefix: '2',
    aliases: ['kronieken'],
    name: {
      long: '2 Kronieken',
      medium: '2 Kron.',
      short: '2Kr',
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
    aliases: ['nehemia'],
    name: {
      long: 'Nehemia',
      medium: 'Neh.',
      short: 'Ne',
    },
  },
  {
    id: 17,
    aliases: ['esther'],
    name: {
      long: 'Esther',
      medium: 'Est.',
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
    aliases: ['psalmen', 'psalm'],
    name: {
      long: 'Psalmen',
      medium: 'Ps.',
      short: 'Ps',
    },
  },
  {
    id: 20,
    aliases: ['spreuken'],
    name: {
      long: 'Spreuken',
      medium: 'Spr.',
      short: 'Spr',
    },
  },
  {
    id: 21,
    aliases: ['prediker'],
    name: {
      long: 'Prediker',
      medium: 'Pred.',
      short: 'Pr',
    },
  },
  {
    id: 22,
    aliases: ['hooglied'],
    name: {
      long: 'Hooglied',
      medium: 'Hoogl.',
      short: 'Hgl',
    },
  },
  {
    id: 23,
    aliases: ['jesaja'],
    name: {
      long: 'Jesaja',
      medium: 'Jes.',
      short: 'Jes',
    },
  },
  {
    id: 24,
    aliases: ['jeremia'],
    name: {
      long: 'Jeremia',
      medium: 'Jer.',
      short: 'Jer',
    },
  },
  {
    id: 25,
    aliases: ['klaagliederen'],
    name: {
      long: 'Klaagliederen',
      medium: 'Klaagl.',
      short: 'Klg',
    },
  },
  {
    id: 26,
    aliases: ['ezechiël', 'ezechiel'],
    name: {
      long: 'Ezechiël',
      medium: 'Ez.',
      short: 'Ez',
    },
  },
  {
    id: 27,
    aliases: ['daniël', 'daniel'],
    name: {
      long: 'Daniël',
      medium: 'Dan.',
      short: 'Da',
    },
  },
  {
    id: 28,
    aliases: ['hosea'],
    name: {
      long: 'Hosea',
      medium: 'Hos.',
      short: 'Ho',
    },
  },
  {
    id: 29,
    aliases: ['joël', 'joel'],
    name: {
      long: 'Joël',
      medium: 'Joël',
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
    aliases: ['obadja'],
    name: {
      long: 'Obadja',
      medium: 'Ob.',
      short: 'Ob',
    },
  },
  {
    id: 32,
    aliases: ['jona'],
    name: {
      long: 'Jona',
      medium: 'Jona',
      short: 'Jon',
    },
  },
  {
    id: 33,
    aliases: ['micha'],
    name: {
      long: 'Micha',
      medium: 'Mi.',
      short: 'Mi',
    },
  },
  {
    id: 34,
    aliases: ['nahum'],
    name: {
      long: 'Nahum',
      medium: 'Nah.',
      short: 'Nah',
    },
  },
  {
    id: 35,
    aliases: ['habakuk'],
    name: {
      long: 'Habakuk',
      medium: 'Hab.',
      short: 'Hab',
    },
  },
  {
    id: 36,
    aliases: ['Zefanja'],
    name: {
      long: 'Zefanja',
      medium: 'Zef.',
      short: 'Ze',
    },
  },
  {
    id: 37,
    aliases: ['haggaï', 'haggai'],
    name: {
      long: 'Haggaï',
      medium: 'Hag.',
      short: 'Hag',
    },
  },
  {
    id: 38,
    aliases: ['zacharia'],
    name: {
      long: 'Zacharia',
      medium: 'Zach.',
      short: 'Za',
    },
  },
  {
    id: 39,
    aliases: ['maleachi'],
    name: {
      long: 'Maleachi',
      medium: 'Mal.',
      short: 'Mal',
    },
  },
  {
    id: 40,
    aliases: ['mattheüs', 'mattheus'],
    name: {
      long: 'Mattheüs',
      medium: 'Mat.',
      short: 'Mt',
    },
  },
  {
    id: 41,
    aliases: ['markus'],
    name: {
      long: 'Markus',
      medium: 'Mar.',
      short: 'Mr',
    },
  },
  {
    id: 42,
    aliases: ['lukas'],
    name: {
      long: 'Lukas',
      medium: 'Luk.',
      short: 'Lu',
    },
  },
  {
    id: 43,
    aliases: ['johannes'],
    name: {
      long: 'Johannes',
      medium: 'Joh.',
      short: 'Jo',
    },
  },
  {
    id: 44,
    aliases: ['handelingen'],
    name: {
      long: 'Handelingen',
      medium: 'Hand.',
      short: 'Han',
    },
  },
  {
    id: 45,
    aliases: ['romeinen'],
    name: {
      long: 'Romeinen',
      medium: 'Rom.',
      short: 'Ro',
    },
  },
  {
    id: 46,
    prefix: '1',
    aliases: ['korinthe', 'korintiërs', 'korintiers'],
    name: {
      long: '1 Korinthe',
      medium: '1 Kor.',
      short: '1Kor',
    },
  },
  {
    id: 47,
    prefix: '2',
    aliases: ['korinthe', 'korintiërs', 'korintiers'],
    name: {
      long: '2 Korinthe',
      medium: '2 Kor.',
      short: '2Kor',
    },
  },
  {
    id: 48,
    aliases: ['galaten'],
    name: {
      long: 'Galaten',
      medium: 'Gal.',
      short: 'Ga',
    },
  },
  {
    id: 49,
    aliases: ['efeziërs', 'efeziers'],
    name: {
      long: 'Efeziërs',
      medium: 'Ef.',
      short: 'Ef',
    },
  },
  {
    id: 50,
    aliases: ['filippenzen'],
    name: {
      long: 'Filippenzen',
      medium: 'Fil.',
      short: 'Fil',
    },
  },
  {
    id: 51,
    aliases: ['kolossenzen'],
    name: {
      long: 'Kolossenzen',
      medium: 'Kol.',
      short: 'Kol',
    },
  },
  {
    id: 52,
    prefix: '1',
    aliases: ['thessalonicenzen'],
    name: {
      long: '1 Thessalonicenzen',
      medium: '1 Thess.',
      short: '1Th',
    },
  },
  {
    id: 53,
    prefix: '2',
    aliases: ['thessalonicenzen'],
    name: {
      long: '2 Thessalonicenzen',
      medium: '2 Thess.',
      short: '2Th',
    },
  },
  {
    id: 54,
    prefix: '1',
    aliases: ['timotheüs', 'timotheus'],
    name: {
      long: '1 Timotheüs',
      medium: '1 Tim.',
      short: '1Ti',
    },
  },
  {
    id: 55,
    prefix: '2',
    aliases: ['timotheüs', 'timotheus'],
    name: {
      long: '2 Timotheüs',
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
    aliases: ['filemon'],
    name: {
      long: 'Filemon',
      medium: 'Filem.',
      short: 'Flm',
    },
  },
  {
    id: 58,
    aliases: ['hebreeën', 'hebreeen'],
    name: {
      long: 'Hebreeën',
      medium: 'Heb.',
      short: 'Heb',
    },
  },
  {
    id: 59,
    aliases: ['jakobus'],
    name: {
      long: 'Jakobus',
      medium: 'Jak.',
      short: 'Jak',
    },
  },
  {
    id: 60,
    prefix: '1',
    aliases: ['petrus'],
    name: {
      long: '1 Petrus',
      medium: '1 Pet.',
      short: '1Pe',
    },
  },
  {
    id: 61,
    prefix: '2',
    aliases: ['petrus'],
    name: {
      long: '2 Petrus',
      medium: '2 Pet.',
      short: '2Pe',
    },
  },
  {
    id: 62,
    prefix: '1',
    aliases: ['johannes'],
    name: {
      long: '1 Johannes',
      medium: '1 Joh.',
      short: '1Jo',
    },
  },
  {
    id: 63,
    prefix: '2',
    aliases: ['johannes'],
    name: {
      long: '2 Johannes',
      medium: '2 Joh.',
      short: '2Jo',
    },
  },
  {
    id: 64,
    prefix: '3',
    aliases: ['johannes'],
    name: {
      long: '3 Johannes',
      medium: '3 Joh.',
      short: '3Jo',
    },
  },
  {
    id: 65,
    aliases: ['judas'],
    name: {
      long: 'Judas',
      medium: 'Jud.',
      short: 'Ju',
    },
  },
  {
    id: 66,
    aliases: ['openbaring'],
    name: {
      long: 'Openbaring',
      medium: 'Open.',
      short: 'Opb',
    },
  },
] as const;
