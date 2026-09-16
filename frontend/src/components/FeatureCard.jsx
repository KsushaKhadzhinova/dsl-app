function FeatureCard({ title, text }) {
  return (
    <article className="feature-card">
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__text">{text}</p>
    </article>
  );
}

export default FeatureCard;
