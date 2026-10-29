import site from '../data/site.json';
import HeroVisual from './HeroVisual.jsx';
import { txt, WHITE } from '../styles';

export default function Hero({ query, onQueryChange, onExplore }) {
  const { hero } = site;

  const goToConditions = () => {
    document.getElementById('conditions')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="hero-glow soft-grid text-white overflow-hidden"
      style={{ background: 'radial-gradient(circle at 75% 45%, rgb(18, 81, 106), rgb(8, 22, 34))' }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-[1.15fr_.85fr] items-center gap-12">
        <div className="reveal">
          <p
            className="text-[#e4bb69] uppercase tracking-[.23em] font-bold mb-5"
            style={txt('rgb(228, 187, 105)', 12)}
          >
            {hero.eyebrow}
          </p>
          <h1
            className="font-medium leading-[1.08] max-w-3xl"
            style={txt(WHITE, 58, 500)}
          >
            {hero.title}
          </h1>
          <p
            className="text-[#c7d9dd] leading-relaxed max-w-xl mt-6"
            style={txt('rgb(199, 217, 221)', 18)}
          >
            {hero.description}
          </p>
          <div className="mt-8 max-w-xl">
            <label
              className="block mb-2 text-sm font-semibold"
              htmlFor="concern-search"
              style={txt(WHITE, 14)}
            >
              {hero.searchLabel}
            </label>
            <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-cyan-950/30">
              <input
                id="concern-search"
                className="min-w-0 w-full px-4 py-3 rounded-xl text-[#172c36] outline-none"
                type="search"
                autoComplete="off"
                placeholder={hero.searchPlaceholder}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    goToConditions();
                  }
                }}
                style={txt('rgb(23, 44, 54)', 16)}
              />
              <button
                id="search-button"
                className="rounded-xl px-5 font-semibold bg-[#087d86] text-white"
                type="button"
                onClick={goToConditions}
                style={{ background: 'rgb(8, 125, 134)', ...txt(WHITE, 16) }}
              >
                {hero.searchButton}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href="#explorer"
              onClick={(e) => {
                e.preventDefault();
                onExplore('skin');
              }}
              className="rounded-full bg-[#75dad7] text-[#081622] px-6 py-3 font-bold"
              style={{ background: 'rgb(117, 218, 215)', ...txt('rgb(8, 22, 34)', 16) }}
            >
              {hero.skinCta}
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/50 text-white px-6 py-3 font-semibold hover:bg-white/10"
              style={txt(WHITE, 16)}
            >
              {hero.bookCta}
            </a>
          </div>
          <p
            className="mt-8 text-sm text-[#b8cbd0] max-w-xl"
            style={txt('rgb(184, 203, 208)', 14)}
          >
            {hero.trust}
          </p>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
