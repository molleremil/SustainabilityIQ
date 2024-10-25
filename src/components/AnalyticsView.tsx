import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Brain, CheckCircle, EyeOff } from "lucide-react";

interface SDGProgress {
  [key: number]: number;
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

const AnalyticsView: React.FC = () => {
  const [sdgProgress, setSDGProgress] = useState<SDGProgress>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [riddlesSolved, setRiddlesSolved] = useState(0);
  const [riddlesSolvedWithoutHint, setRiddlesSolvedWithoutHint] = useState(0);
  const [currentRank, setCurrentRank] = useState<Rank>(ranks[0]);
  const [nextRank, setNextRank] = useState<Rank | null>(ranks[1]);
  const [sustainabilityIQ, setSustainabilityIQ] = useState(0);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setSDGProgress(userData.sdgProgress || {});
      setTotalPoints(userData.totalPoints || 0);
      setRiddlesSolved(userData.riddlesSolved || 0);
      setRiddlesSolvedWithoutHint(userData.riddlesSolvedWithoutHint || 0);
      updateRank(userData.totalPoints || 0);
      calculateSustainabilityIQ(userData);
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

  const calculateSustainabilityIQ = (userData: any) => {
    const baseIQ = 100;
    const pointsFactor = userData.totalPoints * 0.5;
    const sdgCoverage = Object.keys(userData.sdgProgress || {}).length * 5;
    const accuracyBonus =
      (userData.riddlesSolvedWithoutHint / (userData.riddlesSolved || 1)) * 20;

    const iq = Math.round(baseIQ + pointsFactor + sdgCoverage + accuracyBonus);
    setSustainabilityIQ(Math.min(iq, 200)); // Cap at 200
  };

  const chartData = Object.entries(sdgProgress).map(([sdg, points]) => ({
    sdg: `SDG ${sdg}`,
    points,
  }));

  const progressToNextRank = nextRank
    ? ((totalPoints - currentRank.minPoints) /
        (nextRank.minPoints - currentRank.minPoints)) *
      100
    : 100;

  return (
    <div className="analytics-view p-4 max-w-2xl mx-auto flex flex-col justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Your Sustainability Journey
      </h2>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <Brain className="w-8 h-8 mr-4 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Sustainability IQ</p>
            <p className="text-xl font-bold">{sustainabilityIQ}</p>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <CheckCircle className="w-8 h-8 mr-4 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">Riddles Solved</p>
            <p className="text-xl font-bold">{riddlesSolved}</p>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
          <EyeOff className="w-8 h-8 mr-4 text-purple-500" />
          <div>
            <p className="text-sm text-gray-600">Solved Without Hints</p>
            <p className="text-xl font-bold">{riddlesSolvedWithoutHint}</p>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">SDG Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="sdg" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="points" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsView;
