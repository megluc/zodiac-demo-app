// Centralized DOM element references.
// Safe to evaluate at module load time because type="module" scripts are
// deferred — the HTML is fully parsed before any module executes.

export const zodiacGrid    = document.getElementById("zodiacGrid");
export const horoscopeBox  = document.getElementById("horoscopeBox");
export const bigThreeBox   = document.getElementById("bigThreeBox");
export const compatBox     = document.getElementById("compatBox");

export const searchInput   = document.getElementById("searchInput");
export const monthInput    = document.getElementById("monthInput");
export const dayInput      = document.getElementById("dayInput");
export const hourInput     = document.getElementById("hourInput");

export const sign1Select   = document.getElementById("sign1Select");
export const sign2Select   = document.getElementById("sign2Select");

export const bigThreeBtn   = document.getElementById("bigThreeBtn");
export const compatBtn     = document.getElementById("compatBtn");
