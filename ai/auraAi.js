export const REPORT_SCHEMA = {
  urgency: ['Routine', 'Soon', 'Urgent'],
  required: ['urgency', 'summary', 'conditions', 'homeCare', 'treatments', 'redFlags', 'imagePrompt'],
};

export function buildAssessmentPrompt({
  mode,
  zone,
  symptoms,
  duration = '',
  age = '',
  gender = '',
  matchedConditions = [],
}) {
  const area = mode === 'hair' ? 'hair and scalp' : mode === 'face' ? 'face' : 'body';
  const matchesText = Array.isArray(matchedConditions) && matchedConditions.length
    ? matchedConditions.map((match) => match.title || match.name || match.id).filter(Boolean).join(', ')
    : 'No meaningful local condition matches';

  return `You are Aura, an educational dermatology pre-check assistant for Aura Skin & Aesthetics in Narasaraopet, India. This is never a diagnosis or prescription.

Describe the concern from this information:
- Mode/area: ${mode} / ${area}
- Selected zone: ${zone}
- Person's words: ${symptoms}
- Duration: ${duration || 'not stated'}
- Age: ${age || 'not stated'}
- Gender: ${gender || 'not stated'}
- Locally matched educational topics: ${matchesText}
- Do not confirm or claim a diagnosis. Frame listed topics as possibilities based on the local matches.

Use warm, plain language. Return only valid JSON with:
- urgency: exactly Routine, Soon, or Urgent
- summary: short educational summary
- conditions: 2-4 objects with name, likelihood (high match, medium match, or low match), and why
- homeCare: 3-5 safe practical steps
- treatments: 3-5 options a dermatologist may discuss; no prescriptions or guaranteed outcomes
- redFlags: 3-5 signs needing urgent care
- imagePrompt: one safe, non-graphic educational medical textbook illustration prompt specific to the top local match, selected region, and its visual characteristics; no real patient

Urgent means same-day care signs only. Default to Routine or Soon unless clear warning signs are present.`;
}

const VISUAL_DESCRIPTIONS = {
  acne: 'simplified skin structures and representative acne features such as clogged pores and small raised, non-pustular spots',
  eczema: 'a simplified representation of dry, mildly irritated skin and the skin barrier concept with gentle surface redness',
  psoriasis: 'a simplified representation of well-defined raised patches with mild surface scale',
  rosacea: 'a simplified central-face skin representation with mild uneven redness and small surface vessels',
  contact: 'a simplified representation of mild skin irritation where contact may occur',
  seborrheic: 'a simplified representation of mild surface flaking and redness in oil-rich skin areas',
  dandruff: 'a simplified scalp representation with loose, non-inflammatory flakes',
  vitiligo: 'a simplified cross-section showing areas with reduced pigment distribution',
  melasma: 'a simplified skin cross-section showing uneven distribution of pigment',
  pattern: 'a simplified representation of gradual reduction in hair density',
  telogen: 'a simplified representation of normal and shedding hairs across the scalp without graphic injury',
  areata: 'a simplified representation of a small round area of reduced hair density',
  'scalp-psoriasis': 'a simplified scalp representation with mild defined patches and surface scale',
  tinea: 'a simplified, non-graphic scalp education diagram with a scaly patch and no infected tissue',
  breakage: 'a simplified representation of hair strands with weak points and split ends',
};

function buildConditionImagePrompt(mode, zone, matchedConditions) {
  const area = mode === 'hair' ? 'hair and scalp' : mode === 'face' ? 'face' : 'body';
  const selectedArea = zone || area;
  const match = Array.isArray(matchedConditions) ? matchedConditions[0] : null;

  if (!match) {
    return `Create a clean, non-graphic educational ${mode === 'hair' ? 'scalp' : 'dermatology'} illustration of the ${selectedArea}. Show a simplified, neutral skin or scalp structure without a specific disease appearance. Professional medical textbook illustration style. Neutral background. No text, no labels, no exposed body parts, no graphic content, no real patient.`;
  }

  const name = String(match.title || match.name || match.id || '').trim();
  const key = String(match.id || '').toLowerCase();
  const visual = VISUAL_DESCRIPTIONS[key]
    || 'a simplified, neutral educational skin or scalp structure without inventing specific disease features';

  return `Create a clean, non-graphic educational illustration explaining ${name} in the ${selectedArea}. Show ${visual}. Professional medical textbook illustration style. Neutral background. No text, no labels, no exposed body parts, no graphic content, no real patient.`;
}

export function fallbackAssessment({ mode, zone, symptoms, matchedConditions = [] }) {
  const conditionList = Array.isArray(matchedConditions)
    ? matchedConditions.filter((condition) => condition?.title || condition?.name || condition?.id)
    : [];
  const normalizedSymptoms = String(symptoms || '');
  const urgent = /(difficulty breathing|face swelling|swollen tongue|rapidly spreading|fever|severe pain)/i.test(normalizedSymptoms);
  const changing = /(changing|bleeding|spreading|itching|burning|painful|new|pus)/i.test(normalizedSymptoms);
  const area = mode === 'hair' ? 'hair and scalp' : mode === 'face' ? 'face' : 'body';
  const primaryMatches = conditionList.slice(0, 3);

  const conditions = primaryMatches.map((condition, index) => ({
    name: condition.title || condition.name || String(condition.id),
    likelihood: index === 0 ? 'high match' : 'medium match',
    why: 'This topic appeared in Aura\'s local educational matching, but only a professional examination can confirm the cause.',
  }));

  const matchSummary = conditions.length
    ? `The local educational matcher identified ${conditions.map((condition) => condition.name).join(', ')} as possible topics for this description.`
    : `The local educational matcher found no meaningful condition match for this ${area} concern.`;

  return {
    urgency: urgent ? 'Urgent' : changing ? 'Soon' : 'Routine',
    summary: `${matchSummary} Aura reviewed the concern described as: "${normalizedSymptoms}". This is an educational pre-check, not a diagnosis.`,
    conditions,
    homeCare: [
      'Use gentle, fragrance-free cleansing and avoid scrubbing.',
      'Avoid picking, squeezing, or using new harsh products.',
      'Use a plain fragrance-free moisturiser when the area feels dry.',
      'Protect exposed skin from strong sunlight.',
    ],
    treatments: [
      'A dermatologist can confirm the cause with a clinical examination.',
      'Suitable care depends on findings made by a qualified clinician.',
      'Do not use prescription treatment or assume a procedure is appropriate without professional advice.',
    ],
    redFlags: [
      'Seek urgent care for trouble breathing, facial swelling, or rapidly spreading redness.',
      'Arrange prompt care for severe pain, pus, fever, or rapidly worsening symptoms.',
      'Do not delay assessment for bleeding, ulceration, or a patch changing quickly.',
    ],
    imagePrompt: buildConditionImagePrompt(mode, zone, primaryMatches),
  };
}
