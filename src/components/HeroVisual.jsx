import site from '../data/site.json';
import { txt } from '../styles';

// Right side of the hero: glowing sphere, gold orbit rings, floating photo bubbles and the logo card.
// Everything (images, positions, caption) comes from site.json -> hero.orbit / hero.artCaption.
export default function HeroVisual() {
  const { hero, logo } = site;

  return (
    <div className="relative mx-auto w-full max-w-[500px] aspect-square reveal delay-1" aria-label={hero.artLabel}>
      {/* Sphere */}
      <div className="hero-sphere absolute" aria-hidden="true"></div>

      {/* Gold orbit rings */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 472 467"
        fill="none"
        aria-hidden="true"
      >
        <g className="ring ring-a">
          <ellipse cx="236" cy="233" rx="222" ry="150" transform="rotate(-24 236 233)" />
        </g>
        <g className="ring ring-b">
          <ellipse cx="236" cy="233" rx="205" ry="165" transform="rotate(28 236 233)" />
        </g>
        <g className="ring ring-c">
          <ellipse cx="236" cy="233" rx="150" ry="118" transform="rotate(-60 236 233)" />
        </g>
        <ellipse cx="236" cy="233" rx="112" ry="108" className="ring-static" />
      </svg>

      {/* Floating photo bubbles */}
      {hero.orbit.map((item, i) => (
        <div
          key={item.src}
          className="orbit-item absolute"
          style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.size}%` }}
        >
          <div className="orbit-float" style={{ animationDelay: `${i * -1.3}s` }}>
            <img
              className="orbit-img"
              loading="lazy"
              src={item.src}
              alt={item.alt}
              onError={(e) => {
                // If a photo is missing, keep the empty teal bubble instead of a broken image icon.
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          </div>
        </div>
      ))}

      {/* Logo card */}
      <div className="hero-card absolute">
        <img className="hero-card-logo" loading="lazy" src={logo.src} alt={logo.alt} />
        <p className="text-center mt-3" style={txt('rgb(183, 212, 213)', 12)}>
          {hero.artCaption}
        </p>
      </div>
    </div>
  );
}
