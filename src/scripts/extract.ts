import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Zod Schema for Structured Outputs
const EpisodeSchema = z.object({
  hook_strength: z.number().min(0).max(100).describe("Intensity of the first 30 seconds"),
  cliffhanger_intensity: z.number().min(0).max(100).describe("Intensity of the ending"),
  tension_curve: z.array(z.number().min(0).max(100)).length(10).describe("Exactly 10 integers representing tension over time"),
  arc_position: z.enum(["setup", "rising", "climax", "resolution"]),
  pacing_flag: z.enum(["lull", "accelerating", "constant"]),
  llm_insights: z.string().describe("Provide a short paragraph explaining your reasoning for the pacing and tension curve, noting any key narrative moments that justify the scores.")
});

// Assuming the user runs Ollama locally:
// ollama run qwen2.5:14b-instruct
const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // API key is not required for Ollama
});

const SYSTEM_PROMPT = `You are a narrative analyst reading episode scripts of an audio drama.
Extract the narrative signals and return them STRICTLY as a JSON object matching this schema:
${JSON.stringify({
  hook_strength: "number 0-100",
  cliffhanger_intensity: "number 0-100",
  tension_curve: "array of 10 numbers",
  arc_position: "setup | rising | climax | resolution",
  pacing_flag: "lull | accelerating | constant",
  llm_insights: "string explaining your reasoning"
}, null, 2)}`;

async function extractEpisode(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const maxContent = content.slice(0, 8000); // truncate if necessary to fit context window

  try {
    const completion = await openai.chat.completions.create({
      model: 'qwen2.5:14b-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze the following episode transcript:\n\n${maxContent}` }
      ],
      // @ts-ignore
      format: 'json', 
      temperature: 0.1,
    });

    const result = completion.choices[0].message.content;
    if (result) {
      // Validate the structured output using Zod
      const parsedData = EpisodeSchema.parse(JSON.parse(result));
      return parsedData;
    }
  } catch (err) {
    console.error(`Failed to extract data for ${filePath}:`, err);
  }
  return null;
}

async function main() {
  const dataDir = path.join(__dirname, '../data');
  const metadataPath = path.join(dataDir, 'episodes.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

  const results: Record<string, any> = {};

  console.log('Starting structured extraction pipeline...');

  for (const ep of metadata) {
    console.log(`Analyzing ${ep.title} (${ep.id})...`);
    const transcriptPath = path.join(dataDir, 'episodes', `${ep.id}.txt`);
    
    if (fs.existsSync(transcriptPath)) {
      const extracted = await extractEpisode(transcriptPath);
      results[ep.id] = {
        ...ep,
        ...extracted
      };
    } else {
      console.warn(`File not found: ${transcriptPath}. Skipping actual extraction, you need to provide transcript txt files to run this script.`);
    }
  }

  fs.writeFileSync(path.join(dataDir, 'results.json'), JSON.stringify(results, null, 2));
  console.log('Extraction complete! Results saved to data/results.json');
}

main().catch(console.error);
