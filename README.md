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
```

## Full Version - cryptotradingsignals.gumroad.com/l/HyperBot

## 🌍 HyperClaw Bot - Deployment Kit
Automated crypto trading bot for Hyperliquid with local AI analysis

🚀 Quick Start
Automatic Setup (Linux/macOS)
chmod +x setup.sh
./setup.sh
Manual Setup (All Platforms)
1. Install Requirements:

Node.js 18+ (nodejs.org)
Ollama (ollama.ai)
2. Install AI Model:

ollama pull llama3:8b
3. Setup Bot:

cd bot/
npm install
cp .env.template .env
# Edit .env with your wallet details
4. Run Bot:

npm run dry    # Safe mode (recommended)
npm run live   # Real money (be careful!)
📋 Features
🧠 AI-Powered Trading
Dual-layer analysis: Technical indicators + local AI
Smart filtering: Only trades with 60%+ AI confidence
Pattern recognition: Sees beyond basic indicators
Local processing: Your data never leaves your machine
📊 Real-Time Console Dashboard
Live P&L, positions, and market signals
Risk management status
Recent trade history
No browser needed - pure terminal interface
⚙️ Advanced Strategy
EMA crossover + RSI momentum
Dynamic position sizing (2% max risk per trade)
Trend filters and volume confirmations
Frequency limits to prevent overtrading
Automatic stop-losses and take-profits
🛡️ Risk Management
Maximum 2% risk per trade
5% daily loss limit
6 position limit
Consecutive loss timeouts
24-hour position expiry
📁 Configuration
Essential Settings (.env file):
# Your Hyperliquid wallet
WALLET_ADDRESS=0xYourWalletAddress
PRIVATE_KEY=0xYourPrivateKey

# Safety settings
TESTNET=true        # Use testnet for safety
DRY_RUN=true       # No real money until ready

# Trading settings  
LEVERAGE=5         # 5x-10x recommended
MOCK_EQUITY=900    # Starting balance for calculations

# AI settings
AI_ENABLED=true           # Use AI analysis
AI_MIN_CONFIDENCE=0.6     # 60% minimum confidence
Trading Pairs:
BTC/USDC:USDC
ETH/USDC:USDC
SOL/USDC:USDC
🎯 Usage
Safe Testing:
npm run dry    # Dry run mode - no real trades
Live Trading:
npm run live   # Real money - 5 second confirmation
Console Dashboard:
The bot shows a real-time ASCII dashboard with:

📈 Current positions and P&L
📊 Market signals for each pair
🛡️ Risk management status
📝 Recent trade history
🔔 Live trade alerts
🚨 Security
Before Going Live:
✅ Test thoroughly in DRY RUN mode
✅ Start with TESTNET=true
✅ Use small amounts initially
✅ Monitor the bot actively
✅ Keep your private keys secure
Risk Warning:
Trading crypto is risky
Never risk more than you can lose
Monitor your bot regularly
Start small and scale gradually
🛠️ Troubleshooting
Bot won't start:
# Check Node.js version (18+ required)
node --version

# Check Ollama is running
curl http://localhost:11434/api/tags

# Check dependencies
npm install
API errors:
Verify wallet address and private key
Check if Hyperliquid API is online
Ensure sufficient balance for trading
AI not working:
# Verify Ollama is running
ollama list
ollama pull llama3:8b

# Test AI connection
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "llama3:8b", "prompt": "test", "stream": false}'
📊 Performance Monitoring
The bot targets 2-4 trades per 24 hours with:

Smart entry/exit signals
AI confirmation for each trade
Automatic risk management
Detailed logging and reporting
🔧 Advanced Configuration
Strategy Tuning:
Edit SOUL.md to adjust:

Risk tolerance
Position sizing rules
Trading frequency limits
Market conditions filters
AI Behavior:
Adjust in .env:

AI_MIN_CONFIDENCE (0.1-1.0)
OLLAMA_MODEL (different models)
AI_ENABLED (disable AI entirely)
