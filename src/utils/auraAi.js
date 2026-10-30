export async function assessWithAura(input) {
  const response = await fetch('/api/ai/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Aura assessment failed.');
  return data;
}

export async function generateAuraImage(prompt) {
  const response = await fetch('/api/ai/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Aura image generation failed.');
  return data.url;
}
