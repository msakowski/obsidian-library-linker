export const de = {
  settings: {
    language: {
      name: 'Sprache',
      description: 'Wähle die Sprache für die Bibelverweise',
    },
    openAutomatically: {
      name: 'Links automatisch öffnen',
      description: 'Verschiebt den Befehl "Link und öffnen" an den Anfang der Liste',
    },
    updatedLinkStructure: {
      name: 'Linktext beibehalten',
      description:
        'Wenn aktiviert, wird der aktuelle Linktext beim Umwandeln von Bibeltexten beibehalten',
      keepCurrentStructure: 'Aktuellen Linktext beibehalten',
      usePluginSettings: 'Plugin-Einstellungen verwenden',
    },
    noLanguageParameter: {
      name: 'Links sprachunabhängig erstellen',
      description:
        'Wenn aktiviert, werden am Ende eines Links keine Sprachparameter hinzugefügt. Links werden in der jeweiligen Sprache der JW Library geöffnet',
    },
    bookLength: {
      name: 'Linktext-Länge',
      description: 'Wähle die Länge des Linktextes',
      short: 'Kurz',
      medium: 'Mittel',
      long: 'Lang',
    },
    linkStyling: {
      name: 'Link-Styling',
      description:
        'Wähle Zeichen oder Emojis, die nach oder innerhalb des Links eingefügt werden; wähle Schriftstil',
      reset: 'Zurücksetzen auf Standard: "{{default}}"',
      prefixOutsideLink: {
        name: 'Präfix außerhalb des Links',
        description: 'Text, der vor dem Link hinzugefügt wird',
      },
      prefixInsideLink: {
        name: 'Präfix innerhalb des Links',
        description: 'Text, der am Anfang des Linktextes hinzugefügt wird',
      },
      suffixInsideLink: {
        name: 'Suffix innerhalb des Links',
        description: 'Text, der am Ende des Linktextes hinzugefügt wird',
      },
      suffixOutsideLink: {
        name: 'Suffix außerhalb des Links',
        description: 'Text, der nach dem Link hinzugefügt wird',
      },
      presets: {
        name: 'Stilvorlagen',
        description: 'Wähle eine Stilvorlage für den Link',
      },
      fontStyle: {
        name: 'Schriftstil',
        description: 'Wähle den Schriftstil für den Linktext',
        normal: 'Normal',
        italic: 'Kursiv',
        bold: 'Fett',
      },
      preview: {
        name: 'Vorschau',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: 'Unverlinkte Bibeltexte verlinken',
    convertToJWLibraryLinks: 'Links in Auswahl in JW Library-Links umwandeln',
  },
  convertSuggester: {
    emptyStateText: 'Wähle einen Konvertierungstyp',
    options: {
      all: 'Alle',
      bible: 'Bibeltexte',
      publication: 'Publikationen',
      web: 'jw.org-Links',
    },
  },
  notices: {
    convertedBibleReferences: '{{count}} Bibeltexte umgewandelt',
    pleaseSelectText: 'Bitte wähle Text zum Konvertieren aus',
  },
  suggestions: {
    createLink: 'Link erstellen: {{text}}',
    createLinks: 'Links erstellen: {{text}}',
    createAndOpen: 'Link erstellen und öffnen: {{text}}',
    createMultipleAndOpenFirst: 'Links erstellen und ersten öffnen: {{text}}',
    typing: 'Bibelverweis eingeben: {{text}}',
    typingEmpty: 'Bibelverweis eingeben',
  },
  errors: {
    invalidVerseNumber: 'Ungültige Versnummer',
    versesAscendingOrder: 'Verse müssen in aufsteigender Reihenfolge sein',
    invalidVerseFormat: 'Ungültiges Versformat',
    invalidReferenceFormat: 'Ungültiges Referenzformat',
    unsupportedLanguage: 'Nicht unterstützte Sprache',
  },
};
