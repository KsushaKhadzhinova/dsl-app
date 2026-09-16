import AuthorCard from './AuthorCard.jsx';

function AboutSection({ organization, author }) {
  return (
    <section
      id="about"
      className="about"
      aria-labelledby="about-title"
      itemScope
      itemType="https://schema.org/Organization"
    >
      <h2 id="about-title" className="about__title" itemProp="name">
        {organization.name}
      </h2>
      <p className="about__text" itemProp="description">
        {organization.description}
      </p>
      <meta itemProp="url" content={organization.url} />
      <AuthorCard {...author} />
    </section>
  );
}

export default AboutSection;
