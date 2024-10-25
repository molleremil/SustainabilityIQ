import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./firebase";
import Profile from "./components/Profile";
import Home from "./components/Home";
import Games from "./components/Games";
import RiddleGame from "./components/RiddleGame";
import Challenge from "./components/Challenge";
import SignIn from "./components/SignIn";
import { User as FirebaseUser } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";
import AnalyticsView from "./components/AnalyticsView";
import BottomTabBar from "./components/BottomTabBar";

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app flex flex-col min-h-screen bg-gray-100">
        <main className="flex-grow">
          {user ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/riddle" element={<RiddleGame />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<AnalyticsView />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/signin" element={<SignIn />} />
            </Routes>
          )}
        </main>
        {user && <BottomTabBar />}
      </div>
    </Router>
  );
};

export default App;
