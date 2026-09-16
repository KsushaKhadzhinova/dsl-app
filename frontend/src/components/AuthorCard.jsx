import { stripProtocol } from '../utils/stripProtocol.js';

function AuthorCard({ name, jobTitle, affiliation, sameAs }) {
  return (
    <article
      id="author"
      className="author"
      aria-labelledby="author-title"
      itemProp="founder"
      itemScope
      itemType="https://schema.org/Person"
    >
      <h3 id="author-title" className="author__title">
        Автор проекта
      </h3>
      <p className="author__name" itemProp="name">
        {name}
      </p>
      <p className="author__role" itemProp="jobTitle">
        {jobTitle}
      </p>
      <p
        className="author__affiliation"
        itemProp="affiliation"
        itemScope
        itemType="https://schema.org/CollegeOrUniversity"
      >
        <span itemProp="name">{affiliation}</span>
      </p>
      <a className="author__link" itemProp="sameAs" href={sameAs}>
        {stripProtocol(sameAs)}
      </a>
    </article>
  );
}

export default AuthorCard;
