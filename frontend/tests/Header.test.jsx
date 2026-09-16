import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../src/components/Header.jsx';

const navItems = [
  { label: 'Возможности', href: '#features' },
  { label: 'Нотации', href: '#notations' },
];

test('renders every nav item as a link with its href', () => {
  render(<Header navItems={navItems} />);
  navItems.forEach((item) => {
    expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
  });
});

test('renders the DiagramCode logo text', () => {
  render(<Header navItems={navItems} />);
  expect(screen.getByText('DiagramCode')).toBeInTheDocument();
});
