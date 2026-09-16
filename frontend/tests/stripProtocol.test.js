import { stripProtocol } from '../src/utils/stripProtocol.js';

test('strips an https:// prefix', () => {
  expect(stripProtocol('https://github.com/KsushaKhadzhinova')).toBe('github.com/KsushaKhadzhinova');
});

test('strips an http:// prefix', () => {
  expect(stripProtocol('http://example.com')).toBe('example.com');
});

test('leaves a string without a protocol unchanged', () => {
  expect(stripProtocol('github.com/KsushaKhadzhinova')).toBe('github.com/KsushaKhadzhinova');
});
