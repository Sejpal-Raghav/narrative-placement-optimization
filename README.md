# Narrative Placement Optimization Engine

A deterministic pipeline that maximizes user lifetime value (LTV) by dynamically computing optimal ad break and paywall coordinates based on narrative telemetry.

For an in-depth breakdown of the architecture, algorithmic placement constraints, and the rationale behind the primary dashboard metrics, please refer to the [Technical Architecture and Decisions](TECHNICAL_DECISIONS.md) document.

---

## The Engineering Challenge: Static Inventory Scheduling

Audio platforms rely on complex recommendation algorithms, yet monetization insertion largely operates on static, time-based intervals (e.g., executing a programmatic ad break every 5 minutes). 

This introduces two distinct inefficiencies:
1. **Accelerated Churn:** Ad placement during weak narrative hooks or structural pacing lulls demonstrably increases session abandonment probability.
2. **Sub-optimal Conversion:** Firing a paywall at arbitrary intervals fails to capitalize on peak emotional investment, leading to suboptimal conversion rates.

## The Solution: Content-Aware Yield Optimization

This engine bridges signal extraction and yield optimization. Rather than treating audio playback timeline purely as generic inventory space, the pipeline parses the audio script text to generate structural telemetry (tension curves, pacing matrices, and hook strength). 

This data is fed into a placement optimizer to dynamically trigger monetization events based on deterministic algorithmic constraints.

### Optimization Mechanics:
- **Session Length Maximization:** The algorithm scans the extracted tension curve for local minima and applies a blocking radius, preventing ad insertions during predicted drop-off spikes.
- **eCPM and Conversion Maximization:** Ads are injected into high-attention plateaus to drive completion rates, while paywalls are strictly gated behind upper-quartile cliffhanger intensity scores to intercept users at peak willingness-to-pay.

---

## System Architecture and Pipeline

The application operates via a three-stage deterministic pipeline:

1. **Signal Ingestion and Extraction**
   - Ingests raw `.epub` or `.txt` episode transcripts.
   - Utilizes a localized LLM runtime to execute signal extraction over the script buffer. It scores pacing, tension, and cliffhangers, outputting a strict JSON telemetry payload.
2. **Drop-off Prediction**
   - The engine correlates the extracted tension vectors with historical session drop-off heuristics to flag high-risk timestamps.
3. **Yield Optimization (Decision Engine)**
   - A mathematical optimizer parses the telemetry. It balances a configurable scalar variable representing the Monetization vs. Retention Tradeoff, computing precise temporal coordinates for ad and paywall events.

---

## Technical Initialization

The repository contains the full Next.js dashboard and the backend extraction API.

### Prerequisites
- Node.js (v18 or higher)
- Ollama (Required for local execution of the inference API)

### 1. Initialize Inference Engine
The extraction API routes depend on a local inference server. We utilize `llama3.2:latest` due to its small memory footprint and high processing speed for deterministic parsing tasks.
```bash
ollama run llama3.2:latest
```

### 2. Compile and Run Application
```bash
git clone https://github.com/Sejpal-Raghav/narrative-placement-optimization.git
cd narrative-placement-optimization

npm install

npm run dev
```

Navigate to `http://localhost:3000` to access the optimization dashboard.

### 3. Pipeline Testing
1. Click the "Ingest Script" utility in the dashboard sidebar.
2. Provide a `.epub` or `.txt` file representing an audio transcript.
3. The inference API will extract the structural telemetry, and the client-side decision engine will dynamically re-compute the optimal placement overlays.
