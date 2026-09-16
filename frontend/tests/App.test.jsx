import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App.jsx';

test('renders the full page composed from mock data without crashing', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Возможности' })).toBeInTheDocument();
});
