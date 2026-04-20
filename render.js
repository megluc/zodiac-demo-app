import { state, getFilteredSigns, getSelectedHoroscope } from "./state.js";
import * as dom from "./dom.js";
import { mountZodiacGrid } from "./components/ZodiacGrid.js";

// Persisted across calls so internal re-renders (e.g. favorite toggles) can
// produce a retry button without main.js having to pass the callback every time.
let _onRetry = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Re-renders the full UI based on the current value of `state.loadStatus`.
 * Handles four states: loading, error, empty (success + no matching signs),
 * and success.
 *
 * @param {{ onRetry?: () => void }} [options]
 */
export function renderApp({ onRetry } = {}) {
  if (onRetry != null) _onRetry = onRetry;

  switch (state.loadStatus) {
    case "loading":
      _renderLoading();
      return;

    case "error":
      _renderError();
      return;

    case "success": {
      const signs = getFilteredSigns();
      if (signs.length === 0) {
        _renderEmpty();
      } else {
        _mountGrid(signs);
      }
      _updateHoroscopeBox();
      _populateSelects();
      return;
    }

    // "idle" — leave the HTML placeholder text in place
    default:
      return;
  }
}

/**
 * Writes Big Three results into the bigThreeBox element.
 *
 * @param {{ sun: string, moon: string, rising: string }} result
 */
export function renderBigThree({ sun, moon, rising }) {
  dom.bigThreeBox.textContent =
    `Big Three Results\n\nSun Sign: ${sun}\nMoon Sign (approximate): ${moon}\nRising Sign (approximate): ${rising}\n\nChange the birth hour and generate again to see the rising sign update.`;
}

/**
 * Writes compatibility results into the compatBox element.
 *
 * @param {string} sign1
 * @param {string} sign2
 * @param {{ love: number, friendship: number, communication: number,
 *            love_text: string, friendship_text: string, communication_text: string }} data
 */
export function renderCompatibility(sign1, sign2, data) {
  dom.compatBox.textContent =
    `${sign1} + ${sign2}\n\nLove: ${data.love}%\n${data.love_text}\n\nFriendship: ${data.friendship}%\n${data.friendship_text}\n\nCommunication: ${data.communication}%\n${data.communication_text}`;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function _renderLoading() {
  const msg = document.createElement("p");
  msg.textContent = "Loading horoscope data…";
  msg.style.cssText = "text-align:center; color:#cbbcf6; padding:20px 0;";
  dom.zodiacGrid.replaceChildren(msg);
  dom.horoscopeBox.textContent = "";
}

function _renderError() {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "text-align:center; padding:20px 0;";

  const msg = document.createElement("p");
  msg.textContent = state.errorMessage || "An unknown error occurred.";
  msg.style.color = "#ff7ac6";

  wrapper.appendChild(msg);

  if (_onRetry) {
    const btn = document.createElement("button");
    btn.className = "pink-btn";
    btn.textContent = "Retry";
    btn.addEventListener("click", _onRetry);
    wrapper.appendChild(btn);
  }
  dom.zodiacGrid.replaceChildren(wrapper);
  dom.horoscopeBox.textContent = "";
}

function _renderEmpty() {
  const msg = document.createElement("p");
  const label = state.query ? `"${state.query}"` : "your search";
  msg.textContent = `No signs match ${label}. Try a different name.`;
  msg.style.cssText = "text-align:center; color:#cbbcf6; padding:20px 0;";
  dom.zodiacGrid.replaceChildren(msg);
}

/**
 * Mounts the grid and wires card callbacks.
 * Called both from renderApp (success state) and from the favorite-toggle
 * handler so that only the grid is re-painted on a heart click.
 *
 * @param {Array<[string, [number,number], [number,number]]>} signs
 */
function _mountGrid(signs) {
  mountZodiacGrid(dom.zodiacGrid, {
    signs,
    favorites: state.favorites,
    onSelectSign(sign) {
      state.selectedSign = sign;
      _updateHoroscopeBox();
    },
    onToggleFavorite(sign) {
  if (state.favorites.has(sign)) {
    state.favorites.delete(sign);
  } else {
    state.favorites.add(sign);
  }

  localStorage.setItem(
    "favorites",
    JSON.stringify([...state.favorites])
  );

  _mountGrid(getFilteredSigns());
},
  });
}

function _updateHoroscopeBox() {
  const data = getSelectedHoroscope();
  if (!data) {
    dom.horoscopeBox.textContent = "Select a zodiac sign to see today's horoscope.";
    return;
  }
  dom.horoscopeBox.textContent =
    `${state.selectedSign}\n\nReading: ${data.reading}\n\nMood: ${data.mood}\nLucky Color: ${data.color}\nLucky Number: ${data.number}\nMoon Phase: ${data.moon}`;
}

/**
 * Populates the compatibility dropdowns once.
 * Guarded so repeated renderApp calls don't reset the user's current selection.
 */
function _populateSelects() {
  if (dom.sign1Select.options.length > 0) return;

  const placeholder1 = document.createElement("option");
  placeholder1.value = "";
  placeholder1.textContent = "Select a sign";
  dom.sign1Select.appendChild(placeholder1);

  const placeholder2 = document.createElement("option");
  placeholder2.value = "";
  placeholder2.textContent = "Select a sign";
  dom.sign2Select.appendChild(placeholder2);

  for (const [sign] of state.zodiacSigns) {
    const opt1 = document.createElement("option");
    opt1.value = sign;
    opt1.textContent = sign;
    dom.sign1Select.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = sign;
    opt2.textContent = sign;
    dom.sign2Select.appendChild(opt2);
  }
}
