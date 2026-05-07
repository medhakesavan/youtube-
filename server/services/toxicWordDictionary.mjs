/**
 * Comprehensive dictionary of toxic keywords and phrases 
 * for English, Tamil (Unicode), and Tanglish (Latin script).
 */

export const TOXIC_KEYWORDS = [
  // --- English ---
  'fuck', 'bastard', 'bitch', 'asshole', 'dick', 'pussy', 'scam', 'fake', 'idiot', 'stupid', 'dumb', 
  'waste fellow', 'useless', 'trash', 'nonsense', 'moron', 'pathetic', 'shut up', 'suck', 'kill yourself',
  'die', 'whore', 'slut', 'racist', 'nazi', 'faggot', 'stfu', 'wtf',
  
  // --- Tamil Unicode ---
  'முட்டாள்', 'நாயே', 'பேயோ', 'கேவலம்', 'தப்பு', 'செருப்பு', 'பிச்சை', 'நாசம்', 'பொய்', 'புண்ட', 'தேவ்டியா',
  'ஒத்தா', 'வெண்ணை', 'லூசு', 'பாவி', 'அயோக்கியன்', 'பரதேசி', 'ஈனப்பிறவி', 'செருப்படி', 'மவனே', 'கூதி',
  'செத்துரு', 'கிறுக்கி', 'கிறுக்கன்', 'மயிர்', 'குண்டி', 'வெண்ண',
  
  // --- Tanglish / Tamil Slang (Latin Script) ---
  'loosu', 'mental', 'pundamavan', 'bunda', 'punda', 'thevdiya', 'thevdia', 'naaye', 'naayae', 
  'mutta punda', 'dai loosu', 'poda punda', 'kiruku', 'dog', 'otha', 'oththa', 'kena', 'koomuttai', 
  'yecha', 'poolu', 'ommale', 'savu', 'saavu', 'saavadichiruven', 'adi-vanguva', 'baadu', 'sunni',
  'omala', 'vetti', 'karumam', 'chi', 'thuu', 'waste da', 'paithiyam', 'moodu', 'poda', 'gomala',
  'sori naaye', 'picchai', 'punda-maga', 'pundai', 'pundais', 'mayiru', 'thevidiya', 'sethuru',
  'kiruku', 'kirukki', 'vetti payale', 'thayoli', 'mavaney', 'paradesi', 'pundamvane', 'koodhi',
  'mavane', 'otha', 'omala', 'ommale', 'baadu', 'thayoli', 'thevidya', 'kandaraoli', 'punda mave',
  'mental ah nee', 'dei eruma', 'eruma maadu', 'karumaandharam', 'thayoli mavan', 'badu payale',
  'savu da', 'saavu da', 'thevdia mava', 'panni', 'kazhudhai', 'potta', 'kena', 'loose payale'
];

/**
 * Checks if a text contains any of the toxic keywords.
 * Includes advanced bypass detection like repeated characters, spaces, and symbols.
 */
export const containsToxicKeywords = (text) => {
  // 1. Basic cleaning
  const raw = text.toLowerCase();
  
  // 2. Remove symbols that might be used to bypass (e.g., p*nda -> punda)
  const cleaned = raw.replace(/[*@#$%^&()_+=[\]{};':"\\|,.<>/?-]/g, '');
  
  // 3. Check for spaced out words (e.g., "o t h a")
  const noSpaces = raw.replace(/\s/g, '');

  // 4. Check for repeated characters (e.g., "loosuuuu")
  const noRepeats = raw.replace(/(.)\1+/g, '$1');

  // 5. Normalization for common leetspeak/symbol replacements
  const normalized = raw
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/@/g, 'a');

  const checkText = (str) => {
    return TOXIC_KEYWORDS.some(keyword => str.includes(keyword));
  };

  return checkText(raw) || checkText(cleaned) || checkText(noSpaces) || checkText(noRepeats) || checkText(normalized);
};
