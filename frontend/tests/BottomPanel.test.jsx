import { render, screen, fireEvent } from '@testing-library/react';
import { BottomPanel } from '../src/components/ide/BottomPanel.jsx';
import { STRINGS } from '../src/i18n/strings.js';

const t = (key) => STRINGS.ru[key] ?? key;

test('shows the terminal tab by default and switches to problems', () => {
  const onSelectTab = jest.fn();
  render(
    <BottomPanel
      activeTab="terminal"
      onSelectTab={onSelectTab}
      terminalLines={[{ id: 1, text: '> run', kind: 'ok' }]}
      issues={[]}
      t={t}
    />,
  );

  expect(screen.getByText('> run')).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Problems/));
  expect(onSelectTab).toHaveBeenCalledWith('problems');
});

test('shows no-issues message when there are no problems', () => {
  render(<BottomPanel activeTab="problems" onSelectTab={() => {}} terminalLines={[]} issues={[]} t={t} />);
  expect(screen.getByText('Нет ошибок и предупреждений')).toBeInTheDocument();
});

test('lists validation issues with severity and node/edge references', () => {
  const issues = [
    { severity: 'error', message: 'Недопустимый тип узла', node_id: 'n1' },
    { severity: 'warning', message: 'Нет первичного ключа', node_id: 'n2' },
  ];
  render(<BottomPanel activeTab="problems" onSelectTab={() => {}} terminalLines={[]} issues={issues} t={t} />);

  expect(screen.getByText('Недопустимый тип узла')).toBeInTheDocument();
  expect(screen.getByText('Нет первичного ключа')).toBeInTheDocument();
  expect(screen.getByText('[n1]')).toBeInTheDocument();
});
