import { render } from '@testing-library/react';
import Card from '../src/components/ui/Card.jsx';

test('renders children inside a div with the card class', () => {
  const { container } = render(<Card>content</Card>);
  expect(container.querySelector('.card').textContent).toBe('content');
});

test('appends an extra className when given one', () => {
  const { container } = render(<Card className="extra">content</Card>);
  expect(container.querySelector('.card.extra')).not.toBeNull();
});
