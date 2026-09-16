import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App.jsx';

test('renders the full page composed from mock data without crashing', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Возможности' })).toBeInTheDocument();
});

test('wires the stub onLearnMore handler through to FeatureList', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Подробнее' })[0]);

  expect(logSpy).toHaveBeenCalledWith('Подробнее о возможности:', expect.any(String));
  logSpy.mockRestore();
});
