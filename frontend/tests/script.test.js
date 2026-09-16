require('../js/script.js');

const FULL_FIXTURE = `
  <button id="theme-toggle" aria-pressed="false">Светлая тема</button>
  <input id="notations-filter" />
  <ul id="notations-list">
    <li class="notations__item">UML</li>
    <li class="notations__item">BPMN</li>
  </ul>
  <p id="notations-empty" hidden></p>
  <div class="faq__question" role="button" tabindex="0" aria-expanded="false">Q1</div>
  <p class="faq__answer" hidden>A1</p>
  <div class="faq__question" role="button" tabindex="0" aria-expanded="false">Q2</div>
  <p class="faq__answer" hidden>A2</p>
`;

const MISSING_THEME_TOGGLE = `
  <input id="notations-filter" />
  <ul id="notations-list"><li class="notations__item">UML</li></ul>
  <p id="notations-empty" hidden></p>
`;

const MISSING_FILTER_INPUT = `
  <button id="theme-toggle" aria-pressed="false">Светлая тема</button>
  <ul id="notations-list"><li class="notations__item">UML</li></ul>
  <p id="notations-empty" hidden></p>
`;

const MISSING_LIST = `
  <button id="theme-toggle" aria-pressed="false">Светлая тема</button>
  <input id="notations-filter" />
  <p id="notations-empty" hidden></p>
`;

const MISSING_EMPTY_MESSAGE = `
  <button id="theme-toggle" aria-pressed="false">Светлая тема</button>
  <input id="notations-filter" />
  <ul id="notations-list"><li class="notations__item">UML</li></ul>
`;

function render(fixture) {
  document.body.innerHTML = fixture;
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('theme toggle', () => {
  test('defaults to dark theme when nothing is stored', () => {
    render(FULL_FIXTURE);
    const toggle = document.getElementById('theme-toggle');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(toggle.textContent).toBe('Светлая тема');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
  });

  test('restores a previously stored light theme', () => {
    localStorage.setItem('dc-theme', 'light');
    render(FULL_FIXTURE);
    const toggle = document.getElementById('theme-toggle');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(toggle.textContent).toBe('Тёмная тема');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  test('clicking switches from dark to light and persists it', () => {
    render(FULL_FIXTURE);
    const toggle = document.getElementById('theme-toggle');
    toggle.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(toggle.textContent).toBe('Тёмная тема');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('dc-theme')).toBe('light');
  });

  test('clicking switches from light back to dark and persists it', () => {
    localStorage.setItem('dc-theme', 'light');
    render(FULL_FIXTURE);
    const toggle = document.getElementById('theme-toggle');
    toggle.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(toggle.textContent).toBe('Светлая тема');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.getItem('dc-theme')).toBe('dark');
  });

  test('does nothing when the toggle button is absent from the page', () => {
    expect(() => render(MISSING_THEME_TOGGLE)).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });
});

describe('notations filter', () => {
  test('hides items that do not match the query', () => {
    render(FULL_FIXTURE);
    const input = document.getElementById('notations-filter');
    const [uml, bpmn] = document.querySelectorAll('.notations__item');
    const emptyMessage = document.getElementById('notations-empty');

    input.value = 'BP';
    input.dispatchEvent(new Event('input'));

    expect(uml.hidden).toBe(true);
    expect(bpmn.hidden).toBe(false);
    expect(emptyMessage.hidden).toBe(true);
  });

  test('shows the empty message when nothing matches', () => {
    render(FULL_FIXTURE);
    const input = document.getElementById('notations-filter');
    const emptyMessage = document.getElementById('notations-empty');

    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));

    expect(emptyMessage.hidden).toBe(false);
  });

  test('an empty query shows every item again', () => {
    render(FULL_FIXTURE);
    const input = document.getElementById('notations-filter');
    const [uml, bpmn] = document.querySelectorAll('.notations__item');
    const emptyMessage = document.getElementById('notations-empty');

    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(uml.hidden).toBe(false);
    expect(bpmn.hidden).toBe(false);
    expect(emptyMessage.hidden).toBe(true);
  });

  test('does nothing when the filter input is missing', () => {
    expect(() => render(MISSING_FILTER_INPUT)).not.toThrow();
  });

  test('does nothing when the notations list is missing', () => {
    expect(() => render(MISSING_LIST)).not.toThrow();
  });

  test('does nothing when the empty-message element is missing', () => {
    expect(() => render(MISSING_EMPTY_MESSAGE)).not.toThrow();
  });
});

describe('FAQ accordion', () => {
  test('clicking a question expands it, clicking again collapses it', () => {
    render(FULL_FIXTURE);
    const [question] = document.querySelectorAll('.faq__question');
    const answer = question.nextElementSibling;

    question.click();
    expect(question.getAttribute('aria-expanded')).toBe('true');
    expect(answer.hidden).toBe(false);

    question.click();
    expect(question.getAttribute('aria-expanded')).toBe('false');
    expect(answer.hidden).toBe(true);
  });

  test('Enter key expands and collapses a question', () => {
    render(FULL_FIXTURE);
    const [, second] = document.querySelectorAll('.faq__question');
    const answer = second.nextElementSibling;

    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(answer.hidden).toBe(false);

    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(second.getAttribute('aria-expanded')).toBe('false');
    expect(answer.hidden).toBe(true);
  });

  test('Space key toggles a question', () => {
    render(FULL_FIXTURE);
    const [question] = document.querySelectorAll('.faq__question');

    question.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    expect(question.getAttribute('aria-expanded')).toBe('true');
  });

  test('other keys do not toggle a question', () => {
    render(FULL_FIXTURE);
    const [question] = document.querySelectorAll('.faq__question');

    question.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', cancelable: true }));
    expect(question.getAttribute('aria-expanded')).toBe('false');
  });
});
