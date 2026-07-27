# StoryYield: Narrative-to-Revenue Placement Engine

**A dynamic growth engine that maximizes LTV by replacing fixed-schedule ad breaks with content-aware monetization triggers.**

---

## 📖 The Problem: Static Placements Kill Retention

Audio platforms like PocketFM possess highly sophisticated recommendation systems, but monetization strategy often relies on blunt instruments: **fixed-interval ad schedules** (e.g., placing an ad every 5 minutes).

This creates two massive growth leaks:
1. **Retention Destruction (Churn):** Placing an ad right after a weak narrative hook or during a slow pacing lull dramatically increases session abandonment probability.
2. **Sub-optimal ARPU:** Placing a paywall arbitrarily, rather than at peak emotional investment (a high-intensity cliffhanger), leaves conversion potential on the table.

## 🚀 The Solution: StoryYield

StoryYield bridges the gap between **Content Signals** and **Yield Optimization**. 

Instead of treating every minute of audio as interchangeable inventory, StoryYield deterministically parses episode scripts to extract core narrative telemetry (tension curves, pacing, hook strength). It then feeds these signals into a placement optimizer to dynamically trigger ad breaks and paywalls.

### How it drives growth:
- **Maximizes Session Length:** By avoiding ad insertions during predicted drop-off spikes (narrative lulls), users listen longer, unlocking more impression opportunities over their lifetime.
- **Maximizes eCPM & Conversion:** Ads are injected during high-attention plateaus (increasing completion rates), and paywalls are strictly gated behind upper-quartile cliffhangers (maximizing willingness-to-pay).

---

## ⚙️ Architecture & Pipeline

StoryYield operates as a 3-step deterministic pipeline:

1. **Signal Ingestion (Content-Aware Extraction)**
   - You upload an `.epub` or `.txt` episode script.
   - The engine uses a local, lightweight Language Model to act as a pure signal extractor. It deterministically scores the script's tension, pacing, and cliffhanger intensity, outputting a strict JSON payload.
2. **Drop-off Prediction**
   - The engine correlates the extracted tension curve with historical session drop-off heuristics.
3. **Yield Optimization (Decision Engine)**
   - A mathematical optimizer runs over the predicted telemetry. It balances a configurable **Monetization vs. Retention Tradeoff**, placing ads where attention is highest and restricting them where churn risk spikes.

---

## 🛠 Quick Start Guide

You can run the full engine and interactive dashboard locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [Ollama](https://ollama.com/) (For local signal extraction without OpenAI fees)

### 1. Start the Signal Extractor
The extraction API expects Ollama to be running locally. For optimal speed, we use the lightweight `llama3.2:latest` model.
```bash
# Pull the model
ollama run llama3.2:latest
```

### 2. Run the Dashboard
```bash
# Clone the repository
git clone https://github.com/Sejpal-Raghav/narrative-placement-optimization.git
cd narrative-placement-optimization

# Install dependencies
npm install

# Start the growth engine UI
npm run dev
```

Navigate to `http://localhost:3000`. 

### 3. Test the Engine
1. Click the **"Ingest Script"** button in the dashboard sidebar.
2. Upload any `.epub` or `.txt` story file.
3. Watch as the engine extracts the telemetry and instantly recalculates the optimal monetization placements!

---

*Built to demonstrate how product engineering can directly influence ARPU and LTV through content-aware logic.*
