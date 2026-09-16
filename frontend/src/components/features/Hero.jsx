function Hero({ title, subtitle }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__text">
        <h1 id="hero-title" className="hero__title">
          {title}
        </h1>
        <p className="hero__subtitle">{subtitle}</p>
      </div>
    </section>
  );
}

export default Hero;
