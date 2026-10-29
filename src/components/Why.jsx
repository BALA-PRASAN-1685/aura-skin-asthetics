import site from '../data/site.json';
import { txt, INK, TEAL, MUTED } from '../styles';

export default function Why() {
  const { why } = site;
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
      <p className="uppercase tracking-widest text-[#087d86] font-bold" style={txt(TEAL, 12)}>
        {why.kicker}
      </p>
      <h2 className="mt-2" style={txt(INK, 24)}>
        {why.title}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {why.items.map((item) => (
          <div key={item.title} className="surface rounded-2xl p-6">
            <h3 style={txt(INK, 19)}>{item.title}</h3>
            <p className="mt-3 text-[#53666b]" style={txt(MUTED, 16)}>
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
