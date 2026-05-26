const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let models = [];

const MODEL_NAMES = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash'
];

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('✦ GEMINI_API_KEY not set. AI features will be disabled.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    models = MODEL_NAMES.map(name => ({
      name,
      model: genAI.getGenerativeModel({ model: name })
    }));
    console.log(`✦ Gemini initialized with ${models.length} models for fallback.`);
    return true;
  } catch (error) {
    console.error('✦ Failed to initialize Gemini:', error.message);
    return false;
  }
};

const ACTION_PROMPTS = {
  brainstorm: `You are a creative product strategist. Given the following concept, brainstorm exactly 4 distinct feature ideas or sub-concepts. Each must be unique and actionable.`,
  deconstruct: `You are a senior systems architect. Given the following concept, break it down into exactly 4 core technical components or architectural layers. Be specific and technical.`,
  ideas: `You are an innovative thinker. Given the following concept, generate exactly 4 creative and unexpected ideas or angles to explore. Think outside the box.`,
  deepdive: `You are a domain expert. Given the following concept, identify exactly 4 critical aspects that deserve deeper investigation. Be analytical and thorough.`,
};

/**
 * Stream AI-generated child node content from Gemini.
 * Tries primary model first, falls back to secondary on rate limit.
 * Includes retry with delay on 429 errors.
 */
const streamBrainstorm = async (parentText, actionType, onChunk) => {
  if (!models || models.length === 0) {
    throw new Error('Gemini not initialized. Set GEMINI_API_KEY in .env');
  }

  const systemPrompt = ACTION_PROMPTS[actionType] || ACTION_PROMPTS.brainstorm;

  const prompt = `${systemPrompt}

CONCEPT: "${parentText}"

IMPORTANT: Respond ONLY with a valid JSON array of exactly 4 objects. Each object must have:
- "title": A concise title (3-6 words max)
- "description": A one-sentence description (15-25 words)

Example format:
[
  {"title": "Example Title", "description": "A brief description of this concept."},
  {"title": "Another Title", "description": "Another brief description."},
  {"title": "Third Title", "description": "Yet another description."},
  {"title": "Fourth Title", "description": "Final description here."}
]

Respond ONLY with the JSON array. No markdown, no code fences, no extra text.`;

  // Try with retries across all models
  let lastError = null;

  for (const modelObj of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`✦ Trying model: ${modelObj.name} (attempt ${attempt + 1})`);
        const result = await tryStream(modelObj.model, prompt, onChunk);
        return result;
      } catch (error) {
        lastError = error;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('quota') || error.message?.toLowerCase().includes('too many requests');
        
        if (isRateLimit && attempt < 1) {
          const delay = 2000; // 2s
          console.log(`✦ Rate limited on ${modelObj.name}, retrying in 2s...`);
          await sleep(delay);
          continue;
        }
        
        // If not a rate limit error, or exhausted retries, try next model
        console.log(`✦ Model ${modelObj.name} failed with error: ${error.message}`);
        break;
      }
    }
  }

  throw lastError || new Error('All models exhausted');
};

/**
 * Attempt a single streaming call with timeout.
 */
async function tryStream(targetModel, prompt, onChunk) {
  const TIMEOUT_MS = 30000;

  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('AI generation timed out after 30 seconds'));
    }, TIMEOUT_MS);

    try {
      const result = await targetModel.generateContentStream(prompt);
      let fullText = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullText += chunkText;
          if (onChunk) {
            onChunk(chunkText);
          }
        }
      }

      clearTimeout(timer);
      resolve(fullText);
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse the accumulated streamed response into child node data.
 */
const parseAIResponse = (responseText) => {
  try {
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 4).map((item, i) => ({
        title: item.title || `Idea ${i + 1}`,
        description: item.description || '',
      }));
    }
  } catch (e) {
    const match = responseText.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 4).map((item, i) => ({
            title: item.title || `Idea ${i + 1}`,
            description: item.description || '',
          }));
        }
      } catch (e2) { /* ignore */ }
    }
  }

  return [
    { title: 'Generated Idea 1', description: responseText.substring(0, 80) },
    { title: 'Generated Idea 2', description: 'Could not parse structured response.' },
    { title: 'Generated Idea 3', description: 'Try again with a different prompt.' },
    { title: 'Generated Idea 4', description: 'AI response format was unexpected.' },
  ];
};

module.exports = { initGemini, streamBrainstorm, parseAIResponse };
