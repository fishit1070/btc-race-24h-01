// BTC race bot v2: one confirmed-trend entry, protected by a wide trailing stop.
//
// The bot watches the close of every batch and waits for a 24-bar momentum
// reading strictly above zero after at least 25 closes. On that first
// confirmation it spends all of its cash in a single buy and never buys
// again. While holding, it tracks the highest close since entry; if the
// close falls more than 8% below that peak it sells everything and latches
// shut, placing no further orders for the rest of the race.
//
// Deterministic: no clock, no environment, no randomness, no I/O of its own.
// The wire protocol lives in vendor/makefun-bars.ts.

import { runBars } from './vendor/makefun-bars.ts';
import type { BarsState, Batch, OrderInput } from './vendor/makefun-bars.ts';

const MOMENTUM_LOOKBACK = 24;
const MIN_CLOSES = 25;
const STOP_FRACTION = 0.08;
const MAX_SLIPPAGE_BPS = 100;
const FALLBACK_SYMBOL = 'CBBTC';

const priceHistory: number[] = [];
let entryPeak: number | null = null;
let buySpent = false;
let latchedShut = false;

function pickSymbol(state: BarsState, batch: Batch): string {
  const fromBatch = batch.bars.find((bar) => bar.symbol);
  if (fromBatch) return fromBatch.symbol;
  const known = state.latest.keys().next();
  if (!known.done) return known.value;
  const listed = state.symbols.keys().next();
  if (!listed.done) return listed.value;
  return FALLBACK_SYMBOL;
}

function onBatch(state: BarsState, batch: Batch): OrderInput[] {
  if (latchedShut) return [];

  const symbol = pickSymbol(state, batch);
  const rawClose = state.close(symbol);
  if (rawClose === null) return [];
  const close = Number(rawClose);
  priceHistory.push(close);

  const position = state.positions.get(symbol);
  const holdingNow = position !== undefined && position.qty > 0n;

  if (holdingNow && position !== undefined) {
    entryPeak = entryPeak === null ? close : Math.max(entryPeak, close);
    if (close < entryPeak * (1.0 - STOP_FRACTION)) {
      latchedShut = true;
      return [
        {
          side: 'sell',
          symbol,
          qty: position.qty,
          max_slippage_bps: MAX_SLIPPAGE_BPS,
        },
      ];
    }
    return [];
  }

  entryPeak = null;

  if (buySpent) return [];
  if (state.warmingUp) return [];
  if (priceHistory.length < MIN_CLOSES) return [];

  const past = priceHistory[priceHistory.length - 1 - MOMENTUM_LOOKBACK];
  const momentum = close / past - 1.0;
  if (momentum <= 0) return [];

  if (state.cash <= 0n) return [];
  buySpent = true;
  return [
    {
      side: 'buy',
      symbol,
      notional_quote_units: state.cash,
      max_slippage_bps: MAX_SLIPPAGE_BPS,
    },
  ];
}

await runBars({ onBatch });
