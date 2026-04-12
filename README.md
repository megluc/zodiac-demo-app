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

## UI States 

The application implements all four required UI states:

- **Loading**  
  When `state.loadStatus === "loading"`, the app displays a loading message in the grid area while data is being fetched.

- **Error**  
  When `state.loadStatus === "error"`, a user-friendly error message is displayed along with a **Retry button** that re-triggers the data load without refreshing the page.

- **Empty**  
  When no zodiac signs match the search query, a message is displayed:
  "No signs match your search."

- **Success**  
  When data loads successfully, the zodiac grid and horoscope data are rendered.

  ## Resilience Patterns 

Implemented in `api.js`:

- **Timeout (AbortController)**  
  Automatically cancels requests after 8 seconds

- **Stale-request cancellation**  
  Previous in-flight requests are aborted when a new request starts

- **Structured error messages**  
  Different messages for:
  - timeout
  - stale requests
  - network errors
  - parse errors
  - validation errors

- **Data validation**  
  Ensures all horoscope entries contain required fields before updating state

  

  
