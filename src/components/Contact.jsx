import site from '../data/site.json';
import { txt, WHITE } from '../styles';

export default function Contact() {
  const { contact } = site;
  return (
    <section
      id="contact"
      className="bg-[#102b37] text-white px-5 lg:px-8 py-16 lg:py-20"
      style={{ background: 'rgb(16, 43, 55)' }}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        <div>
          <p
            className="uppercase tracking-widest text-[#9fe5df] font-bold"
            style={txt('rgb(159, 229, 223)', 12)}
          >
            {contact.kicker}
          </p>
          <h2 className="mt-2" style={txt(WHITE, 24)}>
            {contact.title}
          </h2>
          <p className="mt-4 text-[#c7d9dd]" style={txt('rgb(199, 217, 221)', 16)}>
            {contact.intro}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              className="rounded-full bg-[#75dad7] text-[#081622] px-6 py-3 font-bold"
              href={contact.phoneHref}
              style={{ background: 'rgb(117, 218, 215)', ...txt('rgb(8, 22, 34)', 16) }}
            >
              {contact.callLabel}
            </a>
            <a
              className="rounded-full border border-white/50 px-6 py-3 text-white"
              href={contact.directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              style={txt(WHITE, 16)}
            >
              {contact.directionsLabel}
            </a>
          </div>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white/5 p-7 sm:p-9 space-y-6">
          {contact.details.map((d) => (
            <div key={d.label}>
              <h3 className="text-[#9fe5df]" style={txt('rgb(159, 229, 223)', 19)}>
                {d.label}
              </h3>
              <p className="mt-2" style={txt(WHITE, 16)}>
                {d.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
