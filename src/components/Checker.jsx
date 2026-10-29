import { useRef, useState } from 'react';
import data from '../data/checker.json';
import { txt, INK, TEAL } from '../styles';

const EMPTY_ANSWERS = { area: '', onset: '', worsening: '', associated: '' };

export default function Checker() {
  const [step, setStep] = useState(1);
  const [concern, setConcern] = useState('');
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [chooseWarn, setChooseWarn] = useState(false);
  const [followWarn, setFollowWarn] = useState(false);
  const sectionRef = useRef(null);

  const { stepOne, stepTwo, stepThree } = data;

  const go = (n) => {
    setStep(n);
    requestAnimationFrame(() =>
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  const toStepTwo = () => {
    if (!concern) {
      setChooseWarn(true);
      return;
    }
    setChooseWarn(false);
    go(2);
  };

  const toResults = () => {
    if (Object.values(answers).some((v) => !v)) {
      setFollowWarn(true);
      return;
    }
    setFollowWarn(false);
    go(3);
  };

  const restart = () => {
    setConcern('');
    setAnswers(EMPTY_ANSWERS);
    go(1);
  };

  const group = stepOne.choices.find((c) => c.value === concern)?.group;
  const urgent = stepThree.urgentAnswers.includes(answers.associated);

  return (
    <section
      id="checker"
      ref={sectionRef}
      className="bg-[#eaf3f0] px-5 lg:px-8 py-16 lg:py-20"
      style={{ background: 'rgb(234, 243, 240)' }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="uppercase tracking-widest text-[#087d86] font-bold" style={txt(TEAL, 12)}>
          {data.kicker}
        </p>
        <h2 className="mt-2" style={txt(INK, 24)}>
          {data.title}
        </h2>
        <p className="mt-3 text-[#486169] max-w-2xl" style={txt('rgb(72, 97, 105)', 16)}>
          {data.intro}
        </p>
        <div className="surface rounded-3xl p-6 sm:p-9 mt-8">
          <div className="flex items-center gap-3 mb-8" aria-label={data.stepsAria}>
            {[1, 2, 3].map((n, i) => (
              <span key={n} className="contents">
                <span
                  className={`step-indicator rounded-full w-9 h-9 flex items-center justify-center ${
                    n <= step ? 'bg-[#087d86] text-white' : 'bg-[#e4eeeb] text-[#345159]'
                  }`}
                >
                  {n}
                </span>
                {i < 2 && <span className="h-px bg-[#bed3d1] flex-1"></span>}
              </span>
            ))}
          </div>

          {step === 1 && (
            <div id="step-one">
              <h3 className="mb-5" style={txt(INK, 19)}>
                {stepOne.title}
              </h3>
              <fieldset>
                <legend className="font-semibold mb-3" style={txt(INK, 16)}>
                  {stepOne.legend}
                </legend>
                <div className="grid sm:grid-cols-2 gap-3" id="checker-choices">
                  {stepOne.choices.map((choice) => (
                    <label key={choice.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="concern"
                        value={choice.value}
                        className="peer sr-only"
                        checked={concern === choice.value}
                        onChange={() => setConcern(choice.value)}
                      />
                      <span
                        className="block rounded-xl border border-[#ccdad8] p-3 peer-checked:border-[#087d86] peer-checked:bg-[#e9f6f2]"
                        style={txt(INK, 16)}
                      >
                        {choice.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {chooseWarn && (
                <p id="choose-warning" className="text-[#a44a29] mt-4" role="alert" style={txt('rgb(164, 74, 41)', 16)}>
                  {stepOne.warning}
                </p>
              )}
              <button
                id="to-step-two"
                type="button"
                onClick={toStepTwo}
                className="mt-6 px-6 py-3 rounded-full bg-[#087d86] text-white font-semibold"
                style={{ background: 'rgb(8, 125, 134)', ...txt('rgb(255, 255, 255)', 16) }}
              >
                {stepOne.next}
              </button>
            </div>
          )}

          {step === 2 && (
            <div id="step-two">
              <h3 className="mb-2" style={txt(INK, 19)}>
                {stepTwo.title}
              </h3>
              <p className="text-[#566970] mb-6" style={txt('rgb(86, 105, 112)', 16)}>
                {stepTwo.hint}
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {stepTwo.questions.map((q) => (
                  <div key={q.id}>
                    <label className="block font-semibold mb-2" htmlFor={q.id} style={txt(INK, 16)}>
                      {q.label}
                    </label>
                    <select
                      id={q.id}
                      className="w-full rounded-xl border border-[#bbd0cf] bg-white p-3"
                      value={answers[q.id]}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    >
                      <option value="">{q.placeholder}</option>
                      {q.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {followWarn && (
                <p id="followup-warning" className="text-[#a44a29] mt-4" role="alert" style={txt('rgb(164, 74, 41)', 16)}>
                  {stepTwo.warning}
                </p>
              )}
              <div className="flex gap-3 mt-7">
                <button
                  id="back-one"
                  type="button"
                  onClick={() => go(1)}
                  className="px-6 py-3 rounded-full border border-[#9dbdbb]"
                  style={txt(INK, 16)}
                >
                  {stepTwo.back}
                </button>
                <button
                  id="show-results"
                  type="button"
                  onClick={toResults}
                  className="px-6 py-3 rounded-full bg-[#087d86] text-white font-semibold"
                  style={{ background: 'rgb(8, 125, 134)', ...txt('rgb(255, 255, 255)', 16) }}
                >
                  {stepTwo.results}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div id="step-three">
              <p className="text-[#087d86] font-bold uppercase tracking-widest" style={txt(TEAL, 12)}>
                {stepThree.kicker}
              </p>
              <h3 className="mt-2" style={txt(INK, 19)}>
                {stepThree.title}
              </h3>
              <p className="mt-3 text-[#4d6269]" style={txt('rgb(77, 98, 105)', 16)}>
                {stepThree.intro}
              </p>
              {group && (
                <div className="result-group rounded-2xl bg-[#edf7f3] p-5 mt-5">
                  <p style={txt(INK, 16)}>{stepThree.results[group]}</p>
                </div>
              )}
              <p className="text-sm text-[#53666b] mt-5" style={txt('rgb(83, 102, 107)', 14)}>
                {stepThree.context}
              </p>
              {urgent && (
                <p
                  id="urgent-result"
                  className="mt-5 rounded-xl border border-[#e9b384] bg-[#fff3e6] p-4 text-[#753b19]"
                  style={txt('rgb(117, 59, 25)', 16)}
                >
                  {stepThree.urgent}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  id="back-two"
                  type="button"
                  onClick={() => go(2)}
                  className="px-5 py-3 rounded-full border border-[#9dbdbb]"
                  style={txt(INK, 16)}
                >
                  {stepThree.back}
                </button>
                <button
                  id="restart"
                  type="button"
                  onClick={restart}
                  className="px-5 py-3 rounded-full bg-[#087d86] text-white"
                  style={{ background: 'rgb(8, 125, 134)', ...txt('rgb(255, 255, 255)', 16) }}
                >
                  {stepThree.restart}
                </button>
                <a
                  className="px-5 py-3 rounded-full bg-[#102b37] text-white"
                  href={stepThree.bookHref}
                  style={{ background: 'rgb(16, 43, 55)', ...txt('rgb(255, 255, 255)', 16) }}
                >
                  {stepThree.book}
                </a>
              </div>
            </div>
          )}

          <p
            className="mt-8 border-t border-[#d7e4e1] pt-5 text-sm text-[#405d64]"
            style={txt('rgb(64, 93, 100)', 14)}
          >
            {data.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
