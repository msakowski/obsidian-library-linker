export const pt = {
  settings: {
    language: {
      name: 'Idioma',
      description: 'Selecione o idioma para as referências da Bíblia',
    },
    openAutomatically: {
      name: 'Abrir automaticamente hiperligações da JW Library',
      description: 'Move o comando "Criar hiperligação e abrir" para o topo da lista',
    },
    updatedLinkStructure: {
      name: 'Manter o texto da hiperligação',
      description: 'Quando ativo, o texto atual será mantido ao converter textos bíblicos',
      keepCurrentStructure: 'Manter estrutura atual',
      usePluginSettings: 'Usar configurações do plugin',
    },
    noLanguageParameter: {
      name: 'Criar hiperligações independente de idioma',
      description:
        'Ao ativar, as hiperligações da JW Library serão criados sem o parâmetro de idioma. As hiperligações serão abertas no idioma do aplicativo JW Library.',
    },
    reconvertExistingLinks: {
      name: 'Reconverter hiperligações existentes',
      description:
        'Quando ativado, as hiperligações jwlibrary:// já convertidas serão reconvertidas de acordo com as configurações de formatação atuais. Isso permite atualizar todas as hiperligações para corresponder às suas preferências mais recentes.',
    },
    bookLength: {
      name: 'Comprimento do texto da hiperligação do livro bíblico',
      description: 'Escolha o comprimento do texto do livro bíblico na hiperligação',
      short: 'Curto',
      medium: 'Médio',
      long: 'Longo',
    },
    linkStyling: {
      name: 'Estilos de hiperligação',
      description:
        'Escolha caracteres ou emojis para adicionar antes, depois ou no interior da hiperligação, Escolha o estilo da fonte',
      reset: 'Regressar às configurações originais: "{{default}}"',
      prefixOutsideLink: {
        name: 'Prefixo fora da hiperligação',
        description: 'Texto a adicionar antes da hiperligação',
      },
      prefixInsideLink: {
        name: 'Prefixo dentro da hiperligação',
        description: ' Texto a adicionar no início do texto da hiperligação',
      },
      suffixInsideLink: {
        name: 'Sufixo dentro da hiperligação',
        description: 'Texto a adicionar no final do texto da hiperligação',
      },
      suffixOutsideLink: {
        name: 'Sufixo fora da hiperligação',
        description: 'Texto a adicionar após a hiperligação',
      },
      presets: {
        name: 'Estilos predefinidos',
        description: 'Escolha um estilo predefinido para as hiperligações',
      },
      fontStyle: {
        name: 'Font style',
        description: 'Escolha o estilo da fonte para o texto da hiperligação',
        normal: 'Normal',
        italic: 'Italico',
        bold: 'Negrito',
      },
      preview: {
        name: 'Pré-visualização do estilo da hiperligação',
      },
    },
    bibleQuote: {
      name: 'Foramato da citação bíblica',
      description: 'Configure o formato das citações bíblicas inseridas',
      format: {
        name: 'Formato da citação bíblica',
        description: 'Escolha o formato para citações bíblicas inseridas',
        short: 'Curta (citação simples)',
        longFoldable: 'Longa (callout dobrável)',
        longExpanded: 'Longa (callout expandido)',
      },
      calloutType: {
        name: 'Tipo de callout',
        description: 'Tipo de callout para citações longas (e.g., citação, nota, info)',
      },
      preview: {
        name: 'Pré-visualização da citação bíblica',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: 'Hiperligar referências bíblicas não ligadas',
    convertToJWLibraryLinks: 'Converter hiperligações selecionadas em hiperligações da JW Library links',
    insertBibleQuotes: 'Inserir citação bíblica para hiperligações da JW Library',
    insertBibleQuoteAtCursor: 'Inserir citação bíblica no cursor',
  },
  convertSuggester: {
    emptyStateText: 'Selecione um tipo de conversão',
    options: {
      all: 'Tudo',
      bible: 'Referências bíblicas',
      publication: 'Publicações',
      // web: 'Web',
    },
  },
  contextMenu: {
    insertBibleQuote: 'Inserir citação bíblica',
  },
  notices: {
    convertedBibleReferences: '{{count}} referência(s) bíblica(s) convertida(s)',
    pleaseSelectText: 'Selecione algum texto para converter',
    noBibleReferencesFound: 'Nenhuma referência bíblica encontrada no texto selecionado',
    bibleQuotesInserted: 'Citação bíblica inserida com sucesso',
    bibleQuotesInsertedSelection: 'Citação bíblica inserida para a seleção',
    bibleQuoteInsertedAtCursor: ' Citação bíblica inserida no cursor',
    noBibleLinksFound: 'Nenhuma hiperligação da JW Library encontrada',
    noBibleLinkAtCursor: 'Nenhuma hiperligação da JW Library encontrada no cursor',
    bibleQuoteAlreadyExists: 'Citação bíblica já existe para esta hiperligação',
    errorInsertingQuotes: 'Erro ao inserir citações bíblicas',
  },
  suggestions: {
    createLink: 'Criar hiperligação: {{text}}',
    createLinks: 'Criar hiperligação: {{text}}',
    createAndOpen: 'Criar hiperligação e abrir: {{text}}',
    createMultipleAndOpenFirst: 'Criar hiperligação e abrir primeiro: {{text}}',
    typing: 'Insira referência bíblica: {{text}}',
    typingEmpty: 'Insira referência bíblica',
  },
  errors: {
    invalidVerseNumber: 'Número de versículo inválido',
    versesAscendingOrder: 'Versículos devem estar em ordem ascendente',
    chaptersAscendingOrder: 'Capítulos devem estar em ordem ascendente',
    invalidVerseFormat: 'Formato de versículo inválido',
    invalidReferenceFormat: 'Formato de referência inválido',
    unsupportedLanguage: 'Idioma não suportado para referências bíblicas',
  },
};
