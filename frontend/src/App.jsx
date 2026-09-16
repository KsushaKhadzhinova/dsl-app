import Header from './components/layout/Header.jsx';
import Hero from './components/features/Hero.jsx';
import FeatureList from './components/features/FeatureList.jsx';
import NotationsList from './components/features/NotationsList.jsx';
import RepoStatsCard from './components/features/RepoStatsCard.jsx';
import AboutSection from './components/features/AboutSection.jsx';
import Footer from './components/layout/Footer.jsx';
import { navItems, hero, features, notations, repoStats, organization, author, footer } from './data/mockData.js';

function App() {
  const handleLearnMore = (feature) => {
    console.log('Подробнее о возможности:', feature);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к основному содержимому
      </a>
      <Header navItems={navItems} />
      <main id="main-content" className="page">
        <Hero title={hero.title} subtitle={hero.subtitle} />
        <FeatureList features={features} onLearnMore={handleLearnMore} />
        <NotationsList notations={notations} />
        <RepoStatsCard {...repoStats} />
        <AboutSection organization={organization} author={author} />
      </main>
      <Footer year={footer.year} repoUrl={footer.repoUrl} />
    </>
  );
}

export default App;
