import { useEffect, useRef } from 'react';

function createFakeMonaco() {
  const registeredLanguages = [];
  return {
    languages: {
      getLanguages: () => registeredLanguages,
      register: (language) => registeredLanguages.push(language),
      setMonarchTokensProvider: () => {},
      setLanguageConfiguration: () => {},
    },
    editor: {
      defineTheme: () => {},
      setModelLanguage: () => {},
    },
  };
}

export default function Editor({ value, onChange, onMount, theme, language }) {
  const monacoRef = useRef(createFakeMonaco());

  useEffect(() => {
    if (!onMount) {
      return;
    }
    const fakeEditor = {
      getModel: () => ({}),
      onDidChangeCursorPosition: (handler) => {
        window.__mockMonacoCursorHandler = handler;
      },
    };
    onMount(fakeEditor, monacoRef.current);
  }, [onMount]);

  return (
    <textarea
      data-testid="mock-monaco-editor"
      data-theme={theme}
      data-language={language}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
