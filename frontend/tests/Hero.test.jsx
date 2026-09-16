import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from '../src/components/Hero.jsx';

test('renders the given title as the page h1 and the subtitle text', () => {
  render(<Hero title="Заголовок" subtitle="Подзаголовок" />);
  expect(screen.getByRole('heading', { level: 1, name: 'Заголовок' })).toBeInTheDocument();
  expect(screen.getByText('Подзаголовок')).toBeInTheDocument();
});
