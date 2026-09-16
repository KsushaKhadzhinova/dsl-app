const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.resolve(__dirname, '../css/style.css'), 'utf8');

describe('Lab 4: responsive layout', () => {
  test('defines CSS custom properties in :root', () => {
    expect(css).toMatch(/:root\s*{[^}]*--color-primary/);
    expect(css).toMatch(/--spacing-unit/);
    expect(css).toMatch(/--container-width/);
  });

  test('is mobile-first: base rules precede any media query', () => {
    const firstMediaQueryIndex = css.indexOf('@media');
    const firstGridColumnsIndex = css.indexOf('grid-template-columns: 1fr;');
    expect(firstMediaQueryIndex).toBeGreaterThan(0);
    expect(firstGridColumnsIndex).toBeGreaterThan(0);
    expect(firstGridColumnsIndex).toBeLessThan(firstMediaQueryIndex);
  });

  test('defines a tablet and a desktop breakpoint', () => {
    expect(css).toMatch(/@media \(min-width: 600px\)/);
    expect(css).toMatch(/@media \(min-width: 1024px\)/);
  });

  test('uses Flexbox for one-dimensional layouts', () => {
    expect(css).toMatch(/display:\s*flex/);
    expect(css).toMatch(/flex-direction:\s*column/);
    expect(css).toMatch(/flex-direction:\s*row/);
  });

  test('uses CSS Grid for the features layout', () => {
    expect(css).toMatch(/\.features__grid\s*{[^}]*display:\s*grid/);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(2, 1fr\)/);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(4, 1fr\)/);
  });

  test('images scale down instead of overflowing their container', () => {
    expect(css).toMatch(/img\s*{[^}]*max-width:\s*100%/);
  });
});
