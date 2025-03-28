export const de = {
  settings: {
    language: {
      name: 'Sprache',
      description: 'Wähle die Sprache für die Bibelverweise',
    },
    useShortNames: {
      name: 'Kurznamen in Bibelverweisen verwenden',
      description:
        'Wenn aktiviert, werden Bibelverweise mit abgekürzten Buchnamen angezeigt (z.B. "1Pe" statt "1. Petrus")',
    },
    openAutomatically: {
      name: 'Links automatisch öffnen',
      description: 'Verschiebt den Befehl "Link und öffnen" an den Anfang der Liste',
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
