import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import FeatureList from './components/FeatureList.jsx';
import NotationsList from './components/NotationsList.jsx';
import RepoStatsCard from './components/RepoStatsCard.jsx';
import AboutSection from './components/AboutSection.jsx';
import Footer from './components/Footer.jsx';
import { navItems, hero, features, notations, repoStats, organization, author, footer } from './data/mockData.js';

function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к основному содержимому
      </a>
      <Header navItems={navItems} />
      <main id="main-content" className="page">
        <Hero title={hero.title} subtitle={hero.subtitle} />
        <FeatureList features={features} />
        <NotationsList notations={notations} />
        <RepoStatsCard {...repoStats} />
        <AboutSection organization={organization} author={author} />
      </main>
      <Footer year={footer.year} repoUrl={footer.repoUrl} />
    </>
  );
}

export default App;
