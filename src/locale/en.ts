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
    openAutomatically: {
      name: 'Open links automatically',
      description: 'Moves the "Link and open" command to the top of the list',
    },
    updatedLinkStrukture: {
      name: 'Keep link text',
      description: 'When enabled, the current link text will be kept when converting Bible text',
      keepCurrentStructure: 'Keep current structure',
      usePluginSettings: 'Use plugin settings',
    },
    noLanguageParameter: {
      name: 'Create links language independent',
      description:
        'When enabled, no language parameter is added to the link. Links will open in the language of the JW Library',
    },
    linkStyling: {
      name: 'Link Styling',
      description:
        'Choose characters or emoji to add before, after or inside the link, Choose font style',
      reset: 'Reset to default: "{{default}}"',
      prefixOutsideLink: {
        name: 'Prefix Outside Link',
        description: 'Text to add before the link',
      },
      prefixInsideLink: {
        name: 'Prefix Inside Link',
        description: 'Text to add at the beginning of the link text',
      },
      suffixInsideLink: {
        name: 'Suffix Inside Link',
        description: 'Text to add at the end of the link text',
      },
      suffixOutsideLink: {
        name: 'Suffix Outside Link',
        description: 'Text to add after the link',
      },
      presets: {
        name: 'Style Presets',
        description: 'Choose a preset style for the link',
      },
      fontStyle: {
        name: 'Font Style',
        description: 'Choose the font style for the link text',
        normal: 'Normal',
        italic: 'Italic',
        bold: 'Bold',
      },
      preview: {
        name: 'Preview',
      },
    },
  },
  commands: {
    replaceLinks: 'Convert all links',
    replaceBibleLinks: 'Convert Bible verse links',
    replacePublicationLinks: 'Convert publication links',
    replaceWebLinks: 'Convert all jw.org links to library links',
    convertWebLink: 'Convert selected jw.org link to Library link',
    convertBibleReference: 'Convert Bible reference to Library link',
    linkUnlinkedBibleReferences: 'Link unlinked Bible references',
  },
  notices: {
    multipleBooksFound: 'Multiple Bible books found: {{books}}',
    noBibleReferencesFound: 'No Bible references found in the document',
    convertedBibleReferences: 'Converted {{count}} Bible references',
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
    invalidVerseFormat: 'Invalid verse format',
    invalidReferenceFormat: 'Invalid reference format',
    conversionError: 'Error converting Bible text: {{message}}',
    unsupportedLanguage: 'Unsupported language: {{language}}',
    invalidChapter: 'Chapter does not exist {{chapter}} in {{book}}',
  },
};
