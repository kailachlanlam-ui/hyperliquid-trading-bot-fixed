const config = require('./config');
const logger = require('./logger');

let dailyState = { 
  date: new Date().toISOString().slice(0, 10), 
  startEquity: null, 
  totalPnL: 0, 
  stopped: false,
  consecutiveLosses: 0,
  lastLossTime: null,
  coolingDown: false
};

function checkNewDay(equity) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dailyState.date) {
    logger.info(`New trading day: ${today}. Resetting daily P&L and circuit breaker.`);
    dailyState = { 
      date: today, 
      startEquity: equity, 
      totalPnL: 0, 
      stopped: false,
      consecutiveLosses: 0,
      lastLossTime: null,
      coolingDown: false
    };
  }
  if (dailyState.startEquity === null) dailyState.startEquity = equity;
}

function recordPnL(pnl, equity) {
  dailyState.totalPnL += pnl;
  
  // Track consecutive losses for circuit breaker
  if (pnl > 0) {
    dailyState.consecutiveLosses = 0; // Reset on win
    dailyState.coolingDown = false;
  } else {
    dailyState.consecutiveLosses++;
    dailyState.lastLossTime = Date.now();
    
    // Trigger cooldown after 3 consecutive losses
    if (dailyState.consecutiveLosses >= 3) {
      logger.warn(`${dailyState.consecutiveLosses} consecutive losses. Entering 2-hour cooldown.`);
      dailyState.coolingDown = true;
    }
  }
  
  logger.logDailyPnL(dailyState.totalPnL, equity);
  if (dailyState.startEquity && dailyState.totalPnL <= -(dailyState.startEquity * config.dailyMaxLoss)) {
    logger.warn(`Daily max loss reached: ${dailyState.totalPnL.toFixed(2)}. Stopping.`);
    dailyState.stopped = true;
  }
}

function canTrade() { 
  // Check daily stop
  if (dailyState.stopped) return false;
  
  // Check cooldown period (2 hours after consecutive losses)
  if (dailyState.coolingDown && dailyState.lastLossTime) {
    const timeSinceLoss = Date.now() - dailyState.lastLossTime;
    const cooldownPeriod = 2 * 60 * 60 * 1000; // 2 hours
    
    if (timeSinceLoss < cooldownPeriod) {
      const remainingMs = cooldownPeriod - timeSinceLoss;
      const remainingMin = Math.ceil(remainingMs / (60 * 1000));
      
      // Log cooldown status every 30 minutes
      if (remainingMin % 30 === 0) {
        logger.info(`Circuit breaker active: ${remainingMin} minutes remaining`);
      }
      return false;
    } else {
      // Cooldown period over
      logger.info('Circuit breaker cooldown ended. Resuming trading.');
      dailyState.coolingDown = false;
    }
  }
  
  return true; 
}

function calcPositionSize(equity, price) {
  const riskAmount = equity * config.maxRiskPerTrade; // $500 * 0.02 = $10
  
  // FIXED FORMULA: What position will risk exactly $10 at the stop?
  const maxPositionNotional = riskAmount / config.stopLossPct; // $10 / 0.008 = $1,250
  const size = maxPositionNotional / price; // $1,250 / $67,000 = 0.0187 BTC
  const marginRequired = maxPositionNotional / config.leverage; // $1,250 / 10 = $125
  
  // Validation - don't use more than 80% of equity as margin
  if (marginRequired > equity * 0.8) {
    logger.warn(`Position too large: margin=${marginRequired.toFixed(2)}, equity=${equity.toFixed(2)}. Reducing.`);
    const maxMargin = equity * 0.8;
    const adjustedNotional = maxMargin * config.leverage;
    const adjustedSize = adjustedNotional / price;
    return {
      size: parseFloat(adjustedSize.toFixed(6)),
      marginRequired: parseFloat(maxMargin.toFixed(2))
    };
  }
  
  logger.info(`Position calc: equity=${equity.toFixed(2)}, risk=${riskAmount.toFixed(2)}, notional=${maxPositionNotional.toFixed(2)}, size=${size.toFixed(6)}, margin=${marginRequired.toFixed(2)}`);
  
  return {
    size: parseFloat(size.toFixed(6)),
    marginRequired: parseFloat(marginRequired.toFixed(2))
  };
}

function calcSLTP(price, side) {
  return side === 'buy'
    ? { stopLoss: price * (1 - config.stopLossPct), takeProfit: price * (1 + config.takeProfitPct) }
    : { stopLoss: price * (1 + config.stopLossPct), takeProfit: price * (1 - config.takeProfitPct) };
}

function isExpired(openTimestamp) { return (Date.now() - openTimestamp) > config.maxHoldMs; }

module.exports = { checkNewDay, recordPnL, canTrade, calcPositionSize, calcSLTP, isExpired, dailyState };