import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import officeParser from 'officeparser';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Zod Schema for Structured Outputs
const EpisodeSchema = z.object({
  hook_strength: z.number().min(0).max(100),
  cliffhanger_intensity: z.number().min(0).max(100),
  tension_curve: z.array(z.number().min(0).max(100)).length(10),
  arc_position: z.enum(["setup", "rising", "climax", "resolution"]),
  pacing_flag: z.enum(["lull", "accelerating", "constant"]),
  llm_insights: z.string()
});

const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // API key is not required for Ollama
});

const SYSTEM_PROMPT = `You are a narrative analyst reading episode scripts of an audio drama.
Extract the narrative signals and return them STRICTLY as a JSON object matching this schema:
${JSON.stringify({
  hook_strength: "number 0-100",
  cliffhanger_intensity: "number 0-100",
  tension_curve: "array of exactly 10 numbers",
  arc_position: "setup | rising | climax | resolution",
  pacing_flag: "lull | accelerating | constant",
  llm_insights: "string explaining your reasoning"
}, null, 2)}`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write to a temporary file so officeparser can read it
    const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`);
    await fs.writeFile(tempFilePath, buffer);
    
    let rawText = '';
    
    // Extract text depending on format. officeparser handles epub, docx, etc. 
    // If it's just txt, we can read it directly.
    if (file.name.endsWith('.txt')) {
      rawText = buffer.toString('utf-8');
    } else {
      // @ts-ignore
      const parsed = await officeParser.parseOffice(tempFilePath);
      // @ts-ignore
      rawText = parsed.toText();
    }
    
    // Clean up temp file
    await fs.unlink(tempFilePath).catch(console.error);

    // Limit text to avoid blowing up the context window
    const maxContent = rawText.slice(0, 8000);

    const completion = await openai.chat.completions.create({
      model: 'llama3.2:latest',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze the following episode transcript:\n\n${maxContent}` }
      ],
      // @ts-ignore
      format: 'json', 
      temperature: 0.1,
    });

    const result = completion.choices[0].message.content;
    
    if (!result) {
      throw new Error("No response from LLM");
    }

    // Safely extract JSON in case the model includes conversational text like "Here is the JSON:"
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not find valid JSON in LLM response");
    }

    const parsedData = EpisodeSchema.parse(JSON.parse(jsonMatch[0]));
    
    // Synthesize an EpisodeData object 
    const episodeData = {
      id: `dynamic_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
      episode_number: 999, // placeholder for dynamic uploads
      duration_estimate: 900,
      ...parsedData
    };

    return NextResponse.json(episodeData);

  } catch (error: any) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process file' }, { status: 500 });
  }
}
