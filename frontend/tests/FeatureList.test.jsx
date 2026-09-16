import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureList from '../src/components/FeatureList.jsx';

const features = [
  { id: 'a', title: 'Фича А', text: 'Текст А' },
  { id: 'b', title: 'Фича Б', text: 'Текст Б' },
];

test('renders one article per feature with its title and text', () => {
  render(<FeatureList features={features} />);
  features.forEach((feature) => {
    expect(screen.getByText(feature.title)).toBeInTheDocument();
    expect(screen.getByText(feature.text)).toBeInTheDocument();
  });
  expect(screen.getAllByRole('article')).toHaveLength(features.length);
});
