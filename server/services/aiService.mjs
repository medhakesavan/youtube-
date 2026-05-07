import OpenAI from 'openai';
import dotenv from 'dotenv';
import logger from '../log.mjs';

dotenv.config();

let openai = null;

const getOpenAI = () => {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === 'your_openai_api_key_here') {
    return null;
  }
  openai = new OpenAI({ apiKey: key });
  return openai;
};

import { moderateComment } from './aiModerationService.mjs';

/**
 * Legacy wrapper for the new advanced moderation service.
 * Ensures compatibility with existing routes while upgrading detection logic.
 */
export const classifyComment = async (text) => {
  const result = await moderateComment(text);
  
  return {
    sentiment: result.sentiment,
    category: result.reason, // Map 'reason' to 'category' for DB compatibility
    toxicityScore: result.sentiment === 'toxic' ? result.confidence : 0,
    confidence: result.confidence,
    severity: result.severity,
    keywords: result.keywords,
    model: result.model
  };
};
