export const fr = {
  settings: {
    language: {
      name: 'Langue',
      description: 'Sélectionnez la langue pour les références bibliques',
    },
    openAutomatically: {
      name: 'Ouvrir les liens automatiquement',
      description: 'Déplace la commande "Lier et ouvrir" en haut de la liste',
    },
    updatedLinkStructure: {
      name: 'Conserver le texte du lien',
      description:
        'Lorsque activé, le texte actuel du lien sera conservé lors de la conversion du texte biblique',
      keepCurrentStructure: 'Conserver la structure actuelle',
      usePluginSettings: 'Utiliser les paramètres du plugin',
    },
    noLanguageParameter: {
      name: 'Créer des liens indépendants de la langue',
      description:
        "Lorsque activé, aucun paramètre de langue n'est ajouté au lien. Les liens s'ouvriront dans la langue de JW Library",
    },
    bookLength: {
      name: 'Longueur du texte du lien',
      description: 'Choisissez la longueur du texte du lien',
      short: 'Court',
      medium: 'Moyen',
      long: 'Long',
    },
    linkStyling: {
      name: 'Style du lien',
      description:
        "Choisissez les caractères ou emoji à ajouter avant, après ou à l'intérieur du lien, choisissez le style de police",
      reset: 'Réinitialiser par défaut : "{{default}}"',
      prefixOutsideLink: {
        name: 'Préfixe en dehors du lien',
        description: 'Texte à ajouter avant le lien',
      },
      prefixInsideLink: {
        name: "Préfixe à l'intérieur du lien",
        description: 'Texte à ajouter au début du texte du lien',
      },
      suffixInsideLink: {
        name: "Suffixe à l'intérieur du lien",
        description: 'Texte à ajouter à la fin du texte du lien',
      },
      suffixOutsideLink: {
        name: 'Suffixe en dehors du lien',
        description: 'Texte à ajouter après le lien',
      },
      presets: {
        name: 'Préréglages de style',
        description: 'Choisissez un style prédéfini pour le lien',
      },
      fontStyle: {
        name: 'Style de police',
        description: 'Choisissez le style de police pour le texte du lien',
        normal: 'Normal',
        italic: 'Italique',
        bold: 'Gras',
      },
      preview: {
        name: 'Aperçu du lien',
      },
    },
    bibleQuote: {
      name: 'Formatage des citations bibliques',
      description:
        "Configurez la façon dont les citations bibliques sont formatées lors de l'insertion",
      format: {
        name: 'Format de citation',
        description: 'Choisissez le format pour les citations bibliques insérées',
        short: 'Court (citation simple)',
        longFoldable: 'Long (encadré pliable)',
        longExpanded: 'Long (encadré développé)',
      },
      calloutType: {
        name: "Type d'encadré",
        description: "Type d'encadré pour les formats longs (par ex., citation, note, info)",
      },
      preview: {
        name: 'Aperçu de la citation biblique',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: 'Lier les références bibliques non liées',
    convertToJWLibraryLinks: 'Convertir les liens dans la sélection en liens JW Library',
    insertBibleQuotes: 'Insérer des citations bibliques pour les liens JW Library',
    insertBibleQuoteAtCursor: 'Insérer une citation biblique au curseur',
  },
  convertSuggester: {
    emptyStateText: 'Sélectionnez un type de conversion',
    options: {
      all: 'Tout',
      bible: 'Références bibliques',
      publication: 'Publications',
      // web: 'Web',
    },
  },
  contextMenu: {
    insertBibleQuote: 'Insérer une citation biblique',
  },
  notices: {
    convertedBibleReferences: '{{count}} références bibliques converties',
    pleaseSelectText: 'Veuillez sélectionner le texte à convertir',
    noBibleReferencesFound: 'Aucune référence biblique trouvée',
    bibleQuotesInserted: 'Citations bibliques insérées avec succès',
    bibleQuotesInsertedSelection: 'Citations bibliques insérées pour la sélection',
    bibleQuoteInsertedAtCursor: 'Citation biblique insérée au curseur',
    noBibleLinksFound: 'Aucun lien JW Library trouvé',
    noBibleLinkAtCursor: 'Aucun lien JW Library trouvé au curseur',
    bibleQuoteAlreadyExists: 'La citation biblique existe déjà',
    errorInsertingQuotes: "Erreur lors de l'insertion des citations bibliques",
  },
  suggestions: {
    createLink: 'Créer un lien : {{text}}',
    createLinks: 'Créer des liens : {{text}}',
    createAndOpen: 'Créer un lien et ouvrir : {{text}}',
    createMultipleAndOpenFirst: 'Créer des liens et ouvrir le premier : {{text}}',
    typing: 'Entrez une référence biblique : {{text}}',
    typingEmpty: 'Entrez une référence biblique',
  },
  errors: {
    invalidVerseNumber: 'Numéro de verset invalide',
    versesAscendingOrder: "Les versets doivent être dans l'ordre croissant",
    invalidVerseFormat: 'Format de verset invalide',
    invalidReferenceFormat: 'Format de référence invalide',
    unsupportedLanguage: 'Langue non prise en charge',
  },
};
