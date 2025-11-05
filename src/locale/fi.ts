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
    reconvertExistingLinks: {
      name: 'Muunna olemassa olevat linkit uudelleen',
      description:
        'Kun tämä on käytössä, jo muunnetut jwlibrary:// linkit muunnetaan uudelleen nykyisten muotoiluasetusten mukaan. Tämä mahdollistaa kaikkien linkkien päivittämisen vastaamaan uusimpia asetuksia.',
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
        name: 'Linkin esikatselu',
      },
    },
    bibleQuote: {
      name: 'Raamatunlainauksen Muotoilu',
      description: 'Määritä miten raamatunlainaukset muotoillaan kun ne lisätään',
      format: {
        name: 'Lainauksen muoto',
        description: 'Valitse muoto lisättäville raamatunlainauksille',
        short: 'Lyhyt (yksinkertainen lainaus)',
        longFoldable: 'Pitkä (taittuvä callout)',
        longExpanded: 'Pitkä (laajentuva callout)',
      },
      calloutType: {
        name: 'Callout-tyyppi',
        description: 'Callout-tyyppi pitkille muodoille (esim. quote, note, info)',
      },
      preview: {
        name: 'Raamatunlainauksen Esikatselu',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: 'Linkitä linkittömät raamatunviitteet',
    convertToJWLibraryLinks: 'Muunna valitun tekstin linkit JW-kirjastolinkkiksi',
    insertBibleQuotes: 'Lisää raamatunlainaukset JW-kirjastolinkeille',
    insertBibleQuoteAtCursor: 'Lisää raamatunlainaus kursoriin',
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
  contextMenu: {
    insertBibleQuote: 'Lisää raamatunlainaus',
  },
  notices: {
    convertedBibleReferences: 'Muunnettu {{count}} raamatunviitettä',
    pleaseSelectText: 'Valitse teksti muunnettavaksi',
    noBibleReferencesFound: 'Ei raamatunviitteitä löytynyt',
    bibleQuotesInserted: 'Raamatunlainaukset lisätty onnistuneesti',
    noBibleLinksFound: 'JW-kirjastolinkkejä ei löytynyt',
    bibleQuotesInsertedSelection: 'Raamatunlainaukset lisätty valinnalle',
    bibleQuoteInsertedAtCursor: 'Raamatunlainaus lisätty kursoriin',
    noBibleLinkAtCursor: 'JW-kirjastolinkkiä ei löytynyt kursorista',
    bibleQuoteAlreadyExists: 'Raamatunlainaus on jo olemassa',
    errorInsertingQuotes: 'Virhe raamatunlainausten lisäämisessä',
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
