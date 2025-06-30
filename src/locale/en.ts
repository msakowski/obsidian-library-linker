export const en = {
  settings: {
    language: {
      name: 'Language',
      description: 'Select the language for Bible references',
    },
    openAutomatically: {
      name: 'Open links automatically',
      description: 'Moves the "Link and open" command to the top of the list',
    },
    updatedLinkStructure: {
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
    bookLength: {
      name: 'Link text length',
      description: 'Choose the length of the link text',
      short: 'Short',
      medium: 'Medium',
      long: 'Long',
    },
    linkStyling: {
      name: 'Link styling',
      description:
        'Choose characters or emoji to add before, after or inside the link, Choose font style',
      reset: 'Reset to default: "{{default}}"',
      prefixOutsideLink: {
        name: 'Prefix outside link',
        description: 'Text to add before the link',
      },
      prefixInsideLink: {
        name: 'Prefix inside link',
        description: 'Text to add at the beginning of the link text',
      },
      suffixInsideLink: {
        name: 'Suffix inside link',
        description: 'Text to add at the end of the link text',
      },
      suffixOutsideLink: {
        name: 'Suffix outside link',
        description: 'Text to add after the link',
      },
      presets: {
        name: 'Style presets',
        description: 'Choose a preset style for the link',
      },
      fontStyle: {
        name: 'Font style',
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
    linkUnlinkedBibleReferences: 'Link unlinked Bible references',
    convertToJWLibraryLinks: 'Convert links in selection to JW Library links',
  },
  convertSuggester: {
    emptyStateText: 'Select a conversion type',
    options: {
      all: 'All',
      bible: 'Bible references',
      publication: 'Publications',
      // web: 'Web',
    },
  },
  notices: {
    convertedBibleReferences: 'Converted {{count}} Bible references',
    pleaseSelectText: 'Please select text to convert',
  },
  suggestions: {
    createLink: 'Create link: {{text}}',
    createLinks: 'Create links: {{text}}',
    createAndOpen: 'Create link and open: {{text}}',
    createMultipleAndOpenFirst: 'Create links and open first: {{text}}',
    typing: 'Enter Bible reference: {{text}}',
    typingEmpty: 'Enter Bible reference',
  },
  errors: {
    invalidVerseNumber: 'Invalid verse number',
    versesAscendingOrder: 'Verses must be in ascending order',
    invalidVerseFormat: 'Invalid verse format',
    invalidReferenceFormat: 'Invalid reference format',
    unsupportedLanguage: 'Unsupported language',
  },
};
