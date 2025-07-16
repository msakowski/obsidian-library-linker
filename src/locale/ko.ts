export const ko = {
  settings: {
    language: {
      name: '언어',
      description: '성경 참조를 위한 언어를 선택합니다',
    },
    openAutomatically: {
      name: '링크 자동 열기',
      description: '"링크하고 열기" 명령을 목록의 맨 위로 이동합니다',
    },
    updatedLinkStructure: {
      name: '링크 텍스트 유지',
      description: '활성화하면 성경 텍스트를 변환할 때 현재 링크 텍스트가 유지됩니다',
      keepCurrentStructure: '현재 구조 유지',
      usePluginSettings: '플러그인 설정 사용',
    },
    noLanguageParameter: {
      name: '링크를 언어 독립적으로 생성',
      description:
        '활성화하면 링크에 언어 매개변수가 추가되지 않습니다. 링크는 JW Library의 언어로 열립니다',
    },
    bookLength: {
      name: '링크 텍스트 길이',
      description: '링크 텍스트의 길이를 선택합니다',
      short: '짧게',
      medium: '중간',
      long: '길게',
    },
    linkStyling: {
      name: '링크 스타일',
      description: '링크 앞, 뒤 또는 내부에 추가할 문자 또는 이모지, 글꼴 스타일을 선택합니다',
      reset: '기본값으로 재설정: "{{default}}"',
      prefixOutsideLink: {
        name: '링크 외부 접두사',
        description: '링크 앞에 추가할 텍스트',
      },
      prefixInsideLink: {
        name: '링크 내부 접두사',
        description: '링크 텍스트 시작 부분에 추가할 텍스트',
      },
      suffixInsideLink: {
        name: '링크 내부 접미사',
        description: '링크 텍스트 끝 부분에 추가할 텍스트',
      },
      suffixOutsideLink: {
        name: '링크 외부 접미사',
        description: '링크 뒤에 추가할 텍스트',
      },
      presets: {
        name: '스타일 프리셋',
        description: '링크에 대한 사전 설정 스타일을 선택합니다',
      },
      fontStyle: {
        name: '글꼴 스타일',
        description: '링크 텍스트의 글꼴 스타일을 선택합니다',
        normal: '보통',
        italic: '이탤릭체',
        bold: '굵게',
      },
      preview: {
        name: '미리보기',
      },
    },
  },
  commands: {
    linkUnlinkedBibleReferences: '링크되지 않은 성경 참조 링크',
    convertToJWLibraryLinks: '선택 항목의 링크를 JW Library 링크로 변환',
  },
  convertSuggester: {
    emptyStateText: '변환 유형을 선택하세요',
    options: {
      all: '모두',
      bible: '성경 참조',
      publication: '출판물',
      // web: '웹', // 주석 처리된 부분은 번역하지 않습니다.
    },
  },
  notices: {
    convertedBibleReferences: '{{count}} 개의 성경 참조를 변환했습니다',
    pleaseSelectText: '변환할 텍스트를 선택해 주세요',
    noBibleReferencesFound: '성경 참조를 찾을 수 없습니다',
  },
  suggestions: {
    createLink: '링크 생성: {{text}}',
    createLinks: '링크 생성: {{text}}',
    createAndOpen: '링크 생성 및 열기: {{text}}',
    createMultipleAndOpenFirst: '링크 생성 및 첫 번째 링크 열기: {{text}}',
    typing: '성경 참조 입력: {{text}}',
    typingEmpty: '성경 참조 입력',
  },
  errors: {
    invalidVerseNumber: '잘못된 절 번호',
    versesAscendingOrder: '절은 오름차순이어야 합니다',
    invalidVerseFormat: '잘못된 절 형식',
    invalidReferenceFormat: '잘못된 참조 형식',
    unsupportedLanguage: '지원되지 않는 언어',
  },
};
