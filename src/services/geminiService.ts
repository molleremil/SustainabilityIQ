import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateRiddle = async (difficulty: string, sdg: number) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate a ${difficulty} sustainability-themed riddle related to SDG ${sdg} with the following format:
  {
    "question": "The riddle question",
    "answer": "The one-word answer to the riddle",
    "fact": "An interesting fact related to the answer and sustainability",
    "didYouKnow": "A surprising 'Did you know?' fact that would make people say 'What?!' and want to share it",
    "importance": "A brief explanation of why this topic is important for sustainability",
    "sdgs": [${sdg}, ...up to 2 other related SDGs],
    "hint": "A small hint to help solve the riddle without giving away the answer",
    "difficulty": "${difficulty}"
  }

  Ensure that the riddle is primarily focused on SDG ${sdg}, but also consider including up to two related SDGs if relevant. The "sdgs" array should always include the main SDG (${sdg}) as the first element, followed by any related SDGs.

  Make the riddle engaging, educational, and appropriate for the specified difficulty level. The answer should be a single word that captures the essence of the sustainability concept related to the SDG.`;

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