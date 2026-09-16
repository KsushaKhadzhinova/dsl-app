function Footer({ year, repoUrl }) {
  return (
    <footer className="site-footer">
      <p className="site-footer__text">&copy; {year} DiagramCode. Учебный проект, БГУИР.</p>
      <a className="site-footer__link" href={repoUrl}>
        Исходный код на GitHub
      </a>
    </footer>
  );
}

export default Footer;
