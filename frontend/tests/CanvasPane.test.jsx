import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasPane } from '../src/components/ide/CanvasPane.jsx';

test('shows the empty label when there is no rendered svg yet', () => {
  render(
    <CanvasPane svg={null} zoomPercent={100} onZoomIn={() => {}} onZoomOut={() => {}} onFit={() => {}} emptyLabel="Run" />,
  );
  expect(screen.getByText('Run')).toBeInTheDocument();
  expect(screen.getByText('100%')).toBeInTheDocument();
});

test('renders the provided svg markup', () => {
  render(
    <CanvasPane
      svg="<svg data-testid='rendered-svg'></svg>"
      zoomPercent={100}
      onZoomIn={() => {}}
      onZoomOut={() => {}}
      onFit={() => {}}
      emptyLabel="Run"
    />,
  );
  expect(screen.getByTestId('rendered-svg')).toBeInTheDocument();
});

test('wires the zoom toolbar buttons', () => {
  const onZoomIn = jest.fn();
  const onZoomOut = jest.fn();
  const onFit = jest.fn();
  render(
    <CanvasPane svg={null} zoomPercent={90} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFit={onFit} emptyLabel="Run" />,
  );

  fireEvent.click(screen.getByLabelText('zoom-in'));
  fireEvent.click(screen.getByLabelText('zoom-out'));
  fireEvent.click(screen.getByLabelText('zoom-fit'));

  expect(onZoomIn).toHaveBeenCalledTimes(1);
  expect(onZoomOut).toHaveBeenCalledTimes(1);
  expect(onFit).toHaveBeenCalledTimes(1);
});
