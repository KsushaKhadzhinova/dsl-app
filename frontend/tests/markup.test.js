const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

describe('Lab 3: semantic markup', () => {
  test('uses at least 8 distinct semantic HTML5 tags', () => {
    const tags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    tags.forEach((tag) => {
      expect(document.querySelectorAll(tag).length).toBeGreaterThan(0);
    });
    expect(document.querySelectorAll('section').length).toBeGreaterThanOrEqual(4);
    expect(document.querySelectorAll('article').length).toBeGreaterThanOrEqual(2);
  });

  test('has exactly one h1 and no skipped heading levels', () => {
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const levels = headings.map((h) => Number(h.tagName[1]));
    let previous = levels[0];
    levels.slice(1).forEach((level) => {
      expect(level - previous).toBeLessThanOrEqual(1);
      previous = level;
    });
  });

  test('every image has an alt attribute', () => {
    const images = Array.from(document.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => {
      expect(img.hasAttribute('alt')).toBe(true);
    });
  });

  test('has a skip link pointing to an element that exists', () => {
    const skipLink = document.querySelector('.skip-link');
    expect(skipLink).not.toBeNull();
    const targetId = skipLink.getAttribute('href').replace('#', '');
    expect(document.getElementById(targetId)).not.toBeNull();
  });

  test('declares Organization microdata for the project', () => {
    const organization = document.querySelector('[itemtype="https://schema.org/Organization"]');
    expect(organization).not.toBeNull();
    expect(organization.querySelector('[itemprop="name"]')).not.toBeNull();
    expect(organization.querySelector('[itemprop="description"]')).not.toBeNull();
  });

  test('declares Person microdata for the author, nested as founder', () => {
    const person = document.querySelector('[itemtype="https://schema.org/Person"]');
    expect(person).not.toBeNull();
    expect(person.getAttribute('itemprop')).toBe('founder');
    expect(person.querySelector('[itemprop="name"]').textContent).toContain('Ксения');
    expect(person.querySelector('[itemprop="jobTitle"]')).not.toBeNull();
  });

  test('uses BEM-style class naming for custom components', () => {
    const featureCard = document.querySelector('.feature-card');
    expect(featureCard.querySelector('.feature-card__title')).not.toBeNull();
    expect(featureCard.querySelector('.feature-card__text')).not.toBeNull();
  });
});
