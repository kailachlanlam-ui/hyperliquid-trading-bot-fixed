const config = require('./config');

function calcEMA(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) ema = values[i] * k + ema * (1 - k);
  return ema;
}

function calcPrevEMA(values, period) {
  if (values.length < period + 1) return null;
  return calcEMA(values.slice(0, -1), period);
}

function calcRSI(closes, period) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

function volumeAboveAvg(volumes, period, multiplier) {
  if (volumes.length < period + 1) return false;
  const recent = volumes.slice(-period - 1, -1);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  return volumes[volumes.length - 1] > avg * multiplier;
}

function analyze(candles) {
  const closes = candles.map(c => c[4]);
  const volumes = candles.map(c => c[5]);
  const emaFast = calcEMA(closes, config.emaFast);
  const emaSlow = calcEMA(closes, config.emaSlow);
  const prevEmaFast = calcPrevEMA(closes, config.emaFast);
  const prevEmaSlow = calcPrevEMA(closes, config.emaSlow);
  const rsi = calcRSI(closes, config.rsiPeriod);
  const volOk = volumeAboveAvg(volumes, config.volumePeriod, config.volumeMultiplier);
  const indicators = { emaFast, emaSlow, prevEmaFast, prevEmaSlow, rsi, volOk, price: closes[closes.length - 1] };

  if (!emaFast || !emaSlow || !prevEmaFast || !prevEmaSlow || rsi === null)
    return { signal: null, reason: 'Insufficient data', indicators };

  const bullishCross = prevEmaFast <= prevEmaSlow && emaFast > emaSlow;
  const bearishCross = prevEmaFast >= prevEmaSlow && emaFast < emaSlow;
  const emaUptrend = emaFast > emaSlow;
  const emaDowntrend = emaFast < emaSlow;

  // --- SCALP ENTRY SIGNALS ---
  // Method 1: EMA crossover (strong signal)
  if (bullishCross && rsi < config.rsiBuyMax) {
    return { signal: 'long', reason: `EMA cross up + RSI=${rsi.toFixed(1)}`, indicators };
  }
  if (bearishCross && rsi > config.rsiSellMin) {
    return { signal: 'short', reason: `EMA cross down + RSI=${rsi.toFixed(1)}`, indicators };
  }

  // Method 2: RSI extremes with trend confirmation (more frequent entries)
  if (rsi < config.rsiBuyIdeal && emaUptrend && volOk) {
    return { signal: 'long', reason: `RSI oversold ${rsi.toFixed(1)} + uptrend + vol`, indicators };
  }
  if (rsi > config.rsiSellIdeal && emaDowntrend && volOk) {
    return { signal: 'short', reason: `RSI overbought ${rsi.toFixed(1)} + downtrend + vol`, indicators };
  }

  // Method 3: RSI bounce in trend (most frequent)
  if (rsi < 40 && emaUptrend) {
    return { signal: 'long', reason: `RSI dip ${rsi.toFixed(1)} in uptrend`, indicators };
  }
  if (rsi > 60 && emaDowntrend) {
    return { signal: 'short', reason: `RSI spike ${rsi.toFixed(1)} in downtrend`, indicators };
  }

  // --- EXIT SIGNALS ---
  if (emaDowntrend && rsi > 60) {
    return { signal: 'close_long', reason: `Trend fading, RSI=${rsi.toFixed(1)}`, indicators };
  }
  if (emaUptrend && rsi < 40) {
    return { signal: 'close_short', reason: `Trend reversing, RSI=${rsi.toFixed(1)}`, indicators };
  }

  return { signal: null, reason: 'No signal', indicators };
}

module.exports = { analyze, calcEMA, calcRSI, volumeAboveAvg };