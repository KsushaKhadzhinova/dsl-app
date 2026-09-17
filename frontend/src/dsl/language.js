export const LANGUAGE_ID = 'diagramcode';

const KEYWORDS = ['diagram'];

const NODE_KINDS = [
  'entity',
  'place',
  'transition',
  'start_event',
  'end_event',
  'task',
  'class',
  'actor',
  'usecase',
  'state',
  'activity',
  'gateway',
  'event',
  'block',
  'process',
  'store',
  'node',
];

export function registerDiagramCodeLanguage(monaco) {
  const alreadyRegistered = monaco.languages.getLanguages().some((lang) => lang.id === LANGUAGE_ID);
  if (alreadyRegistered) {
    return;
  }

  monaco.languages.register({ id: LANGUAGE_ID });

  monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
    keywords: KEYWORDS,
    typeKeywords: NODE_KINDS,
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/-\[\s*"[^"]*"\s*\]->/, 'operator'],
        [/->/, 'operator'],
        [/\d+/, 'number'],
        [
          /[a-zA-Z_][\w.]*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier',
            },
          },
        ],
        [/[{}()=]/, 'delimiter'],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
    comments: { lineComment: '//' },
    brackets: [
      ['{', '}'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
  });

  monaco.editor.defineTheme('diagramcode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7dd3d8' },
      { token: 'type', foreground: '7dd3d8' },
      { token: 'string', foreground: '9bc79a' },
      { token: 'identifier', foreground: 'b8a9d9' },
      { token: 'comment', foreground: '6d6d70' },
      { token: 'number', foreground: 'e0b979' },
    ],
    colors: {
      'editor.background': '#141415',
    },
  });

  monaco.editor.defineTheme('diagramcode-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0f7c85' },
      { token: 'type', foreground: '0f7c85' },
      { token: 'string', foreground: '3a7a3a' },
      { token: 'identifier', foreground: '6a4fa0' },
      { token: 'comment', foreground: '8a8a8d' },
      { token: 'number', foreground: 'a3671a' },
    ],
    colors: {
      'editor.background': '#fbfbfc',
    },
  });
}
