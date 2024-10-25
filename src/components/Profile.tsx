import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
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

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sdgProgress, setSDGProgress] = useState<SDGProgress>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [riddlesSolved, setRiddlesSolved] = useState(0);
  const [riddlesSolvedWithoutHint, setRiddlesSolvedWithoutHint] = useState(0);
  const [currentRank, setCurrentRank] = useState<Rank>(ranks[0]);
  const [nextRank, setNextRank] = useState<Rank | null>(ranks[1]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserProgress(currentUser.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchUserProgress = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setSDGProgress(userData.sdgProgress || {});
      setTotalPoints(userData.totalPoints || 0);
      setRiddlesSolved(userData.riddlesSolved || 0);
      setRiddlesSolvedWithoutHint(userData.riddlesSolvedWithoutHint || 0);
      updateRank(userData.totalPoints || 0);
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const progressToNextRank = nextRank
    ? ((totalPoints - currentRank.minPoints) /
        (nextRank.minPoints - currentRank.minPoints)) *
      100
    : 100;

  if (!user) {
    return (
      <div className="profile p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
        <p>Please sign in to view your profile.</p>
        <Link
          to="/signin"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="profile p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>
      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <p className="text-lg mb-2">Email: {user.email}</p>
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
            <p className="text-sm text-gray-600">Total Points</p>
            <p className="text-xl font-bold">{totalPoints}</p>
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
      <h3 className="text-xl font-semibold mb-2">SDG Progress</h3>
      <ul className="bg-white shadow-md rounded-lg p-4 mb-4">
        {Object.entries(sdgProgress).map(([sdg, points]) => (
          <li key={sdg} className="mb-1">
            SDG {sdg}: {points} points
          </li>
        ))}
      </ul>
      <button
        onClick={handleSignOut}
        className="bg-red-500 text-white px-4 py-2 rounded w-full"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
