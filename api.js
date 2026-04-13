import { state } from "./state.js";

// ---------------------------------------------------------------------------
// Resilience pattern 1: stale-request cancellation.
// A module-level reference to the AbortController for any in-flight load.
// A new call to loadAppData() aborts the previous one before starting.
// ---------------------------------------------------------------------------
let currentController = null;

const REQUIRED_HOROSCOPE_FIELDS = ["reading", "mood", "color", "number", "moon"];
const TIMEOUT_MS = 8000;
const DATA_URL = "./data.json";

/**
 * Loads application data into `state`.
 *
 * Resilience patterns implemented:
 *   1. AbortController timeout (8 s) — aborts with reason "timeout".
 *   2. Stale-request cancellation   — aborts the previous in-flight call with
 *                                     reason "stale" before starting a new one.
 *   3. Structured error messages    — distinct messages for timeout, stale,
 *                                     network, HTTP, parse, and validation failures.
 *   4. Data validation              — validates both the top-level shape and
 *                                     each horoscope entry before state updates.
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
    // --- Real fetch from local JSON file ---
    const response = await fetch(DATA_URL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // --- Pattern 4: validate before touching state ---
    _validateAppData(data);
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
    } else if (err.message?.startsWith("HTTP")) {
      state.errorMessage = `Server error: ${err.message}`;
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
 * Validates the top-level JSON structure.
 * Throws a ValidationError if any required top-level field is missing.
 *
 * @param {object} data
 */
function _validateAppData(data) {
  const requiredTopLevelFields = [
    "zodiacSigns",
    "horoscopeData",
    "compatibilityData",
    "moonSigns",
    "risingSigns",
  ];

  for (const field of requiredTopLevelFields) {
    if (!(field in data)) {
      const err = new Error(
        `Validation error: missing top-level field "${field}".`
      );
      err.name = "ValidationError";
      throw err;
    }
  }
}

/**
 * Throws a ValidationError if any horoscopeData entry is missing a required field.
 *
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