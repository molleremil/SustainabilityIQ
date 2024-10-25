import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Puzzle, BarChart2, User } from "lucide-react";

const BottomTabBar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="bottom-nav bg-white text-gray-600 p-4 flex justify-around items-center shadow-lg">
      <Link
        to="/"
        className={`text-2xl ${location.pathname === "/" ? "text-green-600" : ""}`}
      >
        <HomeIcon size={24} />
      </Link>
      <Link
        to="/games"
        className={`text-2xl ${location.pathname === "/games" || location.pathname === "/riddle" || location.pathname === "/challenge" ? "text-green-600" : ""}`}
      >
        <Puzzle size={24} />
      </Link>
      <Link
        to="/analytics"
        className={`text-2xl ${location.pathname === "/analytics" ? "text-green-600" : ""}`}
      >
        <BarChart2 size={24} />
      </Link>
      <Link
        to="/profile"
        className={`text-2xl ${location.pathname === "/profile" ? "text-green-600" : ""}`}
      >
        <User size={24} />
      </Link>
    </nav>
  );
};

export default BottomTabBar;
