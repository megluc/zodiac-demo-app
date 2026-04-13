// Application state. No DOM references allowed in this file.

export const state = {
  /** @type {Array<[string, [number,number], [number,number]]>} */
  zodiacSigns: [],

  /** @type {Record<string, {reading:string, mood:string, color:string, number:number, moon:string}>} */
  horoscopeData: {},

  /** @type {Record<string, {love:number, friendship:number, communication:number, love_text:string, friendship_text:string, communication_text:string}>} */
  compatibilityData: {},

  /** @type {string[]} */
  moonSigns: [],

  /** @type {string[]} */
  risingSigns: [],

  /** @type {"idle"|"loading"|"error"|"success"} */
  loadStatus: "idle",

  /** @type {string} */
  errorMessage: "",

  /** @type {string} */
  query: "",

  /** @type {string|null} */
  selectedSign: null,

  /** @type {Set<string>} */
  favorites: new Set(),

  showFavorites: false,
};

// ---------------------------------------------------------------------------
// Selectors — pure functions that derive data from state; no side effects.
// ---------------------------------------------------------------------------

/** Signs whose names include the current search query (case-insensitive). */
export function getFilteredSigns() {
  if (state.showFavorites) {
    return getFavoritedSigns();
  }

  const q = state.query.toLowerCase();

  return state.zodiacSigns.filter(([sign]) =>
    sign.toLowerCase().includes(q)
  );
}

/** Signs the user has marked as favorites, in zodiac order. */
export function getFavoritedSigns() {
  return state.zodiacSigns
    .map(([sign]) => sign)
    .filter((sign) => state.favorites.has(sign));
}

/** Horoscope entry for the currently selected sign, or null. */
export function getSelectedHoroscope() {
  if (!state.selectedSign) return null;
  return state.horoscopeData[state.selectedSign] ?? null;
}

/**
 * Compatibility entry for two signs. Checks both key orders before
 * falling back to the default entry.
 * @param {string} sign1
 * @param {string} sign2
 */
export function getCompatibility(sign1, sign2) {
  const key     = `${sign1}-${sign2}`;
  const reverse = `${sign2}-${sign1}`;
  return (
    state.compatibilityData[key] ??
    state.compatibilityData[reverse] ??
    state.compatibilityData.default ??
    null
  );
}

/**
 * Derives Sun, Moon, and Rising signs from a birth month, day, and hour.
 * Matches the algorithm from the original inline script.
 * @param {number} month  1–12
 * @param {number} day    1–31
 * @param {number} hour   0–23
 * @returns {{ sun: string, moon: string, rising: string }}
 */
export function getBigThree(month, day, hour) {
  let sun = "Unknown";

  for (const [sign, start, end] of state.zodiacSigns) {
    const [sm, sd] = start;
    const [em, ed] = end;

    if (sm === em) {
      if (month === sm && day >= sd && day <= ed) sun = sign;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) sun = sign;
    }
  }

  const moon   = state.moonSigns[(month + day) % 12];
  const rising = state.risingSigns[(Math.floor(hour / 2) + month + day) % 12];

  return { sun, moon, rising };
}
