import OpenAI from 'openai';
import dotenv from 'dotenv';
import logger from '../log.mjs';

dotenv.config();

let openai = null;

const getOpenAIClient = () => {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === 'your_openai_api_key_here') {
    logger.warn('⚠️ OpenAI API Key missing. Falling back to keyword-only mode.');
    return null;
  }
  openai = new OpenAI({ apiKey: key });
  return openai;
};

/**
 * Analyzes text using LLM for deep toxicity detection.
 */
export const analyzeWithLLM = async (text) => {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are an advanced multilingual toxicity moderation AI.
Analyze comments written in English, Tamil, and Tanglish.

CRITICAL RULES:
1. NEVER classify abusive, insulting, humiliating, sexual, threatening, or hateful comments as "neutral".
2. If a comment contains ANY regional slang abuse (e.g., "loosu", "otha", "punda", "kiruku", "thevdiya"), it MUST be "toxic" or "moderate".
3. Understand sarcasm, spelling variations (e.g., "l00su"), and passive-aggressive insults.
4. "mental ah nee", "dei eruma", "waste fellow" are INSULTS and should be "toxic" or "moderate".
5. Return "positive" only for genuine praise or support.

Return EXACTLY this JSON structure:
{
  "classification": "toxic" | "moderate" | "neutral" | "positive",
  "confidence": number (0-100),
  "severity": "high" | "medium" | "low" | "none",
  "reason": "short explanation in English",
  "detected_keywords": ["word1", "word2"],
  "model_used": "gpt-4o-mini"
}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    logger.error('LLM Analysis Error:', error.message);
    return null;
  }
};
