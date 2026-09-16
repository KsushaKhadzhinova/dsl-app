import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepoStatsCard from '../src/components/RepoStatsCard.jsx';

test('renders all four stats passed as props, with pluralized nouns for stars/forks', () => {
  render(<RepoStatsCard stars={5} forks={2} openIssues={1} updatedAt="15.01.2026" />);
  expect(screen.getByText('5 звёзд')).toBeInTheDocument();
  expect(screen.getByText('2 форка')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('15.01.2026')).toBeInTheDocument();
});
