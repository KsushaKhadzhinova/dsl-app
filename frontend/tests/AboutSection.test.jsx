import { render, screen } from '@testing-library/react';
import AboutSection from '../src/components/features/AboutSection.jsx';

const organization = { name: 'DiagramCode', description: 'Описание проекта', url: 'https://example.com' };
const author = {
  name: 'Ксения Хаджинова',
  jobTitle: 'Студентка',
  affiliation: 'БГУИР',
  sameAs: 'https://github.com/KsushaKhadzhinova',
};

test('renders organization name and description', () => {
  render(<AboutSection organization={organization} author={author} />);
  expect(screen.getByRole('heading', { name: organization.name })).toBeInTheDocument();
  expect(screen.getByText(organization.description)).toBeInTheDocument();
});

test('renders the nested author card', () => {
  render(<AboutSection organization={organization} author={author} />);
  expect(screen.getByText(author.name)).toBeInTheDocument();
  expect(screen.getByText(author.jobTitle)).toBeInTheDocument();
  expect(screen.getByText(author.affiliation)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /github.com/ })).toHaveAttribute('href', author.sameAs);
});
