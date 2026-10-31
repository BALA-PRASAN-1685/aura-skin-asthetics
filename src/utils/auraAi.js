const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:4174';

export async function assessWithAura(input) {
  const response = await fetch(`${API_BASE}/api/ai/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Aura assessment failed.');
  }

  return data;
}

export async function generateAuraImage(prompt) {
  const response = await fetch(`${API_BASE}/api/ai/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Aura image generation failed.');
  }

  return data.url;
}

const libraryImageCache = new Map();

export function buildLibraryImagePrompt(condition) {
  const skinOrScalp = /hair|scalp|alopecia|dandruff|telogen|tinea|breakage/i.test(
    `${condition.id} ${condition.title} ${condition.keywords}`,
  )
    ? 'hair and scalp educational illustration'
    : 'skin educational illustration';

  return [
    `Create a clean, non-graphic ${skinOrScalp} for the educational condition guide titled "${condition.title}".`,
    `Visual focus: ${condition.details.notice}`,
    'Use a neutral medical textbook style with simplified features and appearance variations shown respectfully.',
    'Do not show diagnosis labels, prescription products, real patients, wounds, exposed bodies, graphic symptoms, text, or labels.',
    'Use a calm neutral background and make the illustration clearly specific to this condition guide without making a diagnostic claim.',
  ].join(' ');
}

export async function generateLibraryConditionImage(condition) {
  if (!condition?.id || !condition?.title) return null;

  if (libraryImageCache.has(condition.id)) {
    return libraryImageCache.get(condition.id);
  }

  const imageUrl = await generateAuraImage(
    buildLibraryImagePrompt(condition)
  );

  libraryImageCache.set(condition.id, imageUrl);

  return imageUrl;
}