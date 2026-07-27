# StoryYield

**A narrative-to-revenue placement engine.**

Inspired by PocketFM's engineering blog regarding Canon (narrative structure extraction) and ad-mediation (session-based scheduling).

StoryYield connects these two systems: it uses LLM-extracted narrative signals (cliffhanger intensity, hook strength, arc pacing) to decide *where* to place ad breaks and paywall points within an episode to maximize projected revenue while minimizing listener drop-off.

## Thesis
Listener drop-off and willingness-to-pay both spike around specific narrative moments. A placement engine that knows the story can outperform one that only knows the session. StoryYield optimizes ad breaks for local tension peaks, and paywalls for post-cliffhanger moments, while avoiding weak narrative segments that represent high churn risk.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Visualization**: Recharts (Custom overlaid tension charts)
- **Local AI Pipeline**: Ollama (Qwen 2.5 14B) via OpenAI SDK
- **Design System**: "Anti-AI" aesthetic (zinc/grayscale with strict typography)

## Architecture
The system consists of two main parts:
1. **Extraction Pipeline (`src/scripts/extract.ts`)**: A local node script that passes episode transcripts to a local Ollama LLM to extract JSON-structured attributes (hook_strength, cliffhanger_intensity, tension_curve).
2. **Dashboard & Optimizer (`src/app/page.tsx` & `src/lib/optimizer.ts`)**: The Next.js dashboard that visualizes the pre-computed signals and dynamically optimizes ad/paywall placements based on a user-controlled "aggressiveness" slider.

## How to Run the Extraction Pipeline Locally
Running extraction locally provides full control without per-request API costs. This project uses Ollama to run the LLM.

### 1. Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com/).

### 2. Pull a Model
Pull a model that fits your hardware. We recommend `qwen2.5:14b-instruct` for strong JSON structure and reasoning (requires ~10GB VRAM/RAM).
```bash
ollama pull qwen2.5:14b-instruct
```

*Alternative for tight VRAM (~5-6GB):*
```bash
ollama pull llama3.1:8b-instruct
```

*Alternative for CPU-only or very limited RAM (Note: lower extraction quality):*
```bash
ollama pull qwen2.5:7b
```

### 3. Provide Transcripts
Place your audio drama transcripts in the `src/data/episodes/` folder, named according to the IDs in `src/data/episodes.json` (e.g., `ep_01.txt`).

### 4. Run the Script
Ollama automatically runs an OpenAI-compatible server at `http://localhost:11434/v1`.
Execute the extraction pipeline using `ts-node` or equivalent:
```bash
npx ts-node src/scripts/extract.ts
```
*(This will update `src/data/results.json` which drives the dashboard).*

## Running the Dashboard
```bash
npm run dev
```
Navigate to `http://localhost:3000`.
