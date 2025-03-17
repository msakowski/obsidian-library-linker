export const fi = {
  settings: {
    language: {
      name: 'Kieli',
      description: 'Valitse kieli raamatunviitteille',
    },
    useShortNames: {
      name: 'Käytä lyhyitä nimiä raamatunviitteissä',
      description:
        'Kun tämä on käytössä, raamatunviitteissä käytetään lyhennettyjä kirjannimiä (esim. "1Pi" sijasta "1. Pietari")',
    },
    openAutomatically: {
      name: 'Avaa linkit automaattisesti',
      description: 'Siirtää "Linkitä ja avaa" -komennon listan kärkeen',
    },
  },
  commands: {
    replaceLinks: 'Muunna kaikki linkit',
    replaceBibleLinks: 'Muunna raamatunjaelinkit',
    replacePublicationLinks: 'Muunna julkaisulinkit',
    convertBibleReference: 'Muunna raamatunviite kirjastolinkiksi',
    convertWebLink: 'Muunna jw.org-linkki kirjastolinkiksi',
  },
  notices: {
    multipleBooksFound: 'Useita raamatunkirjoja löytyi: {{books}}',
  },
  suggestions: {
    createLink: 'Luo linkki: {{text}}',
    createLinks: 'Luo linkit: {{text}}',
    createAndOpen: 'Luo linkki ja avaa: {{text}}',
    createAndOpenVerse: 'Luo linkki ja avaa: {{verse}}',
    typing: 'Syötä raamatunviite: {{text}}',
    typingEmpty: 'Syötä raamatunviite',
  },
  errors: {
    multipleBooksFound: 'Useita raamatunkirjoja löytyi: {{books}}',
    bookNotFound: 'Raamatunkirjaa ei löytynyt: {{book}}',
    invalidVerseNumber: 'Virheellinen jaenumero',
    versesAscendingOrder: 'Jaeiden tulee olla kasvavassa järjestyksessä',
    invalidVerseFormat: 'Virheellinen jaeformaatti',
    invalidReferenceFormat: 'Virheellinen viiteformaatti',
    conversionError: 'Virhe raamatuntekstin muuntamisessa: {{message}}',
    unsupportedLanguage: 'Ei tuettu kieli: {{language}}',
    invalidChapter: 'Lukua {{chapter}} ei ole kirjassa {{book}}',
  },
};
