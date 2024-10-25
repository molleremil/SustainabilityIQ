import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { generateChallenge, evaluateAnswer } from "../services/geminiService";
import { Loader2 } from "lucide-react";

interface Challenge {
  question: string;
  solution: string;
  explanation: string;
  hint: string;
  difficulty: string;
  sdgs: number[];
}

interface Rank {
  name: string;
  minPoints: number;
  color: string;
}

const ranks: Rank[] = [
  { name: "Sustainability Novice", minPoints: 0, color: "#4CAF50" },
  { name: "Eco Apprentice", minPoints: 50, color: "#8BC34A" },
  { name: "Green Guardian", minPoints: 100, color: "#CDDC39" },
  { name: "Climate Champion", minPoints: 200, color: "#FFEB3B" },
  { name: "Sustainability Sage", minPoints: 350, color: "#FFC107" },
  { name: "Earth Emissary", minPoints: 500, color: "#FF9800" },
];

const Challenge: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userSolution, setUserSolution] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentRank, setCurrentRank] = useState<Rank>(ranks[0]);
  const [nextRank, setNextRank] = useState<Rank | null>(ranks[1]);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError("No user logged in. Please sign in to play.");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTotalPoints(userData.totalPoints || 0);
        updateRank(userData.totalPoints || 0);

        if (userData.currentChallenge) {
          setChallenge(userData.currentChallenge);
          setShowHint(userData.showHint || false);
          setUsedHint(userData.usedHint || false);
          setShowSolution(userData.showSolution || false);
          setChallengeCompleted(userData.showSolution || false);
        } else {
          await fetchNewChallenge();
        }
      } else {
        await setDoc(userRef, {
          totalPoints: 0,
          challengesSolved: 0,
          challengesSolvedWithoutHint: 0,
          sdgProgress: {},
        });
        await fetchNewChallenge();
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
      setError("Failed to load user progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNewChallenge = async () => {
    setGenerating(true);
    setError(null);
    try {
      const difficulty = getDifficultyLevel();
      const newChallenge = await generateChallenge(difficulty);
      setChallenge(newChallenge);
      setShowSolution(false);
      setUserSolution("");
      setShowHint(false);
      setUsedHint(false);
      setChallengeCompleted(false);
      setEvaluationResult(null);

      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          currentChallenge: newChallenge,
          showHint: false,
          usedHint: false,
          showSolution: false,
        });
      }
    } catch (error) {
      console.error("Error fetching challenge:", error);
      setError("Failed to fetch a new challenge. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const updateRank = (points: number) => {
    let current = ranks[0];
    let next = ranks[1];

    for (let i = 0; i < ranks.length; i++) {
      if (points >= ranks[i].minPoints) {
        current = ranks[i];
        next = ranks[i + 1] || null;
      } else {
        break;
      }
    }

    setCurrentRank(current);
    setNextRank(next);
  };

  const getDifficultyLevel = () => {
    if (totalPoints < 50) return "easy";
    if (totalPoints < 200) return "medium";
    return "hard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    setLoading(true);
    try {
      const result = await evaluateAnswer(
        challenge.question,
        challenge.solution,
        userSolution,
      );
      setEvaluationResult(result);

      if (result === "correct") {
        setShowSolution(true);
        setChallengeCompleted(true);
        const pointsEarned = usedHint ? 1 : 3;
        await updateUserProgress(challenge.sdgs, pointsEarned);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setError("Failed to evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProgress = async (sdgs: number[], points: number) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    try {
      const newTotalPoints = totalPoints + points;
      setTotalPoints(newTotalPoints);
      updateRank(newTotalPoints);

      const updateData: { [key: string]: any } = {
        totalPoints: increment(points),
        challengesSolved: increment(1),
        challengesSolvedWithoutHint: usedHint ? increment(0) : increment(1),
      };

      sdgs.forEach((sdg) => {
        updateData[`sdgProgress.${sdg}`] = increment(1);
      });

      await updateDoc(userRef, updateData);

      const updatedUserDoc = await getDoc(userRef);
      if (updatedUserDoc.exists()) {
        const updatedUserData = updatedUserDoc.data();
        setTotalPoints(updatedUserData.totalPoints || 0);
      }
    } catch (error) {
      console.error("Error updating user progress:", error);
      setError("Failed to update progress. Please try again.");
    }
  };

  const showHintHandler = async () => {
    setShowHint(true);
    setUsedHint(true);
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { showHint: true, usedHint: true });
    }
  };

  const handleNextChallenge = () => {
    fetchNewChallenge();
  };

  const progressToNextRank = nextRank
    ? ((totalPoints - currentRank.minPoints) /
        (nextRank.minPoints - currentRank.minPoints)) *
      100
    : 100;

  if (loading) {
    return <div className="text-center mt-8">Loading challenge...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="challenge p-4 max-w-2xl mx-auto flex flex-col justify-center min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-semibold">{currentRank.name}</p>
            <p className="text-sm text-gray-600">
              {nextRank ? `Next rank: ${nextRank.name}` : "Max rank achieved!"}
            </p>
          </div>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: currentRank.color }}
          >
            {totalPoints}
          </div>
        </div>
        {nextRank && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${progressToNextRank}%` }}
            ></div>
          </div>
        )}
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Sustainability Challenge
      </h2>
      {generating ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-lg font-semibold">Generating new challenge...</p>
        </div>
      ) : (
        challenge && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-4">
            <p className="text-lg mb-4">{challenge.question}</p>
            <p className="text-sm text-gray-600 mb-4">
              Difficulty: {challenge.difficulty}
            </p>
            {!showSolution && (
              <>
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={userSolution}
                    onChange={(e) => setUserSolution(e.target.value)}
                    placeholder="Your solution"
                    className="w-full p-2 mb-4 border rounded h-32"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded w-full mb-2"
                  >
                    Submit Solution
                  </button>
                </form>
                <div className="flex justify-end">
                  <button
                    onClick={showHintHandler}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    disabled={showHint}
                  >
                    {showHint ? "Hint Used" : "Show Hint"}
                  </button>
                </div>
              </>
            )}
            {showHint && !showSolution && (
              <p className="mt-4 text-yellow-600">Hint: {challenge.hint}</p>
            )}
          </div>
        )
      )}
      {showSolution && challenge && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p className="font-bold mb-2">Suggested Solution:</p>
          <p className="mb-4">{challenge.solution}</p>
          <p className="font-bold mb-2">Explanation:</p>
          <p>{challenge.explanation}</p>
        </div>
      )}
      {evaluationResult && (
        <div
          className={`p-4 mb-4 ${evaluationResult === "correct" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
        >
          <p>
            {evaluationResult === "correct"
              ? "Correct! Great job solving this challenge."
              : "Your answer was close, but not quite correct. Try again or use a hint for help."}
          </p>
        </div>
      )}
      {challengeCompleted && (
        <button
          onClick={handleNextChallenge}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-4"
        >
          Next Challenge
        </button>
      )}
    </div>
  );
};

export default Challenge;
