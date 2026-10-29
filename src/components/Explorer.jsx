import { Component, lazy, Suspense, useEffect, useState } from 'react';
import data from '../data/explorer.json';
import BodyMap2D from './BodyMap2D.jsx';
import ProblemDialog from './ProblemDialog.jsx';
import { txt, INK, TEAL } from '../styles';

// The 3D scene (three.js) is loaded only when someone opens the 3D view.
const Scene3D = lazy(() => import('./Scene3D.jsx'));

const hasWebGL = () => {
  if (typeof document === 'undefined') return true;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-[#c7d9dd]" style={txt('rgb(199, 217, 221)', 16)}>
          {data.ui.error3d}
        </p>
        <button
          type="button"
          onClick={this.props.onUse2d}
          className="rounded-full bg-[#75dad7] text-[#081622] px-5 py-2 font-semibold"
        >
          {data.ui.use2d}
        </button>
      </div>
    );
  }
}

const seg = (active) =>
  `px-5 py-2 rounded-full transition-colors ${
    active ? 'bg-[#087d86] text-white' : 'bg-[#e9f6f2] text-[#145a60] border border-[#b4d9d5]'
  }`;

export default function Explorer({ mode, onModeChange, onOpenGuide }) {
  const { ui } = data;
  // Opens in 3D (set ui.defaultView to "2d" in explorer.json to change). Falls back to 2D without WebGL.
  const [view, setView] = useState(() => (ui.defaultView === '3d' && hasWebGL() ? '3d' : '2d'));
  const [side, setSide] = useState('front');
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [webgl] = useState(hasWebGL);

  // Reset the interaction state whenever Skin <-> Hair changes (also from the entry cards).
  useEffect(() => {
    setHovered(null);
    setSelected(null);
    setDialogOpen(false);
  }, [mode]);

  const cfg = mode ? data.modes[mode] : null;
  const viewKeys = cfg ? Object.keys(cfg.views) : [];
  const activeSide = viewKeys.includes(side) ? side : viewKeys[0];
  const allRegions = cfg ? [...cfg.regions, cfg.allRegion] : [];
  const region = allRegions.find((r) => r.id === selected) || null;
  const hoveredRegion = allRegions.find((r) => r.id === hovered) || null;

  const select = (id) => {
    setSelected(id);
    setDialogOpen(true);
  };

  return (
    <div id="explorer" className="mt-10" style={{ scrollMarginTop: '100px' }}>
      <div className="surface rounded-3xl p-5 sm:p-8">
        <p className="text-[#087d86] uppercase tracking-widest font-bold" style={txt(TEAL, 12)}>
          {ui.kicker}
        </p>
        <h3 className="mt-2" style={txt(INK, 24)}>
          {ui.title}
        </h3>
        <p className="mt-3 max-w-2xl text-[#53666b]" style={txt('rgb(83, 102, 107)', 16)}>
          {ui.intro}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div role="tablist" aria-label="Skin or hair" className="flex gap-2">
            {Object.keys(ui.tabs).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => onModeChange(m)}
                className={seg(mode === m)}
                style={txt(mode === m ? 'rgb(255, 255, 255)' : 'rgb(20, 90, 96)', 16)}
              >
                {ui.tabs[m]}
              </button>
            ))}
          </div>

          {cfg && (
            <div className="flex flex-wrap gap-2">
              {view === '2d' && viewKeys.length > 1 && (
                <div className="flex gap-2" role="group" aria-label="Model side">
                  {viewKeys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={activeSide === k}
                      onClick={() => setSide(k)}
                      className={seg(activeSide === k)}
                      style={txt(activeSide === k ? 'rgb(255, 255, 255)' : 'rgb(20, 90, 96)', 16)}
                    >
                      {ui.sides[k]}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2" role="group" aria-label="Model type">
                {['2d', '3d'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={seg(view === v)}
                    style={txt(view === v ? 'rgb(255, 255, 255)' : 'rgb(20, 90, 96)', 16)}
                  >
                    {ui.views[v]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!cfg ? (
          <div className="mt-6 rounded-2xl bg-[#eaf3f0] p-8 text-center">
            <p className="font-semibold" style={txt(INK, 19)}>
              {ui.placeholderTitle}
            </p>
            <p className="mt-2 text-[#53666b]" style={txt('rgb(83, 102, 107)', 16)}>
              {ui.placeholderBody}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid lg:grid-cols-[1.1fr_.9fr] gap-6 items-start">
            <div
              className="stage soft-grid relative rounded-2xl overflow-hidden h-[460px] sm:h-[560px]"
              aria-label={ui.stageAria}
            >
              <div
                className="absolute left-4 top-4 z-10 rounded-full bg-black/40 px-4 py-1.5 text-white pointer-events-none"
                style={txt('rgb(255, 255, 255)', 14)}
                aria-live="polite"
              >
                {hoveredRegion ? `${ui.hoverPrefix} ${hoveredRegion.label}` : ui.hoverEmpty}
              </div>

              {view === '2d' ? (
                <BodyMap2D
                  mode={mode}
                  side={activeSide}
                  hovered={hovered}
                  selected={selected}
                  onHover={setHovered}
                  onSelect={select}
                />
              ) : !webgl ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <p className="text-[#c7d9dd]" style={txt('rgb(199, 217, 221)', 16)}>
                    {ui.noWebgl}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('2d')}
                    className="rounded-full bg-[#75dad7] text-[#081622] px-5 py-2 font-semibold"
                  >
                    {ui.use2d}
                  </button>
                </div>
              ) : (
                <Boundary onUse2d={() => setView('2d')}>
                  <Suspense
                    fallback={
                      <div className="h-full flex items-center justify-center text-[#c7d9dd]">
                        {ui.loading3d}
                      </div>
                    }
                  >
                    <Scene3D
                      mode={mode}
                      hovered={hovered}
                      selected={selected}
                      paused={dialogOpen}
                      onHover={setHovered}
                      onSelect={select}
                    />
                  </Suspense>
                </Boundary>
              )}
            </div>

            <div>
              <h4 className="font-semibold" style={{ ...txt(INK, 19), fontFamily: 'Fraunces, serif' }}>
                {cfg.title}
              </h4>
              <p className="mt-2 text-[#53666b]" style={txt('rgb(83, 102, 107)', 16)}>
                {view === '2d' ? ui.hint2d : ui.hint3d}
              </p>

              <p className="mt-6 mb-3 font-semibold" style={txt(INK, 16)}>
                {ui.listTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {allRegions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => select(r.id)}
                    onMouseEnter={() => setHovered(r.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(r.id)}
                    onBlur={() => setHovered(null)}
                    className={`rounded-full border px-4 py-2 ${
                      selected === r.id
                        ? 'border-[#d7a84d] bg-[#fbeccb] text-[#5b4313]'
                        : 'border-[#b4d9d5] bg-[#e9f6f2] text-[#145a60]'
                    }`}
                    style={{ fontWeight: 400, fontStyle: 'normal', fontSize: '15px' }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <p className="mt-6 text-[#63777c]" style={txt('rgb(99, 119, 124)', 12)}>
                {ui.note}
              </p>
            </div>
          </div>
        )}
      </div>

      {dialogOpen && region && (
        <ProblemDialog
          key={`${mode}-${region.id}`}
          mode={mode}
          region={region}
          onClose={() => setDialogOpen(false)}
          onOpenGuide={onOpenGuide}
        />
      )}
    </div>
  );
}
