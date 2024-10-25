import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Lightbulb, TrendingUp } from "lucide-react";

const WelcomeScreen: React.FC = () => {
  return (
    <div className="welcome-screen min-h-screen bg-gray-50 text-gray-800 p-6 sm:p-8 flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-gray-100 to-gray-50 animate-pulse-slow"></div>
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-900">
          Sustainability IQ
        </h1>
        <div className="mb-10 space-y-4">
          <p className="text-lg sm:text-xl font-light leading-relaxed">
            Uncover the intricate connections within Sustainable Development Goals through engaging, bite-sized learning experiences.
          </p>
          <p className="text-base sm:text-lg font-light leading-relaxed">
            Challenge yourself and progressively build the awareness, knowledge and skills crucial for shaping a sustainable future, all through an innovative gamified approach.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <FeatureCard
            icon={<Target className="w-8 h-8 mb-3 text-green-600" />}
            title="Targeted Learning"
            description="Focus on key sustainability concepts through concise, impactful lessons"
          />
          <FeatureCard
            icon={<Lightbulb className="w-8 h-8 mb-3 text-yellow-500" />}
            title="Gamified Approach"
            description="Enjoy an interactive journey of riddles and real-world challenges"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 mb-3 text-blue-600" />}
            title="Progressive Impact"
            description="Track your growth and see how your knowledge contributes to global goals"
          />
        </div>
        <Link
          to="/signin"
          className="inline-block bg-gray-900 text-white px-6 py-2 rounded-full font-semibold text-base transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg animate-float"
        >
          Begin Your Journey <ArrowRight className="inline ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm transition duration-300 ease-in-out hover:shadow-md">
    {icon}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default WelcomeScreen;