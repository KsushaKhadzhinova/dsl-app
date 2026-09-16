import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotationsList from '../src/components/NotationsList.jsx';

test('renders one list item per notation', () => {
  const notations = ['UML', 'BPMN', 'ERD'];
  render(<NotationsList notations={notations} />);
  notations.forEach((notation) => {
    expect(screen.getByText(notation)).toBeInTheDocument();
  });
  expect(screen.getAllByRole('listitem')).toHaveLength(notations.length);
});
