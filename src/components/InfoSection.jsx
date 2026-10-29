import site from '../data/site.json';
import { txt, INK, TEAL, WHITE, MUTED } from '../styles';

// Renders the "Skin Health" (light) and "Hair & Scalp" (dark) sections.
export default function InfoSection({ variant }) {
  if (variant === 'skin') {
    const s = site.skin;
    return (
      <section
        id="skin"
        className="bg-[#eaf3f0] py-16 lg:py-20 px-5 lg:px-8"
        style={{ background: 'rgb(234, 243, 240)' }}
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[.75fr_1.25fr] gap-10 items-start">
          <div>
            <p className="uppercase tracking-widest text-[#087d86] font-bold" style={txt(TEAL, 12)}>
              {s.kicker}
            </p>
            <h2 className="mt-2" style={txt(INK, 24)}>
              {s.title}
            </h2>
            <p className="mt-5 text-[#4c6369] leading-relaxed" style={txt('rgb(76, 99, 105)', 16)}>
              {s.description}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {s.cards.map((card) => (
              <article
                key={card.title}
                className={`surface rounded-2xl p-6${card.wide ? ' sm:col-span-2' : ''}`}
              >
                <h3 style={txt(INK, 19)}>{card.title}</h3>
                <p className="text-[#53666b] mt-3 leading-relaxed" style={txt(MUTED, 16)}>
                  {card.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const h = site.hair;
  return (
    <section
      id="hair"
      className="bg-[#102b37] text-white py-16 lg:py-20 px-5 lg:px-8"
      style={{ background: 'rgb(16, 43, 55)' }}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p
            className="uppercase tracking-widest text-[#9fe5df] font-bold"
            style={txt('rgb(159, 229, 223)', 12)}
          >
            {h.kicker}
          </p>
          <h2 className="mt-2" style={txt(WHITE, 24)}>
            {h.title}
          </h2>
          <p className="mt-5 text-[#cedee0] leading-relaxed" style={txt('rgb(206, 222, 224)', 16)}>
            {h.description}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {h.cards.map((card) => (
            <article key={card.title} className="rounded-2xl p-6 border border-white/15 bg-white/5">
              <h3 className="text-white" style={txt(WHITE, 19)}>
                {card.title}
              </h3>
              <p className="mt-3 text-[#cfdee1] leading-relaxed" style={txt('rgb(207, 222, 225)', 16)}>
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
