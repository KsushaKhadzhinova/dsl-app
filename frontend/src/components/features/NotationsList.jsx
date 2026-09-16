function NotationsList({ notations }) {
  return (
    <section id="notations" className="notations" aria-labelledby="notations-title">
      <h2 id="notations-title" className="notations__title">
        Поддерживаемые нотации
      </h2>
      <ul className="notations__list">
        {notations.map((notation) => (
          <li className="notations__item" key={notation}>
            {notation}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default NotationsList;
