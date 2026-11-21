// Seeded pseudo-random numbers for Twin Tides.
// Every scene is drawn from a fixed seed, so the same seed always draws the
// same scene and the same differences. No unseeded Math.random() is used
// anywhere in scene generation, which keeps the game fully deterministic.

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRange(random, min, max) {
  return min + random() * (max - min);
}

export function seededPick(random, items) {
  return items[Math.floor(random() * items.length)];
}

export function seededShuffle(random, items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}
