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
    //
  },
  suggestions: {
    createLink: 'Luo linkki: {{text}}',
    createLinks: 'Luo linkit: {{text}}',
    createAndOpen: 'Luo linkki ja avaa: {{text}}',
    createMultipleAndOpenFirst: 'Luo linkkejä ja avaa ensin: {{text}}',
    typing: 'Syötä raamatunviite: {{text}}',
    typingEmpty: 'Syötä raamatunviite',
  },
  errors: {
    invalidVerseNumber: 'Virheellinen jaenumero',
    versesAscendingOrder: 'Jaeiden tulee olla kasvavassa järjestyksessä',
    invalidVerseFormat: 'Virheellinen jaeformaatti',
    invalidReferenceFormat: 'Virheellinen viiteformaatti',
    unsupportedLanguage: 'Ei tuettu kieli',
  },
};
