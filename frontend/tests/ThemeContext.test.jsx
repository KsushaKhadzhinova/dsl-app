import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext.jsx';

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

test('defaults to dark theme and applies it to the document element', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});

test('toggling switches to light and persists the choice', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );

  act(() => {
    screen.getByText('toggle').click();
  });

  expect(screen.getByTestId('theme')).toHaveTextContent('light');
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  expect(window.localStorage.getItem('diagramcode.theme')).toBe('light');
});

test('restores a previously stored theme on mount', () => {
  window.localStorage.setItem('diagramcode.theme', 'light');
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  expect(screen.getByTestId('theme')).toHaveTextContent('light');
});
