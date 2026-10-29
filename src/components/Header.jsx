import site from '../data/site.json';
import { txt, WHITE } from '../styles';

export default function Header() {
  const { header, logo } = site;
  return (
    <header
      className="sticky top-0 z-40 bg-[#081622] border-b border-white/10"
      style={{ background: 'rgb(8, 22, 34)' }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[78px] flex items-center justify-between gap-5">
        <a href="#home" className="flex items-center gap-3 focusable" aria-label={header.homeLabel}>
          <span className="bg-black rounded-lg overflow-hidden block w-16 h-12">
            <img
              className="w-full h-full object-contain"
              loading="lazy"
              src={logo.src}
              alt={logo.alt}
            />
          </span>
          <span
            className="text-white font-semibold tracking-wide hidden sm:block"
            style={txt(WHITE, 14)}
          >
            {header.name}
          </span>
        </a>
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-6 text-sm text-white/85"
        >
          {header.nav.map((item) => (
            <a key={item.href} className="nav-link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="focusable rounded-full px-5 py-2.5 whitespace-nowrap font-semibold text-sm bg-[#75dad7] text-[#081622]"
          href={header.bookHref}
          style={{ background: 'rgb(117, 218, 215)', color: 'rgb(8, 22, 34)', fontWeight: 400, fontStyle: 'normal', fontSize: '16px' }}
        >
          {header.bookLabel}
        </a>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden flex overflow-x-auto gap-5 px-5 pb-3 text-white/85 text-xs whitespace-nowrap"
      >
        {header.mobileNav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
