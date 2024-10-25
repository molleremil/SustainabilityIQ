import React from "react";
import { Link } from "react-router-dom";
import { Puzzle, BarChart2, User } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="home min-h-screen bg-gray-50 p-8 flex flex-col justify-between">
      <header className="max-w-4xl mx-auto w-full text-center">
        <h1 className="text-4xl font-light mb-2 text-gray-800">
          Sustainability IQ
        </h1>
        <p className="text-xl text-gray-600">Learn. Solve. Impact.</p>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-3 gap-8 sm:gap-16">
          <NavButton icon={<Puzzle />} label="Games" link="/games" />
          <NavButton icon={<BarChart2 />} label="Progress" link="/analytics" />
          <NavButton icon={<User />} label="Profile" link="/profile" />
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full text-center text-gray-500 text-sm">
        &copy; 2024 Sustainability IQ. All rights reserved.
      </footer>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  link: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, link }) => (
  <Link to={link} className="flex flex-col items-center">
    <div className="bg-white w-20 h-20 rounded-full shadow-md flex items-center justify-center mb-2 transition duration-300 ease-in-out hover:shadow-lg hover:bg-gray-100">
      {React.cloneElement(icon as React.ReactElement, {
        className: "w-8 h-8 text-gray-700",
      })}
    </div>
    <span className="text-sm text-gray-600">{label}</span>
  </Link>
);

export default Home;
