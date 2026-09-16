import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/components/Footer.jsx';

test('renders the copyright year and the repo link', () => {
  render(<Footer year={2026} repoUrl="https://github.com/KsushaKhadzhinova/dsl-app" />);
  expect(screen.getByText(/2026/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/KsushaKhadzhinova/dsl-app',
  );
});
