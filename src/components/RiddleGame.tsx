import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { generateRiddle } from "../services/geminiService";
import { Loader2 } from "lucide-react";

interface SDGInfo {
  [key: number]: {
    name: string;
    description: string;
  }
}

const sdgInfo: SDGInfo = {
  1: { name: "No Poverty", description: "End poverty in all its forms everywhere" },
  2: { name: "Zero Hunger", description: "End hunger, achieve food security and improved nutrition" },
  3: { name: "Good Health and Well-being", description: "Ensure healthy lives and promote well-being for all" },
  4: { name: "Quality Education", description: "Ensure inclusive and equitable quality education" },
  5: { name: "Gender Equality", description: "Achieve gender equality and empower all women and girls" },
  6: { name: "Clean Water and Sanitation", description: "Ensure availability and sustainable management of water" },
  7: { name: "Affordable and Clean Energy", description: "Ensure access to affordable, reliable, sustainable energy" },
  8: { name: "Decent Work and Economic Growth", description: "Promote sustained, inclusive economic growth" },
  9: { name: "Industry, Innovation and Infrastructure", description: "Build resilient infrastructure, promote inclusive industrialization" },
  10: { name: "Reduced Inequalities", description: "Reduce inequality within and among countries" },
  11: { name: "Sustainable Cities and Communities", description: "Make cities inclusive, safe, resilient and sustainable" },
  12: { name: "Responsible Consumption and Production", description: "Ensure sustainable consumption and production patterns" },
  13: { name: "Climate Action", description: "Take urgent action to combat climate change and its impacts" },
  14: { name: "Life Below Water", description: "Conserve and sustainably use the oceans, seas and marine resources" },
  15: { name: "Life on Land", description: "Protect, restore and promote sustainable use of terrestrial ecosystems" },
  16: { name: "Peace, Justice and Strong Institutions", description: "Promote peaceful and inclusive societies for sustainable development" },
  17: { name: "Partnerships for the Goals", description: "Strengthen the means of implementation and revitalize global partnership" }
};

interface Riddle {
  question: string;
  answer: string;
  fact: string;
  didYouKnow: string;
  importance: string;
  sdgs: number[];
  hint: string;
  difficulty: string;
}

interface Rank {
  name: string;
  minPoints: number;
  color: string;
}

interface UpdateData {
  [key: string]: any;
  totalPoints: any;
  riddlesSolved: any;
  riddlesSolvedWithoutHint: any;
}

const ranks: Rank[] = [
  { name: "Sustainability Novice", minPoints: 0, color: "#4CAF50" },
  { name: "Eco Apprentice", minPoints: 50, color: "#8BC34A" },
  { name: "Green Guardian", minPoints: 100, color: "#CDDC39" },
  { name: "Climate Champion", minPoints: 200, color: "#FFEB3B" },
  { name: "Sustainability Sage", minPoints: 350, color: "#FFC107" },
  { name: "Earth Emissary", minPoints: 500, color: "#FF9800" },
];

const RiddleGame: React.FC = () => {
  const [riddle, setRiddle] = useState<Riddle | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentRank, setCurrentRank] = useState<Rank>(ranks[0]);
  const [nextRank, setNextRank] = useState<Rank | null>(ranks[1]);
  const [riddleCompleted, setRiddleCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSDG, setSelectedSDG] = useState<number | null>(null);
  const [relatedSDGs, setRelatedSDGs] = useState<number[]>([]);

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

        if (userData.currentRiddle) {
          setRiddle(userData.currentRiddle);
          setAttempts(userData.attempts || 0);
          setShowHint(userData.showHint || false);
          setUsedHint(userData.usedHint || false);
          setShowAnswer(userData.showAnswer || false);
          setRiddleCompleted(userData.showAnswer || false);
          setSelectedSDG(userData.currentRiddle.sdgs[0]);
          setRelatedSDGs(userData.currentRiddle.sdgs.slice(1));
        } else {
          fetchNewRiddle();
        }
      } else {
        await setDoc(userRef, {
          totalPoints: 0,
          riddlesSolved: 0,
          riddlesSolvedWithoutHint: 0,
          sdgProgress: {}
        });
        fetchNewRiddle();
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
      setError("Failed to load user progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNewRiddle = async () => {
    setGenerating(true);
    setError(null);
    try {
      const difficulty = getDifficultyLevel();
      const newSelectedSDG = Math.floor(Math.random() * 17) + 1;
      const newRiddle = await generateRiddle(difficulty, newSelectedSDG);
      setRiddle(newRiddle);
      setSelectedSDG(newSelectedSDG);
      setRelatedSDGs(newRiddle.sdgs.filter(sdg => sdg !== newSelectedSDG));
      setShowAnswer(false);
      setUserAnswer("");
      setAttempts(0);
      setShowHint(false);
      setUsedHint(false);
      setRiddleCompleted(false);

      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          currentRiddle: newRiddle,
          attempts: 0,
          showHint: false,
          usedHint: false,
          showAnswer: false
        });
      }
    } catch (error) {
      console.error("Error fetching riddle:", error);
      setError("Failed to fetch a new riddle. Please try again.");
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

  const getDifficultyLevel = (): string => {
    if (totalPoints < 50) return "easy";
    if (totalPoints < 200) return "medium";
    return "hard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (riddle && userAnswer.toLowerCase() === riddle.answer.toLowerCase()) {
      setShowAnswer(true);
      setRiddleCompleted(true);
      const pointsEarned = usedHint ? 1 : 3;
      await updateUserProgress(riddle.sdgs, !usedHint, pointsEarned);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setShowAnswer(true);
        setRiddleCompleted(true);
      }
      await updateRiddleState(newAttempts);
    }
  };

  const updateUserProgress = async (sdgs: number[], solvedWithoutHint: boolean, points: number) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    try {
      const newTotalPoints = totalPoints + points;
      setTotalPoints(newTotalPoints);
      updateRank(newTotalPoints);

      const updateData: UpdateData = {
        totalPoints: increment(points),
        riddlesSolved: increment(1),
        riddlesSolvedWithoutHint: solvedWithoutHint ? increment(1) : increment(0),
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

  const updateRiddleState = async (newAttempts: number) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      attempts: newAttempts,
      showHint,
      usedHint,
      showAnswer: newAttempts >= 3
    });
  };

  const showHintHandler = async () => {
    setShowHint(true);
    setUsedHint(true);
    await updateRiddleState(attempts);
  };

  const handleNextRiddle = () => {
    fetchNewRiddle();
  };

  const progressToNextRank = nextRank
    ? ((totalPoints - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100
    : 100;

  if (loading) {
    return <div className="text-center mt-8">Loading riddle...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="riddle-game p-4 max-w-lg mx-auto flex flex-col justify-center min-h-screen">
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

      {generating ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-lg font-semibold">Generating new riddle...</p>
        </div>
      ) : riddle && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-4">
          {selectedSDG && (
            <div className="flex flex-col items-center mb-4">
              <img
                src={`/sdg-logos/E_GIF_${selectedSDG.toString().padStart(2, '0')}.gif`}
                alt={`SDG ${selectedSDG}`}
                className="w-24 h-24 mb-2"
              />
              <p className="text-sm text-center font-semibold">
                {sdgInfo[selectedSDG as keyof typeof sdgInfo].name}
              </p>
              <p className="text-xs text-center text-gray-600">
                {sdgInfo[selectedSDG as keyof typeof sdgInfo].description}
              </p>
            </div>
          )}
          <p className="text-lg mb-4">{riddle.question}</p>
          <p className="text-sm text-gray-600 mb-4">Difficulty: {riddle.difficulty}</p>
          {!showAnswer && (
            <>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Your answer"
                  className="w-full p-2 mb-4 border rounded"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded w-full mb-2"
                >
                  Submit Answer
                </button>
              </form>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  Attempts remaining: {3 - attempts}
                </div>
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
          {showHint && !showAnswer && (
            <p className="mt-4 text-yellow-600">Hint: {riddle.hint}</p>
          )}
        </div>
      )}
      {showAnswer && riddle && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p className="font-bold mb-2">Answer: {riddle.answer}</p>
          <p className="font-bold mt-4 mb-2">Did you know?</p>
          <p className="mb-4">{riddle.didYouKnow}</p>
          <p className="font-bold mb-2">Interesting Fact:</p>
          <p className="mb-4">{riddle.fact}</p>
          <p className="font-bold mb-2">Why is this important?</p>
          <p className="mb-4">{riddle.importance}</p>
          {relatedSDGs.length > 0 && (
            <div className="mt-4">
              <p className="font-bold mb-2">Related SDGs:</p>
              <div className="flex flex-wrap gap-2">
                {relatedSDGs.map(sdg => (
                  <div key={sdg} className="flex flex-col items-center">
                    <img
                      src={`/sdg-logos/E_GIF_${sdg.toString().padStart(2, '0')}.gif`}
                      alt={`SDG ${sdg}`}
                      className="w-12 h-12 mb-1"
                    />
                    <p className="text-xs text-center">
                      {sdgInfo[sdg as keyof typeof sdgInfo].name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {riddleCompleted && (
        <button
          onClick={handleNextRiddle}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-4"
        >
          Next Riddle
        </button>
      )}
    </div>
  );
};

export default RiddleGame;
