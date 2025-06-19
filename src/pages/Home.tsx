// src/Home.jsx

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex flex-col justify-center items-center text-white px-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Vidwat Associates
      </h1>
      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-lg text-center">
        🚀 Project Dashboard
      </h1>
      <p className="text-lg mb-8 text-center max-w-lg">
        Welcome to the smart project portal. Add new project details or view
        existing ones with ease!
      </p>
      <div className="flex gap-6 flex-col sm:flex-row">
        <Link
          to="/add"
          className="bg-white text-purple-700 hover:bg-purple-100 font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
        >
          ➕ Add Project
        </Link>
        <Link
          to="/view"
          className="bg-white text-green-700 hover:bg-green-100 font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
        >
          📊 View Project
        </Link>
        <Link
          to="/update"
          className="bg-white text-orange-700 hover:bg-orange-100 font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
        >
          🔄 Update Project
        </Link>
      </div>
    </div>
  );
};

export default Home;
