const REPO_API_URL = 'https://api.github.com/repos/KsushaKhadzhinova/dsl-app';
const CACHE_KEY = 'dc-repo-stats';
const CACHE_TTL_MS = 10 * 60 * 1000;

function readCachedEntry() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function readFreshCache() {
  const entry = readCachedEntry();
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
  return entry.data;
}

function readStaleCache() {
  const entry = readCachedEntry();
  return entry ? entry.data : null;
}

function writeCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
}

function renderRepoStats(stats) {
  document.getElementById('repo-stats-stars').textContent = stats.stars;
  document.getElementById('repo-stats-forks').textContent = stats.forks;
  document.getElementById('repo-stats-issues').textContent = stats.openIssues;
  document.getElementById('repo-stats-updated').textContent = new Date(stats.updatedAt).toLocaleDateString('ru-RU');
  document.getElementById('repo-stats-grid').hidden = false;
  document.getElementById('repo-stats-status').hidden = true;
}

function renderRepoError(message) {
  const status = document.getElementById('repo-stats-status');
  status.textContent = `Не удалось загрузить данные с GitHub: ${message}`;
  status.hidden = false;
}

async function loadRepoStats() {
  const container = document.getElementById('repo-stats');
  if (!container) return;

  const cached = readFreshCache();
  if (cached) {
    renderRepoStats(cached);
    return;
  }

  try {
    const response = await fetch(REPO_API_URL);
    if (!response.ok) {
      throw new Error(`GitHub API вернул статус ${response.status}`);
    }
    const data = await response.json();
    const stats = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      updatedAt: data.pushed_at,
    };
    writeCache(stats);
    renderRepoStats(stats);
  } catch (error) {
    const stale = readStaleCache();
    if (stale) {
      renderRepoStats(stale);
    } else {
      renderRepoError(error.message);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadRepoStats);
