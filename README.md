# Horoscope Dashboard

A client-side horoscope dashboard built with vanilla JavaScript ES modules. Features a zodiac sign grid, daily horoscope display, Big Three generator, compatibility checker, and favorite toggling.

## How to Run

```
python3 -m http.server 4040
```

Open: http://localhost:4040


## Module Map

| File | Responsibility |
|---|---|
| `data.js` | Exported data constants (zodiac signs, horoscope data, compatibility data, moon/rising sign arrays) |
| `dom.js` | Centralized element references |
| `state.js` | Single state object and selector functions |
| `api.js` | Async data loading with resilience patterns |
| `render.js` | Orchestrates all DOM updates using selectors |
| `main.js` | Bootstraps app, wires event listeners |
| `components/ZodiacGrid.js` | Self-contained zodiac grid component |

## Component Contracts

```js
// Component: ZodiacGrid
// Input: { signs, favorites, onSelectSign, onToggleFavorite }
// Output: DOM nodes mounted inside `container`
// Events: onSelectSign(sign) — called when user clicks a sign card
//         onToggleFavorite(sign) — called when user clicks the heart
// Dependencies: none
```

## Resilience Patterns

Implemented in `api.js`:

1. **AbortController timeout** — cancels fetch after 8 seconds
2. **Stale-request cancellation** — aborts previous in-flight request when a new load starts
3. **Structured error messages** — distinct messages for timeout, stale, network, parse, and validation errors
4. **Data validation** — validates all horoscope entries have required fields before updating state

## Current Feature Status

**Working:**
- Zodiac sign grid with search filtering
- Daily horoscope display
- Favorite toggling (heart icon on each card)
- Big Three generator (sun sign is accurate, moon and rising use a simplified formula)
- Compatibility checker
- All four UI states (loading, error, empty, success)

**Needs improvement:**
- No filter-by-favorites button yet — the toggle works but there is no way to view only favorited signs
- Compatibility data only has a default entry — all sign combinations return the same scores, needs real pairings added to `compatibilityData` in `data.js`
- Big Three moon and rising calculations are simplified can add labels on input spaces so users know what form to enter as well as errors so you cant enter anything other than proper digit format 
