import { pluralizeRu } from '../src/utils/pluralizeRu.js';

const FORMS = ['звезда', 'звезды', 'звёзд'];

test('uses the "one" form for numbers ending in 1 (except 11)', () => {
  expect(pluralizeRu(1, FORMS)).toBe('звезда');
  expect(pluralizeRu(21, FORMS)).toBe('звезда');
});

test('uses the "few" form for numbers ending in 2-4 (except 12-14)', () => {
  expect(pluralizeRu(2, FORMS)).toBe('звезды');
  expect(pluralizeRu(3, FORMS)).toBe('звезды');
  expect(pluralizeRu(24, FORMS)).toBe('звезды');
});

test('uses the "many" form for numbers ending in 0, 5-9', () => {
  expect(pluralizeRu(0, FORMS)).toBe('звёзд');
  expect(pluralizeRu(5, FORMS)).toBe('звёзд');
  expect(pluralizeRu(9, FORMS)).toBe('звёзд');
});

test('treats 11-14 as an exception and uses the "many" form', () => {
  expect(pluralizeRu(11, FORMS)).toBe('звёзд');
  expect(pluralizeRu(12, FORMS)).toBe('звёзд');
  expect(pluralizeRu(14, FORMS)).toBe('звёзд');
});
