export const es = {
  settings: {
    language: {
      name: 'Idioma',
      description: 'Selecciona el idioma para las referencias bíblicas',
    },
    openAutomatically: {
      name: 'Abrir enlaces automáticamente',
      description: 'Mueve el comando "Enlazar y abrir" al principio de la lista',
    },
    updatedLinkStructure: {
      name: 'Conservar texto del enlace',
      description:
        'Si está activado, se conservará el texto actual del enlace al convertir textos bíblicos',
      keepCurrentStructure: 'Conservar estructura actual',
      usePluginSettings: 'Usar configuración del complemento',
    },
    noLanguageParameter: {
      name: 'Crear enlaces sin idioma específico',
      description:
        'Si está activado, no se añadirá ningún parámetro de idioma al enlace. Los enlaces se abrirán en el idioma correspondiente de JW Library',
    },
    bookLength: {
      name: 'Longitud del texto del enlace',
      description: 'Elige la longitud del texto del enlace',
      short: 'Corta',
      medium: 'Media',
      long: 'Larga',
    },
    linkStyling: {
      name: 'Estilo del enlace',
      description:
        'Elige caracteres o emojis que se añadan antes, después o dentro del enlace; elige el estilo de fuente',
      reset: 'Restablecer a predeterminado: "{{default}}"',
      prefixOutsideLink: {
        name: 'Prefijo fuera del enlace',
        description: 'Texto que se añade antes del enlace',
      },
      prefixInsideLink: {
        name: 'Prefijo dentro del enlace',
        description: 'Texto que se añade al inicio del texto del enlace',
      },
      suffixInsideLink: {
        name: 'Sufijo dentro del enlace',
        description: 'Texto que se añade al final del texto del enlace',
      },
      suffixOutsideLink: {
        name: 'Sufijo fuera del enlace',
        description: 'Texto que se añade después del enlace',
      },
      presets: {
        name: 'Estilos predefinidos',
        description: 'Elige un estilo predefinido para el enlace',
      },
      fontStyle: {
        name: 'Estilo de fuente',
        description: 'Elige el estilo de fuente para el texto del enlace',
        normal: 'Normal',
        italic: 'Cursiva',
        bold: 'Negrita',
      },
      preview: {
        name: 'Vista previa',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: 'Enlazar referencias bíblicas no enlazadas',
    convertToJWLibraryLinks: 'Convertir los enlaces de la selección en enlaces de la Biblioteca JW',
  },
  convertSuggester: {
    emptyStateText: 'Selecciona un tipo de conversión',
    options: {
      all: 'Todo',
      bible: 'Biblia',
      publication: 'Publicación',
      web: 'Web',
    },
  },
  notices: {
    convertedBibleReferences: '{{count}} referencias bíblicas convertidas',
    pleaseSelectText: 'Por favor selecciona texto para convertir',
  },
  suggestions: {
    createLink: 'Crear enlace: {{text}}',
    createLinks: 'Crear enlaces: {{text}}',
    createAndOpen: 'Crear enlace y abrir: {{text}}',
    createMultipleAndOpenFirst: 'Crear enlaces y abrir el primero: {{text}}',
    typing: 'Introduce referencia bíblica: {{text}}',
    typingEmpty: 'Introduce referencia bíblica',
  },
  errors: {
    invalidVerseNumber: 'Número de versículo no válido',
    versesAscendingOrder: 'Los versículos deben estar en orden ascendente',
    invalidVerseFormat: 'Formato de versículo no válido',
    invalidReferenceFormat: 'Formato de referencia no válido',
    unsupportedLanguage: 'Idioma no compatible',
  },
};
