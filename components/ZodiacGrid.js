// Component: ZodiacGrid
// Input: { signs, favorites, onSelectSign, onToggleFavorite }
// Output: DOM nodes mounted inside `container`
// Events: onSelectSign(sign) — called when user clicks a sign card
//         onToggleFavorite(sign) — called when user clicks the heart
// Dependencies: none

/**
 * Mounts (or replaces) a grid of zodiac sign cards inside `container`.
 *
 * @param {HTMLElement} container
 * @param {{
 *   signs: Array<[string, [number,number], [number,number]]>,
 *   favorites: Set<string>,
 *   onSelectSign: (sign: string) => void,
 *   onToggleFavorite: (sign: string) => void,
 * }} props
 */
export function mountZodiacGrid(container, { signs, favorites, onSelectSign, onToggleFavorite }) {
  const cards = signs.map(([sign]) => {
    const card = document.createElement("div");
    card.className = "card";

    const btn = document.createElement("button");
    btn.textContent = sign;
    btn.addEventListener("click", () => onSelectSign(sign));

    const isFav = favorites.has(sign);
    const heart = document.createElement("div");
    heart.className = isFav ? "heart favorited" : "heart";
    heart.textContent = isFav ? "♥" : "♡";
    heart.addEventListener("click", () => onToggleFavorite(sign));

    card.appendChild(btn);
    card.appendChild(heart);
    return card;
  });

  container.replaceChildren(...cards);
}
