/**
 * Centralized Sentiment Color Configuration
 * Each sentiment uses a fixed color consistently across the entire application.
 */

export const SENTIMENT_COLORS = {
  positive: {
    label: 'Positive',
    color: '#2ba640', // Green
    bg: '#e6f4ea',
    text: '#2ba640',
    badgeClass: 'yt-badge-success',
    iconColor: 'text-[#2ba640]',
    bgColor: 'bg-[#e6f4ea]'
  },
  neutral: {
    label: 'Neutral',
    color: '#606060', // Gray
    bg: '#f2f2f2',
    text: '#606060',
    badgeClass: 'yt-badge-neutral',
    iconColor: 'text-[#606060]',
    bgColor: 'bg-[#f2f2f2]'
  },
  moderate: {
    label: 'Moderate',
    color: '#f9ab00', // Yellow/Orange
    bg: '#fff8e1',
    text: '#b45309',
    badgeClass: 'yt-badge-warning',
    iconColor: 'text-[#f9ab00]',
    bgColor: 'bg-[#fff8e1]'
  },
  toxic: {
    label: 'Toxic',
    color: '#d93025', // Red
    bg: '#fce8e6',
    text: '#d93025',
    badgeClass: 'yt-badge-danger',
    iconColor: 'text-[#d93025]',
    bgColor: 'bg-[#fce8e6]'
  }
};

export const getSentimentConfig = (sentiment) => {
  const s = sentiment?.toLowerCase() || 'neutral';
  return SENTIMENT_COLORS[s] || SENTIMENT_COLORS.neutral;
};

export const SENTIMENT_ORDER = ['positive', 'neutral', 'moderate', 'toxic'];
