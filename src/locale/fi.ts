export const fi = {
  settings: {
    language: {
      name: 'Kieli',
      description: 'Valitse kieli raamatunviitteille',
    },
    openAutomatically: {
      name: 'Avaa linkit automaattisesti',
      description: 'Siirtää "Linkitä ja avaa" -komennon listan kärkeen',
    },
    updatedLinkStructure: {
      name: 'Säilytä linkkiteksti',
      description:
        'Kun tämä on käytössä, nykyinen linkkiteksti säilytetään, kun Raamatun tekstiä muunnetaan',
      keepCurrentStructure: 'Säilytä nykyinen linkkiteksti',
      usePluginSettings: 'Käytä plugin-asetuksia',
    },
    noLanguageParameter: {
      name: 'Luo linkit kielestä riippumattomiksi',
      description:
        'Kun tämä on käytössä, linkkiin ei lisätä kieliparametria. Linkit avautuvat JW-kirjaston kielellä',
    },
    bookLength: {
      name: 'Linkin tekstin pituus',
      description: 'Valitse linkin tekstin pituus',
      short: 'Lyhyt',
      medium: 'Keskipitkä',
      long: 'Pitkä',
    },
    linkStyling: {
      name: 'Linkin tyyli',
      description:
        'Valitse merkit tai emoji, jotka lisätään linkin eteen, perään tai sisälle; valitse fonttityyli',
      reset: 'Palauta oletusasetukset: "{{default}}"',
      prefixOutsideLink: {
        name: 'Etuliite linkin ulkopuolella',
        description: 'Teksti, joka lisätään ennen linkkiä',
      },
      prefixInsideLink: {
        name: 'Etuliite linkin sisällä',
        description: 'Teksti, joka lisätään linkkitekstin alkuun',
      },
      suffixInsideLink: {
        name: 'Jälkiliite linkin sisällä',
        description: 'Teksti, joka lisätään linkkitekstin loppuun',
      },
      suffixOutsideLink: {
        name: 'Jälkiliite linkin ulkopuolella',
        description: 'Teksti, joka lisätään linkin jälkeen',
      },
      presets: {
        name: 'Linkin tyyli',
        description: 'Valitse linkin tyyli',
      },
      fontStyle: {
        name: 'Fonttityyli',
        description: 'Valitse fonttityyli linkkitekstille',
        normal: 'Normaali',
        italic: 'Kursiivi',
        bold: 'Lihavoitu',
      },
      preview: {
        name: 'Esikatselu',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: 'Linkitä linkittömät raamatunviitteet',
    convertToJWLibraryLinks: 'Muunna valitun tekstin linkit JW-kirjastolinkkiksi',
  },
  convertSuggester: {
    emptyStateText: 'Valitse muunnostyyppi',
    options: {
      all: 'Kaikki',
      bible: 'Raamatunviitteet',
      publication: 'Julkaisut',
      // web: 'Verkko',
    },
  },
  notices: {
    convertedBibleReferences: 'Muunnettu {{count}} raamatunviitettä',
    pleaseSelectText: 'Valitse teksti muunnettavaksi',
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
