export const en = {
  settings: {
    language: {
      name: 'Language',
      description: 'Select the language for Bible references',
    },
    useShortNames: {
      name: 'Use short names in Bible links',
      description:
        'When enabled, Bible references will use abbreviated book names (e.g., "1Pe" instead of "1. Peter")',
    },
  },
  commands: {
    replaceLinks: 'Convert all links',
    replaceBibleLinks: 'Convert Bible verse links',
    replacePublicationLinks: 'Convert publication links',
    convertBibleReference: 'Convert Bible reference to Library link',
  },
  notices: {
    multipleBooksFound: 'Multiple Bible books found: {{books}}',
  },
  suggestions: {
    createLink: 'Create link: {{text}}',
    createLinks: 'Create links: {{text}}',
    createAndOpen: 'Create link and open: {{text}}',
    createAndOpenVerse: 'Create link and open: {{verse}}',
    typing: 'Enter Bible reference: {{text}}',
    typingEmpty: 'Enter Bible reference',
  },
  errors: {
    multipleBooksFound: 'Multiple Bible books found: {{books}}',
    bookNotFound: 'Bible book not found: {{book}}',
    invalidVerseNumber: 'Invalid verse number',
    versesAscendingOrder: 'Verses must be in ascending order',
    invalidFormat: 'Invalid reference format',
    invalidReferenceFormat: 'Invalid reference format',
    conversionError: 'Error converting Bible text: {{message}}',
    unsupportedLanguage: 'Unsupported language: {{language}}',
  },
};
