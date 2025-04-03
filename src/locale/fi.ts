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
    updatedLinkStrukture: {
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
    replaceLinks: 'Muunna kaikki linkit',
    replaceBibleLinks: 'Muunna raamatunjaelinkit',
    replacePublicationLinks: 'Muunna julkaisulinkit',
    convertBibleReference: 'Muunna raamatunviite kirjastolinkiksi',
    convertWebLink: 'Muunna jw.org-linkki kirjastolinkiksi',
    replaceWebLinks: 'Muunna kaikki jw.org-linkit kirjastolinkeiksi',
    linkUnlinkedBibleReferences: 'Linkitä linkittömät raamatunviitteet',
  },
  notices: {
    multipleBooksFound: 'Useita raamatunkirjoja löytyi: {{books}}',
    noBibleReferencesFound: 'Dokumentista ei löytynyt raamatunviitteitä',
    convertedBibleReferences: 'Muunnettu {{count}} raamatunviitettä',
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
