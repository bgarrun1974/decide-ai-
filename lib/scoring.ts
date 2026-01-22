// lib/scoring.ts
export function scorePhone(phone, weights) {
  let score = 0;
  Object.keys(weights).forEach(cat => {
    score += phone.traits[cat] * weights[cat];
  });
  return Math.round(score / 10);
}
