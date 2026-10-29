import site from '../data/site.json';
import Explorer from './Explorer.jsx';
import { txt, INK, TEAL } from '../styles';

export default function Paths({ onOpen, mode, onModeChange }) {
  const { paths } = site;

  // Skin / Hair cards open the interactive explorer instead of jumping to the section.
  const openExplorer = (e, which) => {
    e.preventDefault();
    onModeChange(which);
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="px-5 lg:px-8 py-16 lg:py-20 max-w-7xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-[#087d86] uppercase tracking-widest font-bold" style={txt(TEAL, 12)}>
            {paths.kicker}
          </p>
          <h2 className="mt-2 text-[#102a34]" style={txt(INK, 24)}>
            {paths.title}
          </h2>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {paths.items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={item.explorer ? (e) => openExplorer(e, item.explorer) : undefined}
            className="entry-card surface rounded-3xl p-7 focusable"
          >
            <span className="block text-3xl text-[#087d86] mb-6" aria-hidden="true">
              {item.icon}
            </span>
            <h3 style={txt(INK, 19)}>{item.title}</h3>
            <p className="mt-3 text-[#566970]" style={txt('rgb(86, 105, 112)', 16)}>
              {item.body}
            </p>
            <span className="text-[#087d86] mt-5 inline-block" aria-hidden="true">
              {paths.exploreLabel}
            </span>
          </a>
        ))}
      </div>
      <Explorer mode={mode} onModeChange={onModeChange} onOpenGuide={onOpen} />
      <div className="mt-11">
        <h3 className="mb-4" style={txt(INK, 19)}>
          {paths.popularTitle}
        </h3>
        <div className="flex flex-wrap gap-2" id="popular-chips">
          {paths.chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={(e) => onOpen(chip.condition, e.currentTarget)}
              className="rounded-full border border-[#b4d9d5] bg-[#e9f6f2] text-[#145a60] px-4 py-2"
              style={{ background: 'rgb(233, 246, 242)', ...txt('rgb(20, 90, 96)', 16) }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
