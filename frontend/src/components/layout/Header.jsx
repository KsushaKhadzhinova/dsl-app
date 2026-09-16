function Header({ navItems }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__logo" href="#main-content" aria-label="DiagramCode, на главную">
          <span className="site-header__logo-text">DiagramCode</span>
        </a>
        <nav className="site-nav" aria-label="Основная навигация">
          <ul className="site-nav__list">
            {navItems.map((item) => (
              <li className="site-nav__item" key={item.href}>
                <a className="site-nav__link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
