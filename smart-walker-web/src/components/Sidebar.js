import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaCog, FaSignOutAlt, FaChartPie, FaWheelchair, FaUser, FaBroadcastTower } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    // localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col p-4 fixed top-0 left-0">
      {/* Logo */}
      <div className="flex items-center mb-6">
        <img src="/images/walker.png" alt="Logo" className="w-10 h-10 mr-2" />
      </div>

      {/* Menu */}
      <nav className="flex flex-col flex-grow space-y-2">
        <Link
          to="/home"
          className={`group relative flex items-center justify-center p-3 hover:bg-gray-700 hover:scale-110 transition-transform duration-200 rounded-lg ${selected === "/home" ? "bg-gray-700 text-blue-400" : ""}`}
          onClick={() => setSelected("/home")}
        >
          <FaHome size={24} />
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-inherit text-white text-xs rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Home
          </span>
        </Link>

        <Link
          to="/dashboard"
          className={`group relative flex items-center justify-center p-3 hover:bg-gray-700 hover:scale-110 transition-transform duration-200 rounded-lg ${selected === "/dashboard" ? "bg-gray-700 text-blue-400" : ""}`}
          onClick={() => setSelected("/dashboard")}
        >
          <FaChartPie size={24} />
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-inherit text-white text-xs rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Dashboard
          </span>
        </Link>


        <Link
          to="/profile"
          className={`group relative flex items-center justify-center p-3 hover:bg-gray-700 hover:scale-110 transition-transform duration-200 rounded-lg ${selected === "/profile" ? "bg-gray-700 text-blue-400" : ""}`}
          onClick={() => setSelected("/profile")}
        >
          <FaUser size={24} />
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-inherit text-white text-xs rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Profile
          </span>
        </Link>

        <Link
          to="/setting"
          className={`group relative flex items-center justify-center p-3 hover:bg-gray-700 hover:scale-110 transition-transform duration-200 rounded-lg ${selected === "/setting" ? "bg-gray-700 text-blue-400" : ""}`}
          onClick={() => setSelected("/setting")}
        >
          <FaCog size={24} />
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-inherit text-white text-xs rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Setting
          </span>
        </Link>

        <Link
          to="/control"
          className={`group relative flex items-center justify-center p-3 hover:bg-gray-700 hover:scale-110 transition-transform duration-200 rounded-lg ${selected === "/control" ? "bg-gray-700 text-blue-400" : ""}`}
          onClick={() => setSelected("/control")}
        >
          <FaWheelchair size={24} />
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-inherit text-white text-xs rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Controller
          </span>
        </Link>

        <Link
          to="/connect"
          className={`group relative flex items-center justify-center p-3 hover:bg-gray-700 hover:scale-110 transition-transform duration-200 rounded-lg ${selected === "/connect" ? "bg-gray-700 text-blue-400" : ""}`}
          onClick={() => setSelected("/connect")}
        >
          <FaBroadcastTower size={24} />
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-inherit text-white text-xs rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Connect
          </span>
        </Link>

      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="group relative flex items-center justify-center p-3 hover:bg-gray-700 hover:scale-110 transition-transform duration-200 rounded-lg"
      >
        <FaSignOutAlt size={24} />
        <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap bg-inherit text-white text-xs rounded-lg shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          Logout
        </span>
      </button>

    </div>
  );
};

export default Sidebar;
