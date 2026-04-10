import {
  zodiacSigns,
  horoscopeData,
  compatibilityData,
  moonSigns,
  risingSigns,
} from "./data.js";
import { state } from "./state.js";

// ---------------------------------------------------------------------------
// Resilience pattern 1: stale-request cancellation.
// A module-level reference to the AbortController for any in-flight load.
// A new call to loadAppData() aborts the previous one before starting.
// ---------------------------------------------------------------------------
let currentController = null;

const REQUIRED_HOROSCOPE_FIELDS = ["reading", "mood", "color", "number", "moon"];
const TIMEOUT_MS = 8000;

/**
 * Loads application data into `state`.
 *
 * Resilience patterns implemented:
 *   1. AbortController timeout (8 s) — aborts with reason "timeout".
 *   2. Stale-request cancellation   — aborts the previous in-flight call with
 *                                     reason "stale" before starting a new one.
 *   3. Structured error messages    — distinct messages for timeout, stale,
 *                                     network, parse, and validation failures.
 *   4. Data validation              — every horoscopeData entry must have all
 *                                     five required fields before state is updated.
 */
export async function loadAppData() {
  // --- Pattern 2: cancel any previous in-flight request ---
  if (currentController) {
    currentController.abort("stale");
  }

  const controller = new AbortController();
  currentController = controller;

  // --- Pattern 1: 8-second hard timeout ---
  const timeoutId = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);

  state.loadStatus = "loading";
  state.errorMessage = "";

  try {
    const data = await _fetchLocal(controller.signal);

    // --- Pattern 4: validate before touching state ---
    _validateHoroscopeData(data.horoscopeData);

    state.zodiacSigns       = data.zodiacSigns;
    state.horoscopeData     = data.horoscopeData;
    state.compatibilityData = data.compatibilityData;
    state.moonSigns         = data.moonSigns;
    state.risingSigns       = data.risingSigns;
    state.loadStatus        = "success";

  } catch (err) {
    // --- Pattern 3: structured error messages ---
    state.loadStatus = "error";

    if (err.name === "AbortError") {
      const reason = controller.signal.reason;
      if (reason === "timeout") {
        state.errorMessage = `Request timed out after ${TIMEOUT_MS / 1000} seconds.`;
      } else if (reason === "stale") {
        state.errorMessage = "Request was superseded by a newer load.";
      } else {
        state.errorMessage = "Request was aborted.";
      }
    } else if (err.name === "ValidationError") {
      state.errorMessage = err.message;
    } else if (err instanceof SyntaxError) {
      state.errorMessage = "Failed to parse data: unexpected format.";
    } else if (err instanceof TypeError) {
      state.errorMessage = "Network error: could not reach the data source.";
    } else {
      state.errorMessage = `Unexpected error: ${err.message}`;
    }
  } finally {
    clearTimeout(timeoutId);
    if (currentController === controller) {
      currentController = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Simulates an async data fetch by resolving on the next event-loop tick
 * (a short setTimeout). Honours the AbortSignal so stale/timed-out calls
 * are rejected immediately rather than continuing to occupy resources.
 *
 * @param {AbortSignal} signal
 * @returns {Promise<{zodiacSigns, horoscopeData, compatibilityData, moonSigns, risingSigns}>}
 */
function _fetchLocal(signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timerId = setTimeout(() => {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
      } else {
        resolve({ zodiacSigns, horoscopeData, compatibilityData, moonSigns, risingSigns });
      }
    }, 50);

    // If the signal fires while we are waiting, cancel the timer immediately.
    signal.addEventListener("abort", () => {
      clearTimeout(timerId);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

/**
 * Throws a ValidationError if any horoscopeData entry is missing a required field.
 * @param {object} data
 */
function _validateHoroscopeData(data) {
  for (const [sign, entry] of Object.entries(data)) {
    for (const field of REQUIRED_HOROSCOPE_FIELDS) {
      if (!(field in entry)) {
        const err = new Error(
          `Validation error: horoscope entry for "${sign}" is missing required field "${field}".`
        );
        err.name = "ValidationError";
        throw err;
      }
    }
  }
}
