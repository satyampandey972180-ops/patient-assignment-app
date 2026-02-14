// AI result types
const AI_RESULTS = ['Normal', 'Needs Review', 'High Risk'];

// Explanations for each result type
const EXPLANATIONS = {
  'Normal': 'The image appears normal with no concerning features detected.',
  'Needs Review': 'Some features require further medical review and assessment.',
  'High Risk': 'Potential high-risk features detected. Immediate medical attention recommended.',
};

// Generate random AI result
export function generateAIResult() {
  // Pick random result
  const randomIndex = Math.floor(Math.random() * AI_RESULTS.length);
  const result = AI_RESULTS[randomIndex];
  
  // Get explanation
  const explanation = EXPLANATIONS[result];
  
  return {
    result,
    explanation,
  };
}
