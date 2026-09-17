import { isValidEmail } from '../src/auth/validation.js';

test('accepts well-formed emails', () => {
  expect(isValidEmail('user@example.com')).toBe(true);
  expect(isValidEmail('a.b+c@sub.example.co')).toBe(true);
});

test('rejects malformed emails', () => {
  expect(isValidEmail('')).toBe(false);
  expect(isValidEmail('user@')).toBe(false);
  expect(isValidEmail('user@example')).toBe(false);
  expect(isValidEmail('user example.com')).toBe(false);
  expect(isValidEmail('@example.com')).toBe(false);
});
