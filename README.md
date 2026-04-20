# Horoscope Dashboard

A client-side horoscope dashboard built with vanilla JavaScript ES modules. Features a zodiac sign grid, daily horoscope display, Big Three generator, compatibility checker, favorites toggling with persistence, and sign search.

## How to Run

```
python3 -m http.server 4040
```

Open: http://localhost:4040

## Module Map

| File | Responsibility |
|---|---|
| `data.json` | All app data — zodiac sign date ranges, horoscope entries, compatibility pairs, moon/rising sign arrays |
| `dom.js` | Centralized DOM element references |
| `state.js` | Single state object and pure selector functions |
| `api.js` | Async data loading with resilience patterns |
| `render.js` | Orchestrates all DOM updates |
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

## UI States

- **Loading** — spinner message shown in grid while `data.json` is being fetched
- **Error** — user-friendly error message with a Retry button that re-triggers the load without a page refresh
- **Empty** — "No signs match…" message when search returns zero results
- **Success** — zodiac grid, horoscope box, and all controls rendered

## Features

- Zodiac sign grid with live search filtering
- Daily horoscope display (reading, mood, lucky color, lucky number, moon phase)
- Favorites toggling with heart icons — persisted to `localStorage` across page refreshes
- Big Three generator (Sun sign by date range; Moon and Rising are approximate)
- Compatibility checker with individual scores for all 66 sign pairs (love, friendship, communication)

## Resilience Patterns (api.js)

- **Timeout** — requests are automatically cancelled after 8 seconds via `AbortController`
- **Stale-request cancellation** — a new load aborts any previous in-flight request
- **Structured error messages** — distinct messages for timeout, stale, network, HTTP, parse, and validation failures
- **Data validation** — top-level JSON shape and all horoscope entries are validated before state is updated

## Testing Summary

- Total structured test cases: 14
- Categories covered: success, edge, and failure
- Features covered: zodiac grid / horoscope, Big Three generator, compatibility checker, favorites, search/filter, responsive layout
- Bugs fixed: 5
- Pass rate: update this after your final re-run

**all 14 test cases now pass after the fixes**
**Pass rate: 14/14 (100%)**

## Known Issues / Limitations

- Moon and Rising sign calculations are approximate and simplified for this project
- Compatibility data is based on static local JSON rather than a live service
- The project is fully client-side and depends on local data files

## Deployed URL

[!!!paste URL here]