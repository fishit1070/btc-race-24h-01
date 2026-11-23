# BTC race bot v2

Implemented in TypeScript (main.ts) on the vendored Node bars-replay shim in vendor/makefun-bars.ts.

One-shot momentum bot for the single traded symbol: after at least 25 closes, the first strictly positive 24-bar momentum reading triggers a single entry at full size (100% of cash).
While holding, it tracks the highest close since entry and sells the entire position if the close falls more than 8% below that peak (trailing stop); after that exit — or after the one buy has been used — it never trades again (no re-entry).
