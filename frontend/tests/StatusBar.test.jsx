import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBar } from '../src/components/ide/StatusBar.jsx';
import { STRINGS } from '../src/i18n/strings.js';

const t = (key) => STRINGS.ru[key] ?? key;

test('shows Synced when there are no unsaved changes', () => {
  render(
    <StatusBar
      syncStatus="synced"
      notationLabel="ERD"
      cursorPosition={{ line: 3, column: 7 }}
      locale="ru"
      onToggleLocale={() => {}}
      t={t}
    />,
  );
  expect(screen.getByText('Synced')).toBeInTheDocument();
  expect(screen.getByText(/Ln 3, Col 7/)).toBeInTheDocument();
});

test('shows the unsaved and error states', () => {
  const { rerender } = render(
    <StatusBar syncStatus="unsaved" notationLabel="ERD" cursorPosition={{ line: 1, column: 1 }} locale="ru" onToggleLocale={() => {}} t={t} />,
  );
  expect(screen.getByText('Не сохранено')).toBeInTheDocument();

  rerender(
    <StatusBar syncStatus="error" notationLabel="ERD" cursorPosition={{ line: 1, column: 1 }} locale="ru" onToggleLocale={() => {}} t={t} />,
  );
  expect(screen.getByText('Ошибка сохранения')).toBeInTheDocument();
});

test('toggles the locale when clicking the language button', () => {
  const onToggleLocale = jest.fn();
  render(
    <StatusBar
      syncStatus="synced"
      notationLabel="ERD"
      cursorPosition={{ line: 1, column: 1 }}
      locale="ru"
      onToggleLocale={onToggleLocale}
      t={t}
    />,
  );
  fireEvent.click(screen.getByLabelText('toggle-locale'));
  expect(onToggleLocale).toHaveBeenCalledTimes(1);
});
