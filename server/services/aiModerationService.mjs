import { containsToxicKeywords } from './toxicWordDictionary.mjs';
import { analyzeWithLLM } from './llmClient.mjs';
import logger from '../log.mjs';

/**
 * Orchestrates the hybrid moderation flow:
 * 1. Fast Keyword Pre-filter
 * 2. Deep LLM Analysis (if suspicious or LLM available)
 */
export const moderateComment = async (text) => {
  const hasKeywords = containsToxicKeywords(text);
  
  // High-performance pre-filter for obvious toxic content
  if (hasKeywords) {
    logger.info(`[Pre-filter] Toxic keywords detected: "${text.substring(0, 20)}..."`);
    // Even if keywords hit, we might want LLM for categorization and reason, 
    // but we can fast-track the toxicity status.
  }

  // Deep LLM Analysis
  const llmResult = await analyzeWithLLM(text);

  if (llmResult) {
    let finalSentiment = llmResult.classification;
    const confidence = llmResult.confidence;

    // Apply strict confidence threshold system
    if (finalSentiment === 'toxic' || finalSentiment === 'moderate') {
      if (confidence > 85) {
        finalSentiment = 'toxic';
      } else if (confidence >= 60) {
        finalSentiment = 'moderate';
      } else {
        finalSentiment = 'neutral';
      }
    }

    // High-priority override: if pre-filter hit and LLM is unsure, keep it toxic
    if (hasKeywords && (finalSentiment === 'neutral' || finalSentiment === 'positive')) {
      finalSentiment = 'toxic';
    }

    return {
      sentiment: finalSentiment,
      confidence: confidence / 100,
      severity: llmResult.severity,
      reason: llmResult.reason,
      keywords: llmResult.detected_keywords,
      model: llmResult.model_used
    };
  }

  // Fallback to keyword-only if LLM fails or is unavailable
  return {
    sentiment: hasKeywords ? 'toxic' : 'neutral',
    confidence: hasKeywords ? 1.0 : 0.5,
    severity: hasKeywords ? 'high' : 'none',
    reason: hasKeywords ? 'Toxic keywords detected' : 'Normal comment',
    keywords: hasKeywords ? ['keyword_match'] : [],
    model: 'keyword-filter'
  };
};
