import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from 'react-icons/fa';
import RealTimeClock from "../components/RealTimeClock";

import { useNotifications } from "../context/Noti_context";

const Header = () => {
  const navigate = useNavigate();


  const handleBellClick = () => {
    navigate('/notification');
  };

  const { notifications } = useNotifications();
  const count = notifications.length;


  return (
    <div>
      <div className="flex justify-between items-center relative">
        <h1 className="text-2xl font-bold">Smart Walker</h1>
        <div
          className="relative border border-gray-400 p-2 rounded-md flex items-center justify-center w-10 h-10 shadow-md hover:bg-gray-200 cursor-pointer"
          onClick={handleBellClick}
        >
          <FaBell className="text-xl" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}

        </div>
      </div>

      <div style={{ position: 'relative', right: '60px' }}>
        <RealTimeClock />
      </div>
    </div>
  );
};

export default Header;
