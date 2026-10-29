import rules from '../data/rules.json';
import { conditions } from '../data/conditions.json';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Matches the keyword at the start of a word (so "pimple" matches "pimples").
const hasWord = (text, keyword) =>
  new RegExp(`(^|[^a-z])${escapeRegExp(keyword)}`, 'i').test(text);

/**
 * Educational matcher: maps what the person typed / ticked + the body area
 * to topics in the condition library. It never produces a diagnosis or a
 * probability. All weights live in src/data/rules.json.
 */
export function analyze({ mode, regionId, text = '', symptoms = [] }) {
  const lower = text.toLowerCase();

  const scored = (rules[mode] || [])
    .map((rule) => {
      let signal = 0;
      for (const [keyword, weight] of Object.entries(rule.keywords || {})) {
        if (hasWord(lower, keyword)) signal += weight;
      }
      for (const key of symptoms) signal += rule.symptoms?.[key] || 0;
      // The area only boosts a topic when the person's words/symptoms already point to it.
      const total = signal > 0 ? signal + (rule.regions?.[regionId] || 0) : 0;
      return { id: rule.id, total };
    })
    .filter((r) => r.total >= 2)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Show in library order so the list does not imply a likelihood ranking.
  const order = conditions.map((c) => c.id);
  const matches = scored
    .map((s) => s.id)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((id) => {
      const c = conditions.find((x) => x.id === id);
      return { id, title: c.title, what: c.details.what, when: c.details.when };
    });

  const urgentSymptoms = (rules.urgent.symptoms[mode] || []).filter((k) => symptoms.includes(k));
  const urgentWords = rules.urgent.keywords.filter((k) => hasWord(lower, k));

  return { matches, urgent: urgentSymptoms.length > 0 || urgentWords.length > 0 };
}
