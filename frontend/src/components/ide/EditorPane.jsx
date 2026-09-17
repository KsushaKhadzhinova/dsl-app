import Editor from '@monaco-editor/react';
import { registerDiagramCodeLanguage, LANGUAGE_ID } from '../../dsl/language.js';

export function EditorPane({ value, onChange, theme, onCursorChange }) {
  function handleMount(editor, monaco) {
    registerDiagramCodeLanguage(monaco);
    monaco.editor.setModelLanguage(editor.getModel(), LANGUAGE_ID);
    editor.onDidChangeCursorPosition((event) => {
      onCursorChange({ line: event.position.lineNumber, column: event.position.column });
    });
  }

  return (
    <div className="editor-pane">
      <Editor
        height="100%"
        language={LANGUAGE_ID}
        value={value}
        theme={theme === 'dark' ? 'diagramcode-dark' : 'diagramcode-light'}
        onChange={(newValue) => onChange(newValue ?? '')}
        onMount={handleMount}
        options={{
          fontFamily: "'Source Code Pro', monospace",
          fontSize: 13,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}
