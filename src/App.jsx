import { useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Paths from './components/Paths.jsx';
import InfoSection from './components/InfoSection.jsx';
import Conditions from './components/Conditions.jsx';
import DetailDialog from './components/DetailDialog.jsx';
import Checker from './components/Checker.jsx';
import Why from './components/Why.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [explorerMode, setExplorerMode] = useState(null); // 'skin' | 'hair' | null
  const returnFocus = useRef(null);

  const openDetail = (id, trigger) => {
    returnFocus.current = trigger;
    setOpenId(id);
  };

  // Opens the Interactive Explorer (Start exploring) on the chosen model and scrolls to it.
  const openExplorer = (which) => {
    setExplorerMode(which);
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeDetail = () => {
    setOpenId(null);
    returnFocus.current?.focus();
  };

  return (
    <>
      <Header />
      <main>
        <Hero query={query} onQueryChange={setQuery} onExplore={openExplorer} />
        <Paths onOpen={openDetail} mode={explorerMode} onModeChange={setExplorerMode} />
        <InfoSection variant="skin" />
        <InfoSection variant="hair" />
        <Conditions query={query} onOpen={openDetail} />
        <Checker />
        <Why />
        <Contact />
      </main>
      <Footer />
      {openId && <DetailDialog id={openId} onClose={closeDetail} />}
    </>
  );
}
