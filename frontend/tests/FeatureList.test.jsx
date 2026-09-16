import { render, screen, fireEvent } from '@testing-library/react';
import FeatureList from '../src/components/features/FeatureList.jsx';

const features = [
  { id: 'a', title: 'Фича А', text: 'Текст А' },
  { id: 'b', title: 'Фича Б', text: 'Текст Б' },
];

test('renders one article per feature with its title and text', () => {
  render(<FeatureList features={features} onLearnMore={() => {}} />);
  features.forEach((feature) => {
    expect(screen.getByText(feature.title)).toBeInTheDocument();
    expect(screen.getByText(feature.text)).toBeInTheDocument();
  });
  expect(screen.getAllByRole('article')).toHaveLength(features.length);
});

test('calls onLearnMore with the feature title when its button is clicked', () => {
  const handleLearnMore = jest.fn();
  render(<FeatureList features={features} onLearnMore={handleLearnMore} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Подробнее' })[1]);

  expect(handleLearnMore).toHaveBeenCalledTimes(1);
  expect(handleLearnMore).toHaveBeenCalledWith('Фича Б');
});
