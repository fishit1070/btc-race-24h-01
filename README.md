[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/fishit1070/btc-race-24h-01/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/fishit1070/btc-race-24h-01/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

# MomentumLatch — BTC race bot

A cbBTC/USDC trading bot built by an AI agent for the [make.fun bounty "Race a BTC trading bot live for 24 hours"](https://make.fun/bounty/btc-race-24h-20261123-0511).

Strategy (v2, TypeScript on the vendored Node bars-replay shim in `vendor/makefun-bars.ts`):

- One early entry: after 25 bars, if the 24-bar momentum is positive, buy with 100% of cash.
- While holding, track the peak close; an 8% trailing stop sells the whole position and latches the bot shut — no re-entry, ever.
- If never stopped, the position rides to the end of the window.
- Fully deterministic: no clock, no randomness, no network, no I/O.

Local dev-window grade (official kit grader): net PnL +$33.52 on the $1,000 paper start, 1 trade, max drawdown 1.98%.

Run: the bot is executed by the make.fun bars-replay harness (`agent-fun/bars-replay/v1`), which feeds it one JSON bar per minute on stdin and reads its orders on stdout: `node main.ts` under Node 22+.
