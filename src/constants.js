export const TAX_RATE = 0.13;

// Shipping zones
const KATHMANDU_CORE = ['Kathmandu'];
const VALLEY_NEARBY = ['Lalitpur', 'Bhaktapur'];

export function getShipping(city) {
  if (!city) return 150;
  const c = city.trim();
  if (KATHMANDU_CORE.includes(c)) return 80;
  if (VALLEY_NEARBY.includes(c)) return 100;
  return 150;
}

// Default fallback (used where city isn't known yet)
export const SHIPPING = 80;
