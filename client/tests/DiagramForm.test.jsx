import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagramForm } from '../src/components/DiagramForm.jsx';

test('renders empty inputs when no initial values are given', () => {
  render(<DiagramForm onSubmit={() => {}} onCancel={() => {}} />);
  expect(screen.getByLabelText('Название')).toHaveValue('');
  expect(screen.getByLabelText('Нотация')).toHaveValue('');
});

test('pre-fills inputs from initialValues for editing', () => {
  render(
    <DiagramForm
      initialValues={{ title: 'Order flow', notation: 'bpmn', dslContent: 'start -> end' }}
      onSubmit={() => {}}
      onCancel={() => {}}
    />,
  );
  expect(screen.getByLabelText('Название')).toHaveValue('Order flow');
  expect(screen.getByLabelText('Нотация')).toHaveValue('bpmn');
  expect(screen.getByLabelText('Содержимое DSL')).toHaveValue('start -> end');
});

test('calls onSubmit with the current field values', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockResolvedValue();
  render(<DiagramForm onSubmit={onSubmit} onCancel={() => {}} />);

  await user.type(screen.getByLabelText('Название'), 'New diagram');
  await user.type(screen.getByLabelText('Нотация'), 'uml');
  await user.click(screen.getByText('Сохранить'));

  expect(onSubmit).toHaveBeenCalledWith({
    title: 'New diagram',
    notation: 'uml',
    dslContent: '',
  });
});

test('shows an error message when onSubmit rejects', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockRejectedValue(new Error('Ошибка сохранения'));
  render(<DiagramForm onSubmit={onSubmit} onCancel={() => {}} />);

  await user.type(screen.getByLabelText('Название'), 'New diagram');
  await user.type(screen.getByLabelText('Нотация'), 'uml');
  await user.click(screen.getByText('Сохранить'));

  expect(await screen.findByText('Ошибка сохранения')).toBeInTheDocument();
});

test('calls onCancel when the cancel button is clicked', async () => {
  const user = userEvent.setup();
  const onCancel = jest.fn();
  render(<DiagramForm onSubmit={() => {}} onCancel={onCancel} />);

  await user.click(screen.getByText('Отмена'));
  expect(onCancel).toHaveBeenCalled();
});
