import site from '../data/site.json';
import { conditions } from '../data/conditions.json';
import { txt, INK, TEAL, MUTED } from '../styles';

export default function Conditions({ query, onOpen }) {
  const section = site.conditionsSection;
  const term = query.trim().toLowerCase();

  const visible = conditions.filter(
    (c) => !term || `${c.id} ${c.keywords} ${c.title}`.toLowerCase().includes(term)
  );

  return (
    <section id="conditions" className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
      <p className="uppercase tracking-widest text-[#087d86] font-bold" style={txt(TEAL, 12)}>
        {section.kicker}
      </p>
      <h2 className="mt-2" style={txt(INK, 24)}>
        {section.title}
      </h2>
      <p className="mt-3 max-w-2xl text-[#53666b]" style={txt(MUTED, 16)}>
        {section.intro}
      </p>
      <div id="condition-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
        {visible.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={(e) => onOpen(c.id, e.currentTarget)}
            className="condition-card surface rounded-2xl p-5 text-left"
          >
            <span className="diagram block h-20 rounded-xl mb-4"></span>
            <span className="block font-bold" style={txt(INK, 16)}>
              {c.title}
            </span>
          </button>
        ))}
      </div>
      <p
        id="no-results"
        className={`${visible.length === 0 ? '' : 'hidden '}rounded-2xl bg-[#eaf3f0] p-7 mt-6 text-[#345159]`}
        role="status"
        style={txt('rgb(52, 81, 89)', 16)}
      >
        {section.emptyMessage}
      </p>
      <p className="text-xs text-[#63777c] mt-7" style={txt('rgb(99, 119, 124)', 12)}>
        {section.illustrationNote}
      </p>
    </section>
  );
}
