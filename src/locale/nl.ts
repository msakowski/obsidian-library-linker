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
        name: 'Linkvoorbeeld',
      },
    },
    bibleQuote: {
      name: 'Bijbelcitaat Formattering',
      description: 'Configureer hoe bijbelcitaten worden geformatteerd wanneer ze worden ingevoegd',
      format: {
        name: 'Citaat formaat',
        description: 'Kies het formaat voor ingevoegde bijbelcitaten',
        short: 'Kort (eenvoudig citaat)',
        longFoldable: 'Lang (inklapbaar callout)',
        longExpanded: 'Lang (uitgeklapt callout)',
      },
      calloutType: {
        name: 'Callout type',
        description: 'Type callout voor lange formaten (bijv. quote, note, info)',
      },
      preview: {
        name: 'Bijbelcitaat Voorbeeld',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: 'Link niet gelinkte Bijbeltekst verwijzingen',
    convertToJWLibraryLinks: 'Converteer geselecteerde links naar JW Library links',
    insertBibleQuotes: 'Voeg bijbelcitaten toe voor JW Library links',
    insertBibleQuoteAtCursor: 'Voeg bijbelcitaat toe bij cursor',
  },
  convertSuggester: {
    emptyStateText: 'Selecteer een conderteer type',
    options: {
      all: 'Alle',
      bible: 'Bijbel verwijzingen',
      publication: 'Publicaties',
      // web: 'Web',
    },
  },
  contextMenu: {
    insertBibleQuote: 'Voeg bijbelcitaat toe',
  },
  notices: {
    convertedBibleReferences: '{{count}} bijbelteksten geconverteerd',
    pleaseSelectText: 'Selecteer text om te converteren',
    noBibleReferencesFound: 'Geen bijbelverwijzingen gevonden',
    bibleQuotesInserted: 'Bijbelcitaten succesvol toegevoegd',
    noBibleLinksFound: 'Geen JW Library links gevonden',
    bibleQuotesInsertedSelection: 'Bijbelcitaten toegevoegd voor selectie',
    bibleQuoteInsertedAtCursor: 'Bijbelcitaat toegevoegd bij cursor',
    noBibleLinkAtCursor: 'Geen JW Library link gevonden bij cursor',
    bibleQuoteAlreadyExists: 'Bijbelcitaat bestaat al',
    errorInsertingQuotes: 'Fout bij het toevoegen van bijbelcitaten',
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
    chaptersAscendingOrder: 'Hoofdstukken moeten in oplopende volgorde zijn',
    invalidVerseFormat: 'Ongeldig versformaat',
    invalidReferenceFormat: 'Ongeldig referentieformaat',
    unsupportedLanguage: 'Niet ondersteunde taal',
  },
};
