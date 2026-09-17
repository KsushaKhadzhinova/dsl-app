import { render, screen, act } from '@testing-library/react';
import { LocaleProvider, useLocale } from '../src/i18n/LocaleContext.jsx';

function Probe() {
  const { locale, toggleLocale, t } = useLocale();
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="label">{t('run')}</div>
      <div data-testid="unknown">{t('does-not-exist')}</div>
      <button onClick={toggleLocale}>toggle</button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

test('defaults to ru and translates known keys', () => {
  render(
    <LocaleProvider>
      <Probe />
    </LocaleProvider>,
  );
  expect(screen.getByTestId('locale')).toHaveTextContent('ru');
  expect(screen.getByTestId('label')).toHaveTextContent('Run');
});

test('falls back to the key itself for unknown strings', () => {
  render(
    <LocaleProvider>
      <Probe />
    </LocaleProvider>,
  );
  expect(screen.getByTestId('unknown')).toHaveTextContent('does-not-exist');
});

test('toggling switches locale and persists it', () => {
  render(
    <LocaleProvider>
      <Probe />
    </LocaleProvider>,
  );

  act(() => {
    screen.getByText('toggle').click();
  });

  expect(screen.getByTestId('locale')).toHaveTextContent('en');
  expect(window.localStorage.getItem('diagramcode.locale')).toBe('en');
});
