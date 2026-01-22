type Phone = {
  id: string;
  brand: string;
  model: string;
  os: string;
  priceNew: number;
  priceUsed: number;
  screenSize: number;
  traits: Record<string, number>;
};

type Weights = Record<string, number>;

export function scorePhone(phone: Phone, weights: Weights): number {
  let score = 0;
  Object.keys(weights).forEach((cat) => {
    const traitValue = phone.traits[cat] || 0;
    score += traitValue * weights[cat];
  });
  return Math.round(score / 10);
}
