import FeatureCard from './FeatureCard.jsx';

function FeatureList({ features }) {
  return (
    <section id="features" className="features" aria-labelledby="features-title">
      <h2 id="features-title" className="features__title">
        Возможности
      </h2>
      <div className="features__grid">
        {features.map((feature) => (
          <FeatureCard key={feature.id} title={feature.title} text={feature.text} />
        ))}
      </div>
    </section>
  );
}

export default FeatureList;
