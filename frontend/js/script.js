const THEME_STORAGE_KEY = 'dc-theme';

function applyTheme(theme, toggle) {
  document.documentElement.setAttribute('data-theme', theme);
  const isLight = theme === 'light';
  toggle.textContent = isLight ? 'Тёмная тема' : 'Светлая тема';
  toggle.setAttribute('aria-pressed', String(isLight));
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  applyTheme(storedTheme, toggle);

  toggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme, toggle);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

function initNotationsFilter() {
  const input = document.getElementById('notations-filter');
  const list = document.getElementById('notations-list');
  const emptyMessage = document.getElementById('notations-empty');
  if (!input || !list || !emptyMessage) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    const items = Array.from(list.querySelectorAll('.notations__item'));
    let visibleCount = 0;

    items.forEach((item) => {
      const matches = item.textContent.toLowerCase().includes(query);
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    emptyMessage.hidden = visibleCount !== 0;
  });
}

function toggleFaqItem(question) {
  const answer = question.nextElementSibling;
  const isExpanded = question.getAttribute('aria-expanded') === 'true';
  question.setAttribute('aria-expanded', String(!isExpanded));
  answer.hidden = isExpanded;
}

function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq__question');

  questions.forEach((question) => {
    question.addEventListener('click', () => toggleFaqItem(question));
    question.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFaqItem(question);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNotationsFilter();
  initFaqAccordion();
});
