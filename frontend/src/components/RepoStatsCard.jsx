function RepoStatsCard({ stars, forks, openIssues, updatedAt }) {
  return (
    <section className="repo-stats" aria-labelledby="repo-stats-title">
      <h2 id="repo-stats-title" className="repo-stats__title">
        Проект вживую
      </h2>
      <dl className="repo-stats__grid">
        <div className="repo-stats__item">
          <dt className="repo-stats__label">Звёзды</dt>
          <dd className="repo-stats__value">{stars}</dd>
        </div>
        <div className="repo-stats__item">
          <dt className="repo-stats__label">Форки</dt>
          <dd className="repo-stats__value">{forks}</dd>
        </div>
        <div className="repo-stats__item">
          <dt className="repo-stats__label">Открытые issues</dt>
          <dd className="repo-stats__value">{openIssues}</dd>
        </div>
        <div className="repo-stats__item">
          <dt className="repo-stats__label">Последний коммит</dt>
          <dd className="repo-stats__value">{updatedAt}</dd>
        </div>
      </dl>
    </section>
  );
}

export default RepoStatsCard;
