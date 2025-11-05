import type { BibleBook } from '@/types';

export const bibleBooksPT: readonly Omit<BibleBook, 'chapters'>[] = [
  {
    id: 1,
    aliases: ['genesis','gen',"ge","génesis", "gén", "gé"],
    name: {
      long: 'Génesis',
      medium: 'Gén.',
      short: 'Gén',
    },
  },
  {
    id: 2,
    aliases: ['exodo',"ex", "êx", "êxo", "êxodo"],
    name: {
      long: 'Êxodo',
      medium: 'Êxo.',
      short: 'Êx',
    },
  },
  {
    id: 3,
    aliases: ['levitico',"le", "lev", "levítico"],
    name: {
      long: 'Levítico',
      medium: 'Lev.',
      short: 'Le',
    },
  },
  {
    id: 4,
    aliases: ['numeros',"n", "núm", "números", "numeros", "num"],
    name: {
      long: 'Números',
      medium: 'Núm.',
      short: 'Núm',
    },
  },
  {
    id: 5,
    aliases: ["de", "deu", "deuteronómio", "deuteronomio", "deuteronômio"],
    name: {
      long: 'Deuteronómio',
      medium: 'Deut.',
      short: 'De',
    },
  },
  {
    id: 6,
    aliases: ['josue',"jos", "josué"],
    name: {
      long: 'Josué',
      medium: 'Jos.',
      short: 'Jos',
    },
  },
  {
    id: 7,
    aliases: ["jz", "juí", "juízes", "juizes", "jui"],
    name: {
      long: 'Juízes',
      medium: 'Jz.',
      short: 'Jz',
    },
  },
  {
    id: 8,
    aliases: ["ru", "rute"],
    name: {
      long: 'Rute',
      medium: 'Rute',
      short: 'Ru',
    },
  },
  {
    id: 9,
    prefix: '1',
    aliases: ["sa", "sam", "samuel"],
    name: {
      long: '1 Samuel',
      medium: '1 Sam.',
      short: '1Sa',
    },
  },
  {
    id: 10,
    prefix: '2',
    aliases: ["sa", "sam", "samuel"],
    name: {
      long: '2 Samuel',
      medium: '2 Sam.',
      short: '2Sa',
    },
  },
  {
    id: 11,
    prefix: '1',
    aliases: ["rs", "reis", "re"],
    name: {
      long: '1 Reis',
      medium: '1 Reis',
      short: '1Rs',
    },
  },
  {
    id: 12,
    prefix: '2',
    aliases: ["rs", "reis", "re"],
    name: {
      long: '2 Reis',
      medium: '2 Reis',
      short: '2Rs',
    },
  },
  {
    id: 13,
    prefix: '1',
    aliases: ["cr", "cro", "cronicas"],
    name: {
      long: '1 Crónicas',
      medium: '1 Crón.',
      short: '1Cr',
    },
  },
  {
    id: 14,
    prefix: '2',
    aliases: ["cr", "cro", "cronicas"],
    name: {
      long: '2 Crónicas',
      medium: '2 Crón.',
      short: '2Cr',
    },
  },
  {
    id: 15,
    aliases: ["esd", "esdras"],
    name: {
      long: 'Esdras',
      medium: 'Esd.',
      short: 'Esd',
    },
  },
  {
    id: 16,
    aliases: ["ne", "nee", "neemias"],
    name: {
      long: 'Neemias',
      medium: 'Nee.',
      short: 'Ne',
    },
  },
  {
    id: 17,
    aliases: ["est", "ester"],
    name: {
      long: 'Ester',
      medium: 'Ester',
      short: 'Est',
    },
  },
  {
    id: 18,
    aliases: ["jó"],
    name: {
      long: 'Jó',
      medium: 'Jó',
      short: 'Jó',
    },
  },
  {
    id: 19,
    aliases: ["sal", "salmos"],
    name: {
      long: 'Salmos',
      medium: 'Sal.',
      short: 'Sal',
    },
  },
  {
    id: 20,
    aliases: ["pr", "pro", "provérbios", "proverbios"],
    name: {
      long: 'Provérbios',
      medium: 'Pro.',
      short: 'Pr',
    },
  },
  {
    id: 21,
    aliases: ["ec", "ecl", "eclesiastes"],
    name: {
      long: 'Eclesiastes',
      medium: 'Ecl.',
      short: 'Ec',
    },
  },
  {
    id: 22,
    aliases: ["cân", "cântico de salomão", "cantares","can"],
    name: {
      long: 'Cântico de Salomão (Cantares)',
      medium: 'Cân.',
      short: 'Cân',
    },
  },
  {
    id: 23,
    aliases: ["is", "isa", "isaias", "isaías"],
    name: {
      long: 'Isaías',
      medium: 'Isa.',
      short: 'Is',
    },
  },
  {
    id: 24,
    aliases: ["je", "jer", "jeremias"],
    name: {
      long: 'Jeremias',
      medium: 'Jer.',
      short: 'Je',
    },
  },
  {
    id: 25,
    aliases: ["la", "lam", "lamentações", "lamentacoes"],
    name: {
      long: 'Lamentações',
      medium: 'Lam.',
      short: 'La',
    },
  },
  {
    id: 26,
    aliases: ["ez", "eze", "ezequiel"],
    name: {
      long: 'Ezequiel',
      medium: 'Eze.',
      short: 'Ez',
    },
  },
  {
    id: 27,
    aliases: ["da", "dan", "daniel"],
    name: {
      long: 'Daniel',
      medium: 'Dan.',
      short: 'Da',
    },
  },
  {
    id: 28,
    aliases: ["os", "ose", "oseias"],
    name: {
      long: 'Oseias',
      medium: 'Ose.',
      short: 'Os',
    },
  },
  {
    id: 29,
    aliases: ["jl", "joel"],
    name: {
      long: 'Joel',
      medium: 'Joel',
      short: 'Jl',
    },
  },
  {
    id: 30,
    aliases: ['amos', "am", "amós"],
    name: {
      long: 'Amós',
      medium: 'Am.',
      short: 'Am',
    },
  },
  {
    id: 31,
    aliases: ["ob", "obd", "obadias"],
    name: {
      long: 'Obadias',
      medium: 'Oba.',
      short: 'Ob',
    },
  },
  {
    id: 32,
    aliases: ["jon", "jonas"],
    name: {
      long: 'Jonas',
      medium: 'Jonas',
      short: 'Jon',
    },
  },
  {
    id: 33,
    aliases: ["miq", "miqueias"],
    name: {
      long: 'Miqueias',
      medium: 'Miq.',
      short: 'Miq',
    },
  },
  {
    id: 34,
    aliases: ["na", "naum"],
    name: {
      long: 'Naumm',
      medium: 'Naum',
      short: 'Na',
    },
  },
  {
    id: 35,
    aliases: ["hab", "habacuque"],
    name: {
      long: 'Habacuque',
      medium: 'Hab.',
      short: 'Hab',
    },
  },
  {
    id: 36,
    aliases: ["sof", "sofonias"],
    name: {
      long: 'Sofonias',
      medium: 'Sof.',
      short: 'Sof',
    },
  },
  {
    id: 37,
    aliases: ["ag", "ageu"],
    name: {
      long: 'Ageu',
      medium: 'Ag.',
      short: 'Ag',
    },
  },
  {
    id: 38,
    aliases: ["za", "zac", "zacarias"],
    name: {
      long: 'Zacarias',
      medium: 'Zac.',
      short: 'Za',
    },
  },
  {
    id: 39,
    aliases: ["mal", "malaquias"],
    name: {
      long: 'Malaquias',
      medium: 'Mal.',
      short: 'Mal',
    },
  },
  {
    id: 40,
    aliases: ["mt", "mat", "mateus"],
    name: {
      long: 'Mateus',
      medium: 'Mateus',
      short: 'Mt',
    },
  },
  {
    id: 41,
    aliases: ["mr", "mar", "marcos"],
    name: {
      long: 'Marcos',
      medium: 'Marcos',
      short: 'Mr',
    },
  },
  {
    id: 42,
    aliases: ["lu", "luc", "lucas"],
    name: {
      long: 'Lucas',
      medium: 'Lucas',
      short: 'Lu',
    },
  },
  {
    id: 43,
    aliases: ["jo", "joão", "joao"],
    name: {
      long: 'João',
      medium: 'João',
      short: 'Jo',
    },
  },
  {
    id: 44,
    aliases: ["at", "atos"],
    name: {
      long: 'Atos',
      medium: 'Atos',
      short: 'At',
    },
  },
  {
    id: 45,
    aliases: ["ro", "rom", "romanos"],
    name: {
      long: 'Romanos',
      medium: 'Ro.',
      short: 'Ro',
    },
  },
  {
    id: 46,
    prefix: '1',
    aliases: ["co", "cor", "coríntios", "corintios"],
    name: {
      long: '1 Coríntios',
      medium: '1 Co.',
      short: '1Co',
    },
  },
  {
    id: 47,
    prefix: '2',
    aliases: ["co", "cor", "coríntios", "corintios"],
    name: {
      long: '2 Coríntios',
      medium: '2 Co.',
      short: '2Co',
    },
  },
  {
    id: 48,
    aliases: ['galatas',"gál", "gálatas","gal"],
    name: {
      long: 'Gálatas',
      medium: 'Gál.',
      short: 'Gál',
    },
  },
  {
    id: 49,
    aliases: ["ef", "efé", "efésios", "efesios","efe"],
    name: {
      long: 'Efésios',
      medium: 'Ef.',
      short: 'Ef',
    },
  },
  {
    id: 50,
    aliases: ["fil", "filipenses"],
    name: {
      long: 'Filipenses',
      medium: 'Fil.',
      short: 'Fil',
    },
  },
  {
    id: 51,
    aliases: ["col", "colossenses"],
    name: {
      long: 'Colossenses',
      medium: 'Col.',
      short: 'Col',
    },
  },
  {
    id: 52,
    prefix: '1',
    aliases: ["te", "tes", "tessalonicenses"],
    name: {
      long: '1 Tessalonicenses',
      medium: '1 Tess.',
      short: '1Te',
    },
  },
  {
    id: 53,
    prefix: '2',
    aliases: ["te", "tes", "tessalonicenses"],
    name: {
      long: '2 Tessalonicenses',
      medium: '2 Tess.',
      short: '2Te',
    },
  },
  {
    id: 54,
    prefix: '1',
    aliases: ["ti", "tim", "timóteo", "timoteo"],
    name: {
      long: '1 Timóteo',
      medium: '1 Ti.',
      short: '1Ti',
    },
  },
  {
    id: 55,
    prefix: '2',
    aliases: ["ti", "tim", "timóteo", "timoteo"],
    name: {
      long: '2 Timóteo',
      medium: '2 Ti.',
      short: '2Ti',
    },
  },
  {
    id: 56,
    aliases: ["tit", "tito"],
    name: {
      long: 'Tito',
      medium: 'Tito',
      short: 'Tit',
    },
  },
  {
    id: 57,
    aliases: ["flm", "filêm", "filémon", "filemon", "filem"],
    name: {
      long: 'Filémon',
      medium: 'Filémon',
      short: 'Flm',
    },
  },
  {
    id: 58,
    aliases: ["he", "heb", "hebreus"],
    name: {
      long: 'Hebreus',
      medium: 'Heb.',
      short: 'He',
    },
  },
  {
    id: 59,
    aliases: ["tg", "tia", "tiago"],
    name: {
      long: 'Tiago',
      medium: 'Tiago',
      short: 'Tg',
    },
  },
  {
    id: 60,
    prefix: '1',
    aliases: ["pe", "ped", "pedro"],
    name: {
      long: '1 Pedro',
      medium: '1 Pe.',
      short: '1Pe',
    },
  },
  {
    id: 61,
    prefix: '2',
    aliases: ["pe", "ped", "pedro"],
    name: {
      long: '2 Pedro',
      medium: '2 Pe.',
      short: '2Pe',
    },
  },
  {
    id: 62,
    prefix: '1',
    aliases: ["jo", "joão", "joao"],
    name: {
      long: '1 João',
      medium: '1 Jo.',
      short: '1Jo',
    },
  },
  {
    id: 63,
    prefix: '2',
    aliases: ["jo", "joão", "joao"],
    name: {
      long: '2 João',
      medium: '2 Jo.',
      short: '2Jo',
    },
  },
  {
    id: 64,
    prefix: '3',
    aliases: ["jo", "joão", "joao"],
    name: {
      long: '3 João',
      medium: '3 Jo.',
      short: '3Jo',
    },
  },
  {
    id: 65,
    aliases: ["ju", "judas"],
    name: {
      long: 'Judas',
      medium: 'Ju',
      short: 'Ju',
    },
  },
  {
    id: 66,
    aliases: ["ap", "apo", "apocalipse", "revelação", "revelacao", "rev"],
    name: {
      long: 'Apocalipse',
      medium: 'Ap.',
      short: 'Ap',
    },
  },
];
