import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateRiddle = async (difficulty: string, sdg: number) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate a ${difficulty} sustainability-themed riddle related to SDG ${sdg} with the following format:
  {
    "question": "The riddle question",
    "answer": "A one or two-word answer to the riddle (randomly choose between single or double word)",
    "fact": "An interesting fact related to the answer and sustainability",
    "didYouKnow": "A surprising 'Did you know?' fact that would make people say 'What?!' and want to share it",
    "importance": "A brief explanation of why this topic is important for sustainability",
    "sdgs": [${sdg}, ...up to 2 other related SDGs],
    "hint": "A small hint to help solve the riddle without giving away the answer",
    "difficulty": "${difficulty}"
  }

  Critical Instructions for Answer Generation:
  1. ALTERNATE between one-word and two-word answers (approximately 50/50 split)
  2. Keep answers guessable while still being specific
  3. Avoid technical jargon or complex terminology
  4. Use common terms that relate to specific solutions or actions

  Examples:
  For SDG 1 (No Poverty):
    BAD answers: "poverty", "community-based natural resource management", "economic empowerment initiative"
    GOOD one-word answers: "microloan", "cooperative", "training"
    GOOD two-word answers: "skill center", "fair trade", "savings group"

  For SDG 6 (Clean Water):
    BAD answers: "water", "sanitation", "integrated water resources management"
    GOOD one-word answers: "filtration", "watershed", "purifier"
    GOOD two-word answers: "rain barrel", "drip system", "water tank"

  For SDG 13 (Climate Action):
    BAD answers: "climate", "action", "greenhouse gas emission reduction strategy"
    GOOD one-word answers: "composting", "reforestation", "insulation"
    GOOD two-word answers: "solar panel", "carbon sink", "green roof"

  For SDG 17 (Partnerships):
    BAD answers: "partnership", "collaboration", "international development cooperation"
    GOOD one-word answers: "blockchain", "crowdfunding", "networking"
    GOOD two-word answers: "data sharing", "tech transfer", "joint venture"

  Difficulty Guidelines:
  Easy: 
    - One word: "recycling", "compost", "windmill"
    - Two words: "food bank", "bike path", "solar light"
  
  Medium:
    - One word: "aquaponics", "biochar", "greenhouse"
    - Two words: "smart grid", "seed bank", "waste sorting"
  
  Hard:
    - One word: "desalination", "permaculture", "biodiesel"
    - Two words: "carbon sink", "micro grid", "thermal storage"

  The riddle should:
  1. Focus on specific, actionable solutions
  2. Use clear, understandable language
  3. Have answers that could reasonably be guessed
  4. Teach about practical approaches
  5. Remain engaging and challenging without being impossible
  6. NEVER use the SDG name or basic concepts directly from the SDG description as answers

  Make the riddle engaging and educational while ensuring the answer is either one or two words (randomly chosen).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const riddleData = JSON.parse(text);
    return riddleData;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to generate riddle");
  }
};

export const evaluateAnswer = async (
  question: string,
  correctAnswer: string,
  userAnswer: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Question: ${question}
    Correct Answer: ${correctAnswer}
    User Answer: ${userAnswer}

    Evaluate if the user's answer is correct or close enough to the correct answer. 
    The evaluation should be lenient and consider the meaning rather than exact wording.
    If the core concepts or main points are present in the user's answer, it should be considered correct.

    Respond with either "correct" if the answer is correct or close enough, or "incorrect" if it's not.
    Do not include any other text in your response.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const evaluation = response.text().toLowerCase().trim();

  return evaluation === "correct" ? "correct" : "incorrect";
};

export const generateChallenge = async (difficulty: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate a ${difficulty} sustainability-themed problem-solving challenge with the following format:
  {
    "question": "A detailed description of the sustainability challenge or problem to be solved",
    "solution": "A concise suggested solution to the challenge",
    "explanation": "A detailed explanation of why this solution is effective and how it addresses the sustainability issue",
    "hint": "A helpful hint that guides the user towards the solution without giving it away completely",
    "difficulty": "${difficulty}",
    "sdgs": [Array of relevant SDG numbers that this challenge addresses]
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const challengeData = JSON.parse(text);
    return challengeData;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to generate challenge");
  }
};
