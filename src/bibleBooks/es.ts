import type { BibleBook } from '@/types';

export const bibleBooksES: readonly Omit<BibleBook, 'chapters'>[] = [
  {
    id: 1,
    aliases: ['genesis'],
    name: {
      long: 'Génesis',
      medium: 'Gén.',
      short: 'Gé',
    },
  },
  {
    id: 2,
    aliases: ['exodo'],
    name: {
      long: 'Éxodo',
      medium: 'Éx.',
      short: 'Éx',
    },
  },
  {
    id: 3,
    aliases: ['levitico'],
    name: {
      long: 'Levítico',
      medium: 'Lev.',
      short: 'Le',
    },
  },
  {
    id: 4,
    aliases: ['numeros'],
    name: {
      long: 'Números',
      medium: 'Núm.',
      short: 'Nu',
    },
  },
  {
    id: 5,
    aliases: ['deuteronomio'],
    name: {
      long: 'Deuteronomio',
      medium: 'Deut.',
      short: 'Dt',
    },
  },
  {
    id: 6,
    aliases: ['josue'],
    name: {
      long: 'Josué',
      medium: 'Jos.',
      short: 'Jos',
    },
  },
  {
    id: 7,
    aliases: ['jueces'],
    name: {
      long: 'Jueces',
      medium: 'Jue.',
      short: 'Jue',
    },
  },
  {
    id: 8,
    aliases: ['rut'],
    name: {
      long: 'Rut',
      medium: 'Rut',
      short: 'Rut',
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
      medium: '2 Sam.',
      short: '2Sa',
    },
  },
  {
    id: 11,
    prefix: '1',
    aliases: ['reyes'],
    name: {
      long: '1 Reyes',
      medium: '1 Re.',
      short: '1Re',
    },
  },
  {
    id: 12,
    prefix: '2',
    aliases: ['reyes'],
    name: {
      long: '2 Reyes',
      medium: '2 Re.',
      short: '2Re',
    },
  },
  {
    id: 13,
    prefix: '1',
    aliases: ['cronicas'],
    name: {
      long: '1 Crónicas',
      medium: '1 Cró.',
      short: '1Cr',
    },
  },
  {
    id: 14,
    prefix: '2',
    aliases: ['cronicas'],
    name: {
      long: '2 Crónicas',
      medium: '2 Cró.',
      short: '2Cr',
    },
  },
  {
    id: 15,
    aliases: ['esdras'],
    name: {
      long: 'Esdras',
      medium: 'Esd.',
      short: 'Esd',
    },
  },
  {
    id: 16,
    aliases: ['nehemias'],
    name: {
      long: 'Nehemías',
      medium: 'Neh.',
      short: 'Neh',
    },
  },
  {
    id: 17,
    aliases: ['ester'],
    name: {
      long: 'Ester',
      medium: 'Est.',
      short: 'Est',
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
    aliases: ['salmos'],
    name: {
      long: 'Salmos',
      medium: 'Sal.',
      short: 'Sal',
    },
  },
  {
    id: 20,
    aliases: ['proverbios'],
    name: {
      long: 'Proverbios',
      medium: 'Prov.',
      short: 'Pr',
    },
  },
  {
    id: 21,
    aliases: ['eclesiastes'],
    name: {
      long: 'Eclesiastés',
      medium: 'Ecl.',
      short: 'Ec',
    },
  },
  {
    id: 22,
    aliases: ['cantares'],
    name: {
      long: 'Cantares',
      medium: 'Cant.',
      short: 'Ca',
    },
  },
  {
    id: 23,
    aliases: ['isaias'],
    name: {
      long: 'Isaías',
      medium: 'Is.',
      short: 'Is',
    },
  },
  {
    id: 24,
    aliases: ['jeremias'],
    name: {
      long: 'Jeremías',
      medium: 'Jer.',
      short: 'Je',
    },
  },
  {
    id: 25,
    aliases: ['lamentaciones'],
    name: {
      long: 'Lamentaciones',
      medium: 'Lam.',
      short: 'La',
    },
  },
  {
    id: 26,
    aliases: ['ezequiel'],
    name: {
      long: 'Ezequiel',
      medium: 'Ez.',
      short: 'Ez',
    },
  },
  {
    id: 27,
    aliases: ['daniel'],
    name: {
      long: 'Daniel',
      medium: 'Dan.',
      short: 'Da',
    },
  },
  {
    id: 28,
    aliases: ['oseas'],
    name: {
      long: 'Oseas',
      medium: 'Os.',
      short: 'Os',
    },
  },
  {
    id: 29,
    aliases: ['joel'],
    name: {
      long: 'Joel',
      medium: 'Joel',
      short: 'Joel',
    },
  },
  {
    id: 30,
    aliases: ['amos'],
    name: {
      long: 'Amós',
      medium: 'Am.',
      short: 'Am',
    },
  },
  {
    id: 31,
    aliases: ['abdias'],
    name: {
      long: 'Abdías',
      medium: 'Abd.',
      short: 'Abd',
    },
  },
  {
    id: 32,
    aliases: ['jonas'],
    name: {
      long: 'Jonás',
      medium: 'Jon.',
      short: 'Jon',
    },
  },
  {
    id: 33,
    aliases: ['miqueas'],
    name: {
      long: 'Miqueas',
      medium: 'Miq.',
      short: 'Mi',
    },
  },
  {
    id: 34,
    aliases: ['nahum'],
    name: {
      long: 'Nahúm',
      medium: 'Nah.',
      short: 'Na',
    },
  },
  {
    id: 35,
    aliases: ['habacuc'],
    name: {
      long: 'Habacuc',
      medium: 'Hab.',
      short: 'Hab',
    },
  },
  {
    id: 36,
    aliases: ['sofonias'],
    name: {
      long: 'Sofonías',
      medium: 'Sof.',
      short: 'Sof',
    },
  },
  {
    id: 37,
    aliases: ['ageo'],
    name: {
      long: 'Ageo',
      medium: 'Ag.',
      short: 'Ag',
    },
  },
  {
    id: 38,
    aliases: ['zacarias'],
    name: {
      long: 'Zacarías',
      medium: 'Zac.',
      short: 'Za',
    },
  },
  {
    id: 39,
    aliases: ['malaquias'],
    name: {
      long: 'Malaquías',
      medium: 'Mal.',
      short: 'Mal',
    },
  },
  {
    id: 40,
    aliases: ['mateo'],
    name: {
      long: 'Mateo',
      medium: 'Mat.',
      short: 'Mt',
    },
  },
  {
    id: 41,
    aliases: ['marcos'],
    name: {
      long: 'Marcos',
      medium: 'Mar.',
      short: 'Mc',
    },
  },
  {
    id: 42,
    aliases: ['lucas'],
    name: {
      long: 'Lucas',
      medium: 'Luc.',
      short: 'Lc',
    },
  },
  {
    id: 43,
    aliases: ['juan'],
    name: {
      long: 'Juan',
      medium: 'Juan',
      short: 'Jn',
    },
  },
  {
    id: 44,
    aliases: ['hechos'],
    name: {
      long: 'Hechos',
      medium: 'Hch.',
      short: 'Hch',
    },
  },
  {
    id: 45,
    aliases: ['romanos'],
    name: {
      long: 'Romanos',
      medium: 'Rom.',
      short: 'Ro',
    },
  },
  {
    id: 46,
    prefix: '1',
    aliases: ['corintios'],
    name: {
      long: '1 Corintios',
      medium: '1 Cor.',
      short: '1Co',
    },
  },
  {
    id: 47,
    prefix: '2',
    aliases: ['corintios'],
    name: {
      long: '2 Corintios',
      medium: '2 Cor.',
      short: '2Co',
    },
  },
  {
    id: 48,
    aliases: ['galatas'],
    name: {
      long: 'Gálatas',
      medium: 'Gál.',
      short: 'Gá',
    },
  },
  {
    id: 49,
    aliases: ['efesios'],
    name: {
      long: 'Efesios',
      medium: 'Ef.',
      short: 'Ef',
    },
  },
  {
    id: 50,
    aliases: ['filipenses'],
    name: {
      long: 'Filipenses',
      medium: 'Fil.',
      short: 'Fil',
    },
  },
  {
    id: 51,
    aliases: ['colosenses'],
    name: {
      long: 'Colosenses',
      medium: 'Col.',
      short: 'Col',
    },
  },
  {
    id: 52,
    prefix: '1',
    aliases: ['tesalonicenses'],
    name: {
      long: '1 Tesalonicenses',
      medium: '1 Tes.',
      short: '1Ts',
    },
  },
  {
    id: 53,
    prefix: '2',
    aliases: ['tesalonicenses'],
    name: {
      long: '2 Tesalonicenses',
      medium: '2 Tes.',
      short: '2Ts',
    },
  },
  {
    id: 54,
    prefix: '1',
    aliases: ['timoteo'],
    name: {
      long: '1 Timoteo',
      medium: '1 Tim.',
      short: '1Ti',
    },
  },
  {
    id: 55,
    prefix: '2',
    aliases: ['timoteo'],
    name: {
      long: '2 Timoteo',
      medium: '2 Tim.',
      short: '2Ti',
    },
  },
  {
    id: 56,
    aliases: ['tito'],
    name: {
      long: 'Tito',
      medium: 'Tit.',
      short: 'Tit',
    },
  },
  {
    id: 57,
    aliases: ['filemon'],
    name: {
      long: 'Filemón',
      medium: 'File.',
      short: 'Flm',
    },
  },
  {
    id: 58,
    aliases: ['hebreos'],
    name: {
      long: 'Hebreos',
      medium: 'Heb.',
      short: 'He',
    },
  },
  {
    id: 59,
    aliases: ['santiago'],
    name: {
      long: 'Santiago',
      medium: 'Sant.',
      short: 'Sant',
    },
  },
  {
    id: 60,
    prefix: '1',
    aliases: ['pedro'],
    name: {
      long: '1 Pedro',
      medium: '1 Pe.',
      short: '1Pe',
    },
  },
  {
    id: 61,
    prefix: '2',
    aliases: ['pedro'],
    name: {
      long: '2 Pedro',
      medium: '2 Pe.',
      short: '2Pe',
    },
  },
  {
    id: 62,
    prefix: '1',
    aliases: ['juan'],
    name: {
      long: '1 Juan',
      medium: '1 Jn.',
      short: '1Jn',
    },
  },
  {
    id: 63,
    prefix: '2',
    aliases: ['juan'],
    name: {
      long: '2 Juan',
      medium: '2 Jn.',
      short: '2Jn',
    },
  },
  {
    id: 64,
    prefix: '3',
    aliases: ['juan'],
    name: {
      long: '3 Juan',
      medium: '3 Jn.',
      short: '3Jn',
    },
  },
  {
    id: 65,
    aliases: ['judas'],
    name: {
      long: 'Judas',
      medium: 'Jud.',
      short: 'Jud',
    },
  },
  {
    id: 66,
    aliases: ['apocalipsis', 'revelacion', 'revelación'],
    name: {
      long: 'Apocalipsis',
      medium: 'Apoc.',
      short: 'Ap',
    },
  },
];
