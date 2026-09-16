require('../js/repoStats.js');

const FIXTURE = `
  <section id="repo-stats">
    <p id="repo-stats-status">Загружаем данные с GitHub…</p>
    <dl id="repo-stats-grid" hidden>
      <dd id="repo-stats-stars">—</dd>
      <dd id="repo-stats-forks">—</dd>
      <dd id="repo-stats-issues">—</dd>
      <dd id="repo-stats-updated">—</dd>
    </dl>
  </section>
`;

const NO_CONTAINER = `<p>ничего похожего на репозиторий тут нет</p>`;

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function render(fixture) {
  document.body.innerHTML = fixture;
  document.dispatchEvent(new Event('DOMContentLoaded'));
  await flush();
  await flush();
}

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

describe('repo stats widget', () => {
  test('does nothing when the section is absent from the page', async () => {
    await render(NO_CONTAINER);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('renders fresh data from the GitHub API and caches it', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stargazers_count: 5,
        forks_count: 2,
        open_issues_count: 1,
        pushed_at: '2026-01-15T10:00:00Z',
      }),
    });

    await render(FIXTURE);

    expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/repos/KsushaKhadzhinova/dsl-app');
    expect(document.getElementById('repo-stats-stars').textContent).toBe('5');
    expect(document.getElementById('repo-stats-forks').textContent).toBe('2');
    expect(document.getElementById('repo-stats-issues').textContent).toBe('1');
    expect(document.getElementById('repo-stats-grid').hidden).toBe(false);
    expect(document.getElementById('repo-stats-status').hidden).toBe(true);

    const cached = JSON.parse(localStorage.getItem('dc-repo-stats'));
    expect(cached.data.stars).toBe(5);
  });

  test('uses cached data instead of calling fetch when the cache is still fresh', async () => {
    localStorage.setItem('dc-repo-stats', JSON.stringify({
      data: { stars: 9, forks: 3, openIssues: 0, updatedAt: '2026-01-01T00:00:00Z' },
      cachedAt: Date.now(),
    }));

    await render(FIXTURE);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(document.getElementById('repo-stats-stars').textContent).toBe('9');
  });

  test('refetches when the cache has expired', async () => {
    localStorage.setItem('dc-repo-stats', JSON.stringify({
      data: { stars: 1, forks: 1, openIssues: 1, updatedAt: '2026-01-01T00:00:00Z' },
      cachedAt: Date.now() - 11 * 60 * 1000,
    }));
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stargazers_count: 42,
        forks_count: 7,
        open_issues_count: 3,
        pushed_at: '2026-02-01T00:00:00Z',
      }),
    });

    await render(FIXTURE);

    expect(global.fetch).toHaveBeenCalled();
    expect(document.getElementById('repo-stats-stars').textContent).toBe('42');
  });

  test('shows an error message when the API responds with a non-ok status and there is no cache', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });

    await render(FIXTURE);

    const status = document.getElementById('repo-stats-status');
    expect(status.hidden).toBe(false);
    expect(status.textContent).toContain('404');
    expect(document.getElementById('repo-stats-grid').hidden).toBe(true);
  });

  test('shows an error message when the network request itself fails and there is no cache', async () => {
    global.fetch.mockRejectedValue(new Error('Network down'));

    await render(FIXTURE);

    const status = document.getElementById('repo-stats-status');
    expect(status.hidden).toBe(false);
    expect(status.textContent).toContain('Network down');
  });

  test('falls back to stale cached data when the request fails', async () => {
    localStorage.setItem('dc-repo-stats', JSON.stringify({
      data: { stars: 77, forks: 4, openIssues: 2, updatedAt: '2026-01-01T00:00:00Z' },
      cachedAt: Date.now() - 60 * 60 * 1000,
    }));
    global.fetch.mockRejectedValue(new Error('Network down'));

    await render(FIXTURE);

    expect(document.getElementById('repo-stats-stars').textContent).toBe('77');
    expect(document.getElementById('repo-stats-grid').hidden).toBe(false);
  });

  test('treats corrupted cache data as no cache', async () => {
    localStorage.setItem('dc-repo-stats', '{not valid json');
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stargazers_count: 3,
        forks_count: 0,
        open_issues_count: 0,
        pushed_at: '2026-01-01T00:00:00Z',
      }),
    });

    await render(FIXTURE);

    expect(global.fetch).toHaveBeenCalled();
    expect(document.getElementById('repo-stats-stars').textContent).toBe('3');
  });
});
