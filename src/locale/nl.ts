export const nl = {
  settings: {
    language: {
      name: 'Taal',
      description: 'Kies de taal voor de bijbelverwijzingen',
    },
    openAutomatically: {
      name: 'Links automatisch openen',
      description: 'Verplaatst het commando "Link en openen" naar de bovenkant van de lijst',
    },
    updatedLinkStructure: {
      name: 'Linktekst behouden',
      description:
        'Indien ingeschakeld, wordt de huidige linktekst behouden bij het converteren van bijbelteksten',
      keepCurrentStructure: 'Huidige linktekst behouden',
      usePluginSettings: 'Plugin-instellingen gebruiken',
    },
    noLanguageParameter: {
      name: 'Links taalonafhankelijk maken',
      description:
        'Indien ingeschakeld, worden geen taalparameters toegevoegd aan het einde van een link. Links worden geopend in de taal van de JW Library',
    },
    bookLength: {
      name: 'Linktekst-lengte',
      description: 'Kies de lengte van de linktekst',
      short: 'Kort',
      medium: 'Middel',
      long: 'Lang',
    },
    linkStyling: {
      name: 'Link-styling',
      description:
        "Kies tekens of emoji's die na of binnen de link worden ingevoegd; kies tekst stijl",
      reset: 'Terugzetten naar standaard: "{{default}}"',
      prefixOutsideLink: {
        name: 'Voorvoegsel buiten de link',
        description: 'Tekst die voor de link wordt toegevoegd',
      },
      prefixInsideLink: {
        name: 'Voorvoegsel binnen de link',
        description: 'Tekst die aan het begin van de linktekst wordt toegevoegd',
      },
      suffixInsideLink: {
        name: 'Achtervoegsel binnen de link',
        description: 'Tekst die aan het einde van de linktekst wordt toegevoegd',
      },
      suffixOutsideLink: {
        name: 'Achtervoegsel buiten de link',
        description: 'Tekst die na de link wordt toegevoegd',
      },
      presets: {
        name: 'Stijlsjablonen',
        description: 'Kies een stijlsjabloon voor de link',
      },
      fontStyle: {
        name: 'Tekst stijl',
        description: 'Kies de tekststijl voor de linktekst',
        normal: 'Normaal',
        italic: 'Cursief',
        bold: 'Vet',
      },
      preview: {
        name: 'Voorbeeld',
      },
    },
  },
  commands: {
    replaceLinks: 'Alle links converteren',
    replaceBibleLinks: 'Bijbelvers-links converteren',
    replacePublicationLinks: 'Publicatie-links converteren',
    convertBibleReference: 'Bijbelverwijzing naar JW Library-link converteren',
    convertWebLink: 'jw.org-link naar JW Library-link converteren',
    replaceWebLinks: 'jw.org-links naar JW Library-links converteren',
    linkUnlinkedBibleReferences: 'Niet-gelinkte bijbelteksten linken',
  },
  notices: {
    convertedBibleReferences: '{{count}} bijbelteksten geconverteerd',
  },
  suggestions: {
    createLink: 'Link maken: {{text}}',
    createLinks: 'Links maken: {{text}}',
    createAndOpen: 'Link maken en openen: {{text}}',
    createMultipleAndOpenFirst: 'Links maken en eerste openen: {{text}}',
    typing: 'Bijbelverwijzing invoeren: {{text}}',
    typingEmpty: 'Bijbelverwijzing invoeren',
  },
  errors: {
    invalidVerseNumber: 'Ongeldig versnummer',
    versesAscendingOrder: 'Verzen moeten in oplopende volgorde zijn',
    invalidVerseFormat: 'Ongeldig versformaat',
    invalidReferenceFormat: 'Ongeldig referentieformaat',
    unsupportedLanguage: 'Niet ondersteunde taal',
  },
};
