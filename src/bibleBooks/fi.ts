import type { BibleBook } from '@/types';

export const bibleBooksFI: readonly Omit<BibleBook, 'chapters'>[] = [
  {
    id: 1,
    prefix: '1',
    aliases: ['mooses', 'mooseksen'],
    longName: '1. Mooseksen kirja',
    shortName: '1Mo',
  },
  {
    id: 2,
    prefix: '2',
    aliases: ['mooses', 'mooseksen'],
    longName: '2. Mooseksen kirja',
    shortName: '2Mo',
  },
  {
    id: 3,
    prefix: '3',
    aliases: ['mooses', 'mooseksen'],
    longName: '3. Mooseksen kirja',
    shortName: '3Mo',
  },
  {
    id: 4,
    prefix: '4',
    aliases: ['mooses', 'mooseksen'],
    longName: '4. Mooseksen kirja',
    shortName: '4Mo',
  },
  {
    id: 5,
    prefix: '5',
    aliases: ['mooses', 'mooseksen'],
    longName: '5. Mooseksen kirja',
    shortName: '5Mo',
  },
  {
    id: 6,
    aliases: ['joosua'],
    longName: 'Joosua',
    shortName: 'Joos',
  },
  {
    id: 7,
    aliases: ['tuomarit'],
    longName: 'Tuomarien kirja',
    shortName: 'Tuom',
  },
  {
    id: 8,
    aliases: ['ruut'],
    longName: 'Ruut',
    shortName: 'Ruut',
  },
  {
    id: 9,
    prefix: '1',
    aliases: ['samuelin'],
    longName: '1. Samuelin kirja',
    shortName: '1Sam',
  },
  {
    id: 10,
    prefix: '2',
    aliases: ['samuelin'],
    longName: '2. Samuelin kirja',
    shortName: '2Sam',
  },
  {
    id: 11,
    prefix: '1',
    aliases: ['kuninkaiden'],
    longName: '1. Kuninkaiden kirja',
    shortName: '1Kun',
  },
  {
    id: 12,
    prefix: '2',
    aliases: ['kuninkaiden'],
    longName: '2. Kuninkaiden kirja',
    shortName: '2Kun',
  },
  {
    id: 13,
    prefix: '1',
    aliases: ['aikakirja'],
    longName: '1. Aikakirja',
    shortName: '1Aik',
  },
  {
    id: 14,
    prefix: '2',
    aliases: ['aikakirja'],
    longName: '2. Aikakirja',
    shortName: '2Aik',
  },
  {
    id: 15,
    aliases: ['esra'],
    longName: 'Esra',
    shortName: 'Esra',
  },
  {
    id: 16,
    aliases: ['nehemia'],
    longName: 'Nehemia',
    shortName: 'Neh',
  },
  {
    id: 17,
    aliases: ['est'],
    longName: 'Ester',
    shortName: 'Est',
  },
  {
    id: 18,
    aliases: ['job', 'jb'],
    longName: 'Job',
    shortName: 'Job',
  },
  {
    id: 19,
    aliases: ['ps', 'psalmit'],
    longName: 'Psalmit',
    shortName: 'Ps',
  },
  {
    id: 20,
    aliases: ['sananlaskut'],
    longName: 'Sananlaskut',
    shortName: 'San',
  },
  {
    id: 21,
    aliases: ['sr', 'saarnaaja'],
    longName: 'Saarnaaja',
    shortName: 'Saar',
  },
  {
    id: 22,
    aliases: ['laulujenlaulu'],
    longName: 'Laulujen laulu',
    shortName: 'Laul',
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
    aliases: ['valituslaulut'],
    longName: 'Valituslaulut',
    shortName: 'Val',
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
    shortName: 'Dan',
  },
  {
    id: 28,
    aliases: ['hoosea'],
    longName: 'Hoosea',
    shortName: 'Ho',
  },
  {
    id: 29,
    aliases: ['joel', 'jl'],
    longName: 'Joel',
    shortName: 'Joel',
  },
  {
    id: 30,
    aliases: ['am', 'aamos'],
    longName: 'Aamos',
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
    aliases: ['jn', 'joona'],
    longName: 'Joona',
    shortName: 'Joona',
  },
  {
    id: 33,
    aliases: ['mi', 'miika'],
    longName: 'Miika',
    shortName: 'Miik',
  },
  {
    id: 34,
    aliases: ['nahum', 'naahum'],
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
    aliases: ['sefania', 'sefanja'],
    longName: 'Sefanja',
    shortName: 'Sef',
  },
  {
    id: 37,
    aliases: ['hg', 'haggai'],
    longName: 'Haggai',
    shortName: 'Hagg',
  },
  {
    id: 38,
    aliases: ['sakarja'],
    longName: 'Sakarja',
    shortName: 'Sak',
  },
  {
    id: 39,
    aliases: ['malakia'],
    longName: 'Malakia',
    shortName: 'Mal',
  },
  {
    id: 40,
    aliases: ['mt', 'matteus'],
    longName: 'Matteus',
    shortName: 'Matt',
  },
  {
    id: 41,
    aliases: ['mr', 'markus'],
    longName: 'Markus',
    shortName: 'Mark',
  },
  {
    id: 42,
    aliases: ['lk', 'luk', 'luukas'],
    longName: 'Luukas',
    shortName: 'Luuk',
  },
  {
    id: 43,
    aliases: ['jhn', 'johannes'],
    longName: 'Johannes',
    shortName: 'Joh',
  },
  {
    id: 44,
    aliases: ['apt', 'apostolientekojen', 'apostolienteot'],
    longName: 'Apostolien teot',
    shortName: 'Apt',
  },
  {
    id: 45,
    aliases: ['roomalaisille', 'roomalaiskirje'],
    longName: 'Roomalaisille',
    shortName: 'Room',
  },
  {
    id: 46,
    prefix: '1',
    aliases: ['kr', 'korinttilaisille'],
    longName: '1. Korinttilaisille',
    shortName: '1Kor',
  },
  {
    id: 47,
    prefix: '2',
    aliases: ['kr', 'korinttilaisille'],
    longName: '2. Korinttilaisille',
    shortName: '2Kor',
  },
  {
    id: 48,
    aliases: ['gl', 'galatalaisille'],
    longName: 'Galatalaisille',
    shortName: 'Gal',
  },
  {
    id: 49,
    aliases: ['efesolaisille'],
    longName: 'Efesolaisille',
    shortName: 'Ef',
  },
  {
    id: 50,
    aliases: ['filippiläisille'],
    longName: 'Filippiläisille',
    shortName: 'Fil',
  },
  {
    id: 51,
    aliases: ['kolossalaisille'],
    longName: 'Kolossalaisille',
    shortName: 'Kol',
  },
  {
    id: 52,
    prefix: '1',
    aliases: ['tessalonikalaisille'],
    longName: '1. Tessalonikalaisille',
    shortName: '1Te',
  },
  {
    id: 53,
    prefix: '2',
    aliases: ['tessalonikalaisille'],
    longName: '2. Tessalonikalaisille',
    shortName: '2Te',
  },
  {
    id: 54,
    prefix: '1',
    aliases: ['timoteukselle'],
    longName: '1. Timoteukselle',
    shortName: '1Ti',
  },
  {
    id: 55,
    prefix: '2',
    aliases: ['timoteukselle'],
    longName: '2. Timoteukselle',
    shortName: '2Ti',
  },
  {
    id: 56,
    aliases: ['titukselle', 'tiitukselle'],
    longName: 'Titukselle',
    shortName: 'Tit',
  },
  {
    id: 57,
    aliases: ['flm', 'filemonille'],
    longName: 'Filemonille',
    shortName: 'Flm',
  },
  {
    id: 58,
    aliases: ['hpr', 'heprealaisille'],
    longName: 'Heprealaisille',
    shortName: 'Hepr',
  },
  {
    id: 59,
    aliases: ['jaakobin kirje'],
    longName: 'Jaakobin kirje',
    shortName: 'Jaak',
  },
  {
    id: 60,
    prefix: '1',
    aliases: ['pietarin'],
    longName: '1. Pietarin kirje',
    shortName: '1Pi',
  },
  {
    id: 61,
    prefix: '2',
    aliases: ['pietari'],
    longName: '2. Pietarin kirje',
    shortName: '2Pi',
  },
  {
    id: 62,
    prefix: '1',
    aliases: ['johanneksen'],
    longName: '1. Johanneksen kirje',
    shortName: '1Joh',
  },
  {
    id: 63,
    prefix: '2',
    aliases: ['johanneksen'],
    longName: '2. Johanneksen kirje',
    shortName: '2Joh',
  },
  {
    id: 64,
    prefix: '3',
    aliases: ['johanneksen'],
    longName: '3. Johanneksen kirje',
    shortName: '3Joh',
  },
  {
    id: 65,
    aliases: ['jd', 'juudas'],
    longName: 'Juudaksen kirje',
    shortName: 'Juud',
  },
  {
    id: 66,
    aliases: ['ilmestyskirja'],
    longName: 'Ilmestys',
    shortName: 'Il',
  },
];
