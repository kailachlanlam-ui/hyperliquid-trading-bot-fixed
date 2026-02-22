const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const config = {
  walletAddress: process.env.WALLET_ADDRESS,
  privateKey: process.env.PRIVATE_KEY,
  sandbox: process.env.TESTNET !== 'false',
  pairs: ['BTC/USDC:USDC', 'ETH/USDC:USDC', 'SOL/USDC:USDC'],
  leverage: parseInt(process.env.LEVERAGE) || 10,
  maxRiskPerTrade: 0.02,
  dailyMaxLoss: 0.05,
  stopLossPct: 0.008,
  takeProfitPct: 0.016,
  maxHoldMs: 24 * 60 * 60 * 1000,
  emaFast: 21,
  emaSlow: 50,
  rsiPeriod: 14,
  rsiBuyMax: 45,
  rsiBuyIdeal: 30,
  rsiSellMin: 55,
  rsiSellIdeal: 70,
  volumeMultiplier: 1.2,
  volumePeriod: 20,
  timeframe: '5m',
  candleLimit: 100,
  loopIntervalMs: 2 * 60 * 1000,      // every 2 min (was 1)
  monitorIntervalMs: 2 * 60 * 1000,   // every 2 min (was 30s)
  dryRun: true, // FORCED DRY RUN - critical fixes applied
  closeOnShutdown: process.env.CLOSE_ON_SHUTDOWN !== 'false',
  logDir: path.resolve(__dirname, 'logs'),
  maxRetries: 3,
  retryBaseMs: 3000,    // longer backoff (was 2000)
  slippagePct: 0.005,
};

module.exports = config;