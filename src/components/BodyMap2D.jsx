import data from '../data/explorer.json';

// Renders a shape described in explorer.json, e.g. {"tag":"rect","x":1,...}
function renderShape(shape, key, className) {
  const { tag: Tag, ...attrs } = shape;
  return <Tag key={key} className={className} {...attrs} />;
}

export default function BodyMap2D({ mode, side, hovered, selected, onHover, onSelect }) {
  const cfg = data.modes[mode];
  const view = cfg.views[side] || Object.values(cfg.views)[0];
  const labelFor = (id) => cfg.regions.find((r) => r.id === id)?.label || id;
  const clipId = `clip-${mode}`;
  const clips = view.clip ? [].concat(view.clip) : []; // one shape, or several joined together

  return (
    <svg
      viewBox={cfg.viewBox}
      className="mx-auto block h-[460px] sm:h-[560px] w-full"
      role="group"
      aria-label={cfg.title}
    >
      {clips.length > 0 && (
        <defs>
          <clipPath id={clipId}>{clips.map((s, i) => renderShape(s, `clip${i}`))}</clipPath>
        </defs>
      )}

      {view.decor?.map((s, i) => renderShape(s, `d${i}`, 'zone-decor'))}

      <g clipPath={clips.length > 0 ? `url(#${clipId})` : undefined}>
        {view.zones.map((zone) => (
          <g
            key={zone.region}
            className={`zone${mode === 'hair' ? ' zone-hair' : ''}${hovered === zone.region ? ' is-hover' : ''}${selected === zone.region ? ' is-selected' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={labelFor(zone.region)}
            onClick={() => onSelect(zone.region)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(zone.region);
              }
            }}
            onMouseEnter={() => onHover(zone.region)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(zone.region)}
            onBlur={() => onHover(null)}
          >
            {zone.shapes.map((s, i) => renderShape(s, i))}
          </g>
        ))}
      </g>

      {view.outline?.map((s, i) => renderShape(s, `o${i}`, 'zone-outline'))}
      {view.labels?.map((l) => (
        <text key={l.text} x={l.x} y={l.y} textAnchor="middle" className="map-label">
          {l.text}
        </text>
      ))}
    </svg>
  );
}
