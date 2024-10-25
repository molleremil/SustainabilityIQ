import React from "react";
import { Link } from "react-router-dom";
import { Brain, Lightbulb } from "lucide-react";

const Games: React.FC = () => {
  return (
    <div className="games min-h-screen bg-gray-50 p-8 flex flex-col justify-center">
      <h1 className="text-4xl font-light mb-8 text-center text-gray-800">
        Choose a Game
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <GameOption
          icon={<Brain className="w-12 h-12 text-blue-500" />}
          title="Riddles"
          description="Test your knowledge with sustainability-themed riddles"
          link="/riddle"
        />
        <GameOption
          icon={<Lightbulb className="w-12 h-12 text-yellow-500" />}
          title="Challenges"
          description="Solve real-world sustainability problems"
          link="/challenge"
        />
      </div>
    </div>
  );
};

interface GameOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const GameOption: React.FC<GameOptionProps> = ({
  icon,
  title,
  description,
  link,
}) => (
  <Link to={link} className="block">
    <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-2xl font-semibold ml-4 text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  </Link>
);

export default Games;
