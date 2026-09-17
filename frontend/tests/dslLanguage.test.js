import { registerDiagramCodeLanguage, LANGUAGE_ID } from '../src/dsl/language.js';

function createFakeMonaco() {
  const registered = [];
  return {
    languages: {
      getLanguages: () => registered,
      register: (language) => registered.push(language),
      setMonarchTokensProvider: jest.fn(),
      setLanguageConfiguration: jest.fn(),
    },
    editor: {
      defineTheme: jest.fn(),
    },
  };
}

test('registers the diagramcode language without throwing', () => {
  const monaco = createFakeMonaco();
  expect(() => registerDiagramCodeLanguage(monaco)).not.toThrow();
  expect(monaco.languages.getLanguages()).toEqual([{ id: LANGUAGE_ID }]);
  expect(monaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith(LANGUAGE_ID, expect.any(Object));
  expect(monaco.languages.setLanguageConfiguration).toHaveBeenCalledWith(LANGUAGE_ID, expect.any(Object));
  expect(monaco.editor.defineTheme).toHaveBeenCalledWith('diagramcode-dark', expect.any(Object));
  expect(monaco.editor.defineTheme).toHaveBeenCalledWith('diagramcode-light', expect.any(Object));
});

test('is idempotent when called a second time', () => {
  const monaco = createFakeMonaco();
  registerDiagramCodeLanguage(monaco);
  registerDiagramCodeLanguage(monaco);
  expect(monaco.languages.getLanguages()).toEqual([{ id: LANGUAGE_ID }]);
});

test('monarch tokenizer classifies keywords, node kinds, strings and comments', () => {
  const monaco = createFakeMonaco();
  registerDiagramCodeLanguage(monaco);
  const [, tokenizerConfig] = monaco.languages.setMonarchTokensProvider.mock.calls[0];
  expect(tokenizerConfig.keywords).toContain('diagram');
  expect(tokenizerConfig.typeKeywords).toContain('entity');
  expect(tokenizerConfig.typeKeywords).toContain('place');
});
