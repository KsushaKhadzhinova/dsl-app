import { render, screen, fireEvent } from '@testing-library/react';
import { EditorPane } from '../src/components/ide/EditorPane.jsx';

let capturedOnMount;

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (props) => {
    capturedOnMount = props.onMount;
    return (
      <textarea
        data-testid="editor"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    );
  },
}));

function createFakeMonacoAndEditor() {
  const registeredLanguages = [];
  let cursorHandler;
  const monaco = {
    languages: {
      getLanguages: () => registeredLanguages,
      register: (language) => registeredLanguages.push(language),
      setMonarchTokensProvider: jest.fn(),
      setLanguageConfiguration: jest.fn(),
    },
    editor: {
      defineTheme: jest.fn(),
      setModelLanguage: jest.fn(),
    },
  };
  const editor = {
    getModel: () => ({ id: 'fake-model' }),
    onDidChangeCursorPosition: (handler) => {
      cursorHandler = handler;
    },
  };
  return { monaco, editor, triggerCursorChange: (position) => cursorHandler({ position }) };
}

test('registers the DSL language and applies it to the model on mount', () => {
  render(<EditorPane value="" onChange={() => {}} theme="dark" onCursorChange={() => {}} />);
  const { monaco, editor } = createFakeMonacoAndEditor();

  expect(() => capturedOnMount(editor, monaco)).not.toThrow();
  expect(monaco.editor.setModelLanguage).toHaveBeenCalledWith({ id: 'fake-model' }, 'diagramcode');
});

test('reports cursor position changes to the parent', () => {
  const onCursorChange = jest.fn();
  render(<EditorPane value="" onChange={() => {}} theme="dark" onCursorChange={onCursorChange} />);
  const { monaco, editor, triggerCursorChange } = createFakeMonacoAndEditor();
  capturedOnMount(editor, monaco);

  triggerCursorChange({ lineNumber: 4, column: 9 });

  expect(onCursorChange).toHaveBeenCalledWith({ line: 4, column: 9 });
});

test('forwards editor content changes to the parent', () => {
  const onChange = jest.fn();
  render(<EditorPane value="diagram" onChange={onChange} theme="light" onCursorChange={() => {}} />);
  fireEvent.change(screen.getByTestId('editor'), { target: { value: 'diagram erd' } });
  expect(onChange).toHaveBeenCalledWith('diagram erd');
});
