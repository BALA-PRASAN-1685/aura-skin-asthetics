import { useEffect, useRef, useState } from 'react';
import data from '../data/explorer.json';
import { analyze } from '../utils/analyze.js';
import { assessWithAura, generateAuraImage } from '../utils/auraAi.js';
import { txt, INK, TEAL } from '../styles';

export default function ProblemDialog({ mode, region, onClose, onOpenGuide }) {
  const { dialog } = data;
  const cfg = data.modes[mode];

  const [text, setText] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [warn, setWarn] = useState(false);
  const [result, setResult] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const closeRef = useRef(null);
  const previousFocus = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  // Lock page scroll, focus the close button, then restore focus on unmount.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const toRestore = previousFocus.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      if (toRestore && document.contains(toRestore)) toRestore.focus?.();
    };
  }, []);

  // Escape + focus trap. Ignored while a condition guide is open on top of this dialog.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (document.getElementById('detail-dialog')) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && rootRef.current) {
        const controls = [
          ...rootRef.current.querySelectorAll('button,a[href],textarea,select,input'),
        ].filter((el) => !el.disabled);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const toggleSymptom = (key) =>
    setSymptoms((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));

  const symptomLabels = symptoms.map((k) => cfg.symptoms.find((s) => s.key === k)?.label).filter(Boolean);

  const submit = (e) => {
    e?.preventDefault();
    if (!text.trim() && symptoms.length === 0) {
      setWarn(true);
      return;
    }
    setWarn(false);
    const localResult = analyze({
      mode,
      regionId: region.id,
      text,
      symptoms,
    });
    setResult(localResult);
    setAiReport(null);
    setImageUrl('');
    setImageError('');
    setAiLoading(true);
    assessWithAura({
      mode,
      zone: region.label,
      symptomsText: text.trim(),
      symptoms: symptomLabels,
      duration,
      matchedConditions: localResult.matches.map((match) => ({
        id: match.id,
        title: match.title,
      })),
    })
      .then((report) => setAiReport(report))
      .catch(() => setAiReport(null))
      .finally(() => setAiLoading(false));
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const generateImage = async () => {
    if (!aiReport?.imagePrompt) return;
    setImageLoading(true);
    setImageError('');
    try {
      const url = await generateAuraImage(aiReport.imagePrompt);
      setImageUrl(url);
    } catch (error) {
      setImageError(error.message || 'Image generation failed.');
    } finally {
      setImageLoading(false);
    }
  };

  const browseAll = () => {
    onClose();
    setTimeout(() => document.getElementById('conditions')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  return (
    <div
      ref={rootRef}
      className="dialog-backdrop fixed inset-0 z-50 p-3 sm:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-heading"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={scrollRef}
        className="bg-[#f8f7f2] rounded-3xl w-full max-w-2xl max-h-[90%] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-[#f8f7f2] border-b border-[#dce7e4] px-5 sm:px-8 py-4 flex justify-between items-center gap-3 z-10">
          <h2 id="problem-heading" style={txt(INK, 24)}>
            {dialog.heading}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#102b37] text-white px-4 py-2"
            style={{ background: 'rgb(16, 43, 55)', ...txt('rgb(255, 255, 255)', 16) }}
          >
            {dialog.close}
          </button>
        </div>

        {!result ? (
          <form className="p-5 sm:p-8 space-y-6" onSubmit={submit} noValidate>
            <div>
              <p className="text-[#087d86] font-bold uppercase tracking-widest" style={txt(TEAL, 12)}>
                {dialog.kicker}
              </p>
              <div className="mt-3 rounded-2xl bg-[#e9f6f2] border border-[#b4d9d5] p-4">
                <p className="text-[#145a60]" style={txt('rgb(20, 90, 96)', 14)}>
                  {dialog.areaLabel}
                </p>
                <p className="font-semibold mt-1" style={txt(INK, 19)}>
                  {region.label}
                </p>
                <p className="mt-1 text-[#53666b]" style={txt('rgb(83, 102, 107)', 14)}>
                  {region.hint}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="problem-text" className="block font-semibold mb-2" style={txt(INK, 16)}>
                {dialog.textLabel}
              </label>
              <textarea
                id="problem-text"
                rows={4}
                value={text}
                maxLength={500}
                placeholder={dialog.textPlaceholder}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    submit();
                  }
                }}
                className="w-full rounded-xl border border-[#bbd0cf] bg-white p-3"
                style={txt(INK, 16)}
              />
              <p className="mt-1 text-[#63777c]" style={txt('rgb(99, 119, 124)', 12)}>
                {dialog.enterHint}
              </p>
            </div>

            <fieldset>
              <legend className="font-semibold mb-3" style={txt(INK, 16)}>
                {dialog.symptomsLegend}
              </legend>
              <div className="flex flex-wrap gap-2">
                {cfg.symptoms.map((s) => {
                  const on = symptoms.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleSymptom(s.key)}
                      className={`rounded-full border px-4 py-2 ${
                        on
                          ? 'border-[#087d86] bg-[#087d86] text-white'
                          : 'border-[#b4d9d5] bg-[#e9f6f2] text-[#145a60]'
                      }`}
                      style={{ fontWeight: 400, fontStyle: 'normal', fontSize: '15px' }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="problem-duration" className="block font-semibold mb-2" style={txt(INK, 16)}>
                {dialog.durationLabel}
              </label>
              <select
                id="problem-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-[#bbd0cf] bg-white p-3"
              >
                <option value="">{dialog.durationPlaceholder}</option>
                {dialog.durations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {warn && (
              <p className="text-[#a44a29]" role="alert" style={txt('rgb(164, 74, 41)', 16)}>
                {dialog.warning}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full border border-[#9dbdbb]"
                style={txt(INK, 16)}
              >
                {dialog.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#087d86] text-white font-semibold"
                style={{ background: 'rgb(8, 125, 134)', ...txt('rgb(255, 255, 255)', 16) }}
              >
                {dialog.submit}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 sm:p-8 space-y-5">
            <div>
              <p className="text-[#087d86] font-bold uppercase tracking-widest" style={txt(TEAL, 12)}>
                {dialog.resultKicker}
              </p>
              <h3 className="mt-2" style={txt(INK, 19)}>
                {dialog.resultTitle} · {region.label}
              </h3>
              <p className="mt-3 text-[#4d6269]" style={txt('rgb(77, 98, 105)', 16)}>
                {dialog.resultIntro}
              </p>
            </div>

            <div className="rounded-2xl bg-[#edf7f3] p-5 space-y-1">
              <p className="font-semibold" style={txt(INK, 14)}>
                {dialog.youShared}
              </p>
              {text.trim() && (
                <p className="whitespace-pre-wrap break-words" style={txt(INK, 16)}>
                  “{text.trim()}”
                </p>
              )}
              {symptomLabels.length > 0 && (
                <p style={txt('rgb(83, 102, 107)', 14)}>{symptomLabels.join(' · ')}</p>
              )}
              {duration && <p style={txt('rgb(83, 102, 107)', 14)}>{duration}</p>}
            </div>

            {result.urgent && (
              <p
                className="rounded-xl border border-[#e9b384] bg-[#fff3e6] p-4 text-[#753b19]"
                style={txt('rgb(117, 59, 25)', 16)}
              >
                {dialog.urgent}
              </p>
            )}

            {aiLoading && (
              <p className="text-[#087d86]" style={txt('rgb(8, 125, 134)', 14)}>
                Aura is reviewing the details…
              </p>
            )}

            {aiReport && (
              <div className="rounded-2xl border border-[#b4d9d5] bg-[#e9f6f2] p-5 space-y-3">
                <p className="font-bold uppercase tracking-widest text-[#087d86]" style={txt('rgb(8, 125, 134)', 12)}>
                  Aura AI pre-check · {aiReport.urgency}
                </p>
                <p style={txt(INK, 16)}>{aiReport.summary}</p>
                {Array.isArray(aiReport.homeCare) && aiReport.homeCare.length > 0 && (
                  <div>
                    <p className="font-semibold" style={txt(INK, 14)}>Home care</p>
                    <ul className="mt-1 list-disc list-inside text-[#53666b]" style={txt('rgb(83, 102, 107)', 14)}>
                      {aiReport.homeCare.slice(0, 5).map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  onClick={generateImage}
                  disabled={imageLoading}
                  className="rounded-full bg-[#087d86] px-5 py-2 text-white disabled:opacity-60"
                  style={{ background: 'rgb(8, 125, 134)', ...txt('rgb(255, 255, 255)', 15) }}
                >
                  {imageLoading ? 'Generating illustration…' : 'Generate educational illustration'}
                </button>
                {imageError && (
                  <p className="text-[#a44a29]" role="alert" style={txt('rgb(164, 74, 41)', 14)}>
                    {imageError}
                  </p>
                )}
                {imageUrl && (
                  <>
                    <img
                      src={imageUrl}
                      alt="Educational dermatology illustration generated for this concern"
                      className="mt-3 max-h-80 w-full rounded-xl object-contain bg-white"
                    />
                    <p className="mt-2 text-[#53666b]" style={txt('rgb(83, 102, 107)', 12)}>
                      Educational illustration only. This image is not a photograph of the patient and is not diagnostic evidence.
                    </p>
                  </>
                )}
              </div>
            )}

            {result.matches.length === 0 ? (
              <p className="text-[#345159]" style={txt('rgb(52, 81, 89)', 16)}>
                {dialog.noMatch}
              </p>
            ) : (
              <div className="space-y-3">
                {result.matches.map((m) => (
                  <article key={m.id} className="surface rounded-2xl p-5">
                    <h3 style={txt(INK, 19)}>{m.title}</h3>
                    <p className="mt-2 text-[#53666b]" style={txt('rgb(83, 102, 107)', 16)}>
                      {m.what}
                    </p>
                    <p className="mt-2 text-[#53666b]" style={txt('rgb(83, 102, 107)', 14)}>
                      {m.when}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => onOpenGuide(m.id, e.currentTarget)}
                      className="mt-4 rounded-full bg-[#102b37] text-white px-5 py-2"
                      style={{ background: 'rgb(16, 43, 55)', ...txt('rgb(255, 255, 255)', 15) }}
                    >
                      {dialog.readGuide}
                    </button>
                  </article>
                ))}
              </div>
            )}

            <p className="text-[#53666b]" style={txt('rgb(83, 102, 107)', 14)}>
              {dialog.context}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAiReport(null);
                  setImageUrl('');
                  setImageError('');
                }}
                className="px-5 py-3 rounded-full border border-[#9dbdbb]"
                style={txt(INK, 16)}
              >
                {dialog.edit}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-full border border-[#9dbdbb]"
                style={txt(INK, 16)}
              >
                {dialog.another}
              </button>
              <button
                type="button"
                onClick={browseAll}
                className="px-5 py-3 rounded-full border border-[#9dbdbb]"
                style={txt(INK, 16)}
              >
                {data.dialog.browse || 'Browse all guides'}
              </button>
              <a
                href="#contact"
                onClick={onClose}
                className="px-5 py-3 rounded-full bg-[#087d86] text-white"
                style={{ background: 'rgb(8, 125, 134)', ...txt('rgb(255, 255, 255)', 16) }}
              >
                {dialog.book}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
