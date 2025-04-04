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
    updatedLinkStrukture: {
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
    replaceLinks: 'Alle Links umwandeln',
    replaceBibleLinks: 'Bibelvers-Links umwandeln',
    replacePublicationLinks: 'Publikations-Links umwandeln',
    convertBibleReference: 'Bibelverweis in JW Library-Link umwandeln',
    convertWebLink: 'jw.org-Link in Library-Link umwandeln',
    replaceWebLinks: 'jw.org-Links in Library-Links umwandeln',
    linkUnlinkedBibleReferences: 'Unverlinkte Bibeltexte verlinken',
  },
  notices: {
    multipleBooksFound: 'Mehrere Bibelbücher gefunden: {{books}}',
    noBibleReferencesFound: 'Keine Bibeltexte im Dokument gefunden',
    convertedBibleReferences: '{{count}} Bibeltexte umgewandelt',
  },
  suggestions: {
    createLink: 'Link erstellen: {{text}}',
    createLinks: 'Links erstellen: {{text}}',
    createAndOpen: 'Link erstellen und öffnen: {{text}}',
    createAndOpenVerse: 'Link erstellen und öffnen: {{verse}}',
    typing: 'Bibelverweis eingeben: {{text}}',
    typingEmpty: 'Bibelverweis eingeben',
  },
  errors: {
    multipleBooksFound: 'Mehrere Bibelbücher gefunden: {{books}}',
    bookNotFound: 'Bibelbuch nicht gefunden: {{book}}',
    invalidVerseNumber: 'Ungültige Versnummer',
    versesAscendingOrder: 'Verse müssen in aufsteigender Reihenfolge sein',
    invalidVerseFormat: 'Ungültiges Versformat',
    invalidReferenceFormat: 'Ungültiges Referenzformat',
    conversionError: 'Fehler beim Konvertieren des Bibeltextes: {{message}}',
    unsupportedLanguage: 'Nicht unterstützte Sprache: {{language}}',
    invalidChapter: 'Kapitel {{chapter}} existiert nicht in {{book}}',
  },
};
