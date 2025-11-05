import type { BibleBook } from '@/types';

export const bibleBooksPT: readonly Omit<BibleBook, 'chapters'>[] = [
  {
    id: 1,
    aliases: ['genesis','gen',"ge","génesis", "gén", "gé"],
    name: {
      long: 'Génesis',
      medium: 'Gén',
      short: 'Gén',
    },
  },
  {
    id: 2,
    aliases: ['exodo',"ex", "êx", "êxo", "êxodo"],
    name: {
      long: 'Êxodo',
      medium: 'Êx',
      short: 'Êx',
    },
  },
  {
    id: 3,
    aliases: ['levitico',"le", "lev", "levítico"],
    name: {
      long: 'Levítico',
      medium: 'Lev',
      short: 'Le',
    },
  },
  {
    id: 4,
    aliases: ['numeros',"n", "núm", "números", "numeros", "num"],
    name: {
      long: 'Números',
      medium: 'Núm',
      short: 'Núm',
    },
  },
  {
    id: 5,
    aliases: ["de", "deu", "deuteronómio", "deuteronomio", "deuteronômio"],
    name: {
      long: 'Deuteronómio',
      medium: 'De',
      short: 'De',
    },
  },
  {
    id: 6,
    aliases: ['josue',"jos", "josué"],
    name: {
      long: 'Josué',
      medium: 'Jos',
      short: 'Jos',
    },
  },
  {
    id: 7,
    aliases: ["jz", "juí", "juízes", "juizes", "jui"],
    name: {
      long: 'Juízes',
      medium: 'Jz',
      short: 'Jz',
    },
  },
  {
    id: 8,
    aliases: ["ru", "rute"],
    name: {
      long: 'Rute',
      medium: 'Ru',
      short: 'Ru',
    },
  },
  {
    id: 9,
    prefix: '1',
    aliases: ["1sa", "1sam", "1samuel", "1 samuel", "1 sa"],
    name: {
      long: '1 Samuel',
      medium: '1Sa',
      short: '1Sa',
    },
  },
  {
    id: 10,
    prefix: '2',
    aliases: ["2sa", "2sam", "2samuel", "2 samuel", "2 sa"],
    name: {
      long: '2 Samuel',
      medium: '2Sa',
      short: '2Sa',
    },
  },
  {
    id: 11,
    prefix: '1',
    aliases: ["1rs", "1reis", "1 reis", "1re", "1 re"],
    name: {
      long: '1 Reis',
      medium: '1Rs',
      short: '1Rs',
    },
  },
  {
    id: 12,
    prefix: '2',
    aliases: ["2rs", "2reis", "2 reis", "2re", "2 re"],
    name: {
      long: '2 Reis',
      medium: '2Rs',
      short: '2Rs',
    },
  },
  {
    id: 13,
    prefix: '1',
    aliases: ["1cr", "1crô", "1crónicas", "1 crónicas", "1 crônicas", "1 cr"],
    name: {
      long: '1 Crónicas',
      medium: '1Cr',
      short: '1Cr',
    },
  },
  {
    id: 14,
    prefix: '2',
    aliases: ["2cr", "2crô", "2crónicas", "2 crónicas", "2 crônicas", "2 cr"],
    name: {
      long: '2 Crónicas',
      medium: '2Cr',
      short: '2Cr',
    },
  },
  {
    id: 15,
    aliases: ["esd", "esdras"],
    name: {
      long: 'Esdras',
      medium: 'Esd',
      short: 'Esd',
    },
  },
  {
    id: 16,
    aliases: ["ne", "nee", "neemias"],
    name: {
      long: 'Neemias',
      medium: 'Ne',
      short: 'Ne',
    },
  },
  {
    id: 17,
    aliases: ["est", "ester"],
    name: {
      long: 'Ester',
      medium: 'Est',
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
      medium: 'Sal',
      short: 'Sal',
    },
  },
  {
    id: 20,
    aliases: ["pr", "pro", "provérbios", "proverbios"],
    name: {
      long: 'Provérbios',
      medium: 'Pr',
      short: 'Pr',
    },
  },
  {
    id: 21,
    aliases: ["ec", "ecl", "eclesiastes"],
    name: {
      long: 'Eclesiastes',
      medium: 'Ec',
      short: 'Ec',
    },
  },
  {
    id: 22,
    aliases: ["cân", "cântico de salomão", "cantares","can"],
    name: {
      long: 'Cântico de Salomão (Cantares)',
      medium: 'Cân',
      short: 'Cân',
    },
  },
  {
    id: 23,
    aliases: ["is", "isa", "isaias", "isaías"],
    name: {
      long: 'Isaías',
      medium: 'Is',
      short: 'Is',
    },
  },
  {
    id: 24,
    aliases: ["je", "jer", "jeremias"],
    name: {
      long: 'Jeremias',
      medium: 'Je',
      short: 'Je',
    },
  },
  {
    id: 25,
    aliases: ["la", "lam", "lamentações", "lamentacoes"],
    name: {
      long: 'Lamentações',
      medium: 'La',
      short: 'La',
    },
  },
  {
    id: 26,
    aliases: ["ez", "eze", "ezequiel"],
    name: {
      long: 'Ezequiel',
      medium: 'Ez',
      short: 'Ez',
    },
  },
  {
    id: 27,
    aliases: ["da", "dan", "daniel"],
    name: {
      long: 'Daniel',
      medium: 'Da',
      short: 'Da',
    },
  },
  {
    id: 28,
    aliases: ["os", "ose", "oseias"],
    name: {
      long: 'Oseias',
      medium: 'Os',
      short: 'Os',
    },
  },
  {
    id: 29,
    aliases: ["jl", "joel"],
    name: {
      long: 'Joel',
      medium: 'Jl',
      short: 'Jl',
    },
  },
  {
    id: 30,
    aliases: ['amos', "am", "amós"],
    name: {
      long: 'Amós',
      medium: 'Am',
      short: 'Am',
    },
  },
  {
    id: 31,
    aliases: ["ob", "obd", "obadias"],
    name: {
      long: 'Obadias',
      medium: 'Ob',
      short: 'Ob',
    },
  },
  {
    id: 32,
    aliases: ["jon", "jonas"],
    name: {
      long: 'Jonas',
      medium: 'Jon',
      short: 'Jon',
    },
  },
  {
    id: 33,
    aliases: ["miq", "miqueias"],
    name: {
      long: 'Miqueias',
      medium: 'Miq',
      short: 'Miq',
    },
  },
  {
    id: 34,
    aliases: ["na", "naum"],
    name: {
      long: 'Naumm',
      medium: 'Na',
      short: 'Na',
    },
  },
  {
    id: 35,
    aliases: ["hab", "habacuque"],
    name: {
      long: 'Habacuque',
      medium: 'Hab',
      short: 'Hab',
    },
  },
  {
    id: 36,
    aliases: ["sof", "sofonias"],
    name: {
      long: 'Sofonias',
      medium: 'Sof',
      short: 'Sof',
    },
  },
  {
    id: 37,
    aliases: ["ag", "ageu"],
    name: {
      long: 'Ageu',
      medium: 'Ag',
      short: 'Ag',
    },
  },
  {
    id: 38,
    aliases: ["za", "zac", "zacarias"],
    name: {
      long: 'Zacarias',
      medium: 'Za',
      short: 'Za',
    },
  },
  {
    id: 39,
    aliases: ["mal", "malaquias"],
    name: {
      long: 'Malaquias',
      medium: 'Mal',
      short: 'Mal',
    },
  },
  {
    id: 40,
    aliases: ["mt", "mat", "mateus"],
    name: {
      long: 'Mateus',
      medium: 'Mt',
      short: 'Mt',
    },
  },
  {
    id: 41,
    aliases: ["mr", "mar", "marcos"],
    name: {
      long: 'Marcos',
      medium: 'Mr',
      short: 'Mr',
    },
  },
  {
    id: 42,
    aliases: ["lu", "luc", "lucas"],
    name: {
      long: 'Lucas',
      medium: 'Lu',
      short: 'Lu',
    },
  },
  {
    id: 43,
    aliases: ["jo", "joão", "joao"],
    name: {
      long: 'João',
      medium: 'Jo',
      short: 'Jo',
    },
  },
  {
    id: 44,
    aliases: ["at", "atos"],
    name: {
      long: 'Atos',
      medium: 'At',
      short: 'At',
    },
  },
  {
    id: 45,
    aliases: ["ro", "rom", "romanos"],
    name: {
      long: 'Romanos',
      medium: 'Ro',
      short: 'Ro',
    },
  },
  {
    id: 46,
    prefix: '1',
    aliases: ["1co", "1cor", "1coríntios", "1 coríntios", "1 corintios", "1 cor", "1 co"],
    name: {
      long: '1 Coríntios',
      medium: '1Co',
      short: '1Co',
    },
  },
  {
    id: 47,
    prefix: '2',
    aliases: ["2co", "2cor", "2coríntios", "2 coríntios", "2 corintios", "2 cor", "2 co"],
    name: {
      long: '2 Coríntios',
      medium: '2Co',
      short: '2Co',
    },
  },
  {
    id: 48,
    aliases: ['galatas',"gál", "gálatas","gal"],
    name: {
      long: 'Gálatas',
      medium: 'Gál',
      short: 'Gál',
    },
  },
  {
    id: 49,
    aliases: ["ef", "efé", "efésios", "efesios","efe"],
    name: {
      long: 'Efésios',
      medium: 'Ef',
      short: 'Ef',
    },
  },
  {
    id: 50,
    aliases: ["fil", "filipenses"],
    name: {
      long: 'Filipenses',
      medium: 'Fil',
      short: 'Fil',
    },
  },
  {
    id: 51,
    aliases: ["col", "colossenses"],
    name: {
      long: 'Colossenses',
      medium: 'Col',
      short: 'Col',
    },
  },
  {
    id: 52,
    prefix: '1',
    aliases: ["1te", "1tes", "1tessalonicenses", "1 tessalonicenses", "1 te", "1 tes"],
    name: {
      long: '1 Tessalonicenses',
      medium: '1Te',
      short: '1Te',
    },
  },
  {
    id: 53,
    prefix: '2',
    aliases: ["2te", "2tes", "2tessalonicenses", "2 tessalonicenses", "2 te", "2 tes"],
    name: {
      long: '2 Tessalonicenses',
      medium: '2Te',
      short: '2Te',
    },
  },
  {
    id: 54,
    prefix: '1',
    aliases: ["1ti", "1tim", "1timóteo", "1 timóteo", "1 timoteo", "1 tim", "1 ti"],
    name: {
      long: '1 Timóteo',
      medium: '1Ti',
      short: '1Ti',
    },
  },
  {
    id: 55,
    prefix: '2',
    aliases: ["2ti", "2tim", "2timóteo", "2 timóteo", "2 timoteo", "2 tim", "2 ti"],
    name: {
      long: '2 Timóteo',
      medium: '2Ti',
      short: '2Ti',
    },
  },
  {
    id: 56,
    aliases: ["tit", "tito"],
    name: {
      long: 'Tito',
      medium: 'Tit',
      short: 'Tit',
    },
  },
  {
    id: 57,
    aliases: ["flm", "filêm", "filémon", "filemon", "filem"],
    name: {
      long: 'Filémon',
      medium: 'Flm',
      short: 'Flm',
    },
  },
  {
    id: 58,
    aliases: ["he", "heb", "hebreus"],
    name: {
      long: 'Hebreus',
      medium: 'He',
      short: 'He',
    },
  },
  {
    id: 59,
    aliases: ["tg", "tia", "tiago"],
    name: {
      long: 'Tiago',
      medium: 'Tg',
      short: 'Tg',
    },
  },
  {
    id: 60,
    prefix: '1',
    aliases: ["1pe", "1ped", "1pedro", "1 pe", "1 ped", "1 pedro"],
    name: {
      long: '1 Pedro',
      medium: '1Pe',
      short: '1Pe',
    },
  },
  {
    id: 61,
    prefix: '2',
    aliases: ["1pe", "1ped", "1pedro", "1 pe", "1 ped", "1 pedro"],
    name: {
      long: '2 Pedro',
      medium: '2Pe',
      short: '2Pe',
    },
  },
  {
    id: 62,
    prefix: '1',
    aliases: ["1jo", "1joão", "1joao", "1 jo", "1 joão", "1 joao"],
    name: {
      long: '1 João',
      medium: '1Jo',
      short: '1Jo',
    },
  },
  {
    id: 63,
    prefix: '2',
    aliases: ["2jo", "2joão", "2joao", "2 jo", "2 joão", "2 joao"],
    name: {
      long: '2 João',
      medium: '2Jo',
      short: '2Jo',
    },
  },
  {
    id: 64,
    prefix: '3',
    aliases: ["3jo", "3joão", "3joao", "3 jo", "3 joão", "3 joao"],
    name: {
      long: '3 João',
      medium: '3Jo',
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
      medium: 'Ap',
      short: 'Ap',
    },
  },
];
