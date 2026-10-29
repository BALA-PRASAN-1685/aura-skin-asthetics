import { useEffect, useRef } from 'react';
import site from '../data/site.json';
import { conditions, detailLabels } from '../data/conditions.json';
import { txt, INK, TEAL } from '../styles';

export default function DetailDialog({ id, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const condition = conditions.find((c) => c.id === id);
  const { dialog } = site;

  // Lock page scroll and focus the close button while the dialog is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Escape to close + keep Tab focus inside the dialog.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const controls = [...dialogRef.current.querySelectorAll('button,a[href]')];
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

  if (!condition) return null;

  return (
    <div
      ref={dialogRef}
      id="detail-dialog"
      className="dialog-backdrop fixed inset-0 z-50 p-3 sm:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-heading"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#f8f7f2] rounded-3xl w-full max-w-4xl max-h-[90%] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#f8f7f2] border-b border-[#dce7e4] px-5 sm:px-8 py-4 flex justify-between items-center gap-3 z-10">
          <h2 id="dialog-heading" style={txt(INK, 24)}>
            {dialog.heading}
          </h2>
          <button
            ref={closeRef}
            id="close-dialog"
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#102b37] text-white px-4 py-2"
            style={{ background: 'rgb(16, 43, 55)', ...txt('rgb(255, 255, 255)', 16) }}
          >
            {dialog.closeLabel}
          </button>
        </div>
        <div className="p-5 sm:p-8 grid md:grid-cols-[190px_1fr] gap-7">
          <div>
            <div className="diagram rounded-3xl h-48"></div>
            <p className="text-xs text-[#53666b] mt-3" style={txt('rgb(83, 102, 107)', 12)}>
              {dialog.visualNote}
            </p>
            <p
              className="text-xs text-[#53666b] mt-5 border-t pt-4"
              style={txt('rgb(83, 102, 107)', 12)}
            >
              {dialog.reviewNote}
            </p>
          </div>
          <div>
            <p className="text-[#087d86] font-semibold mb-5" style={txt(TEAL, 16)}>
              {dialog.preface}
            </p>
            <div id="detail-content" className="space-y-5">
              <article className="space-y-5">
                <h3 className="text-[#102b37]" style={txt(INK, 19)}>
                  {condition.title}
                </h3>
                {detailLabels.map(({ key, label }) => (
                  <p
                    key={key}
                    className="leading-relaxed text-[#405a61]"
                    style={{ fontWeight: 400, fontStyle: 'normal', fontSize: '16px' }}
                  >
                    {label} {condition.details[key]}
                  </p>
                ))}
              </article>
            </div>
            <div className="mt-7 pt-5 border-t border-[#dce7e4]">
              <a
                href="#contact"
                onClick={onClose}
                className="inline-block rounded-full bg-[#087d86] text-white px-5 py-3 font-semibold"
                style={{ background: 'rgb(8, 125, 134)', ...txt('rgb(255, 255, 255)', 16) }}
              >
                {dialog.contactLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
