# Hyperliquid Trading Bot - Critical Bugs Fixed

This repository contains **sample code** from a complete Hyperliquid trading bot system with all critical bugs fixed.

## ⚠️ Problems This Solves

### 1. Position Sizing Bug (Account Killer)
- **Problem**: Most bots calculate positions 100x larger than intended
- **Result**: $10 risk becomes $2,000 position with 200x leverage
- **Fix**: Proper formula in `risk.js` lines 25-45

### 2. Overtrading Bug (Death by 1000 Cuts)
- **Problem**: Infinite loops causing 38 trades in 48 minutes
- **Result**: Account death by overtrading
- **Fix**: Position limits and conflict prevention

### 3. Circuit Breaker Missing
- **Problem**: No protection from losing streaks
- **Result**: Catastrophic drawdowns
- **Fix**: Automatic stop after 3 consecutive losses

### 4. Stop Loss Issues
- **Problem**: 0.5% stops hit by normal market noise
- **Result**: Constant false exits
- **Fix**: 0.8% stops with volatility adjustment

## 📁 Sample Code Included

- `risk.js` - Fixed position sizing and circuit breaker
- `config.js` - Proper configuration settings
- `strategy.js` - RSI + EMA implementation with trend filter

## 💡 Key Fixes Demonstrated

```javascript
// FIXED: Position sizing that won't blow up accounts
const maxPositionNotional = riskAmount / config.stopLossPct;
const size = maxPositionNotional / price;
const marginRequired = maxPositionNotional / config.leverage;

// FIXED: Circuit breaker system
if (dailyState.consecutiveLosses >= 3) {
    dailyState.coolingDown = true;
    logger.warn('Circuit breaker activated');
}
