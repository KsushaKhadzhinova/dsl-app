function FeatureCard({ title, text, onLearnMore }) {
  return (
    <article className="card feature-card">
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__text">{text}</p>
      <button type="button" className="feature-card__action" onClick={() => onLearnMore(title)}>
        Подробнее
      </button>
    </article>
  );
}

export default FeatureCard;
