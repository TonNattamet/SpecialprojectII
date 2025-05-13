import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaChartPie, FaBars, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";


const Navbarlog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({ pages: false, account: false });

  const toggleDropdown = (menu) => {
    setDropdownOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="bg-gray-900 text-white p-4 fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img src="/images/walker.png" alt="Logo" className="w-10 h-10 mr-2" />
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none md:hidden">
          <FaBars size={24} />
        </button>

        <nav className="hidden md:flex space-x-4">
          <Link to="/home" className={`p-3 rounded-lg hover:bg-gray-700 ${selected === "/home" ? "bg-gray-700 text-blue-400" : ""}`} onClick={() => setSelected("/home")}> <FaHome size={20} /> </Link>
          <Link to="/dashboard" className={`p-3 rounded-lg hover:bg-gray-700 ${selected === "/dashboard" ? "bg-gray-700 text-blue-400" : ""}`} onClick={() => setSelected("/dashboard")}> <FaChartPie size={20} /> </Link>

          <div className="relative" onClick={() => toggleDropdown("account")}>
            <button className="p-3 flex items-center hover:bg-gray-700 rounded transition duration-200">
              Account <FaChevronDown className="ml-1" />
            </button>
            <AnimatePresence>
              {dropdownOpen.account && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bg-gray-800 text-white p-2 rounded-lg shadow-md w-40">
                  <Link to="/profile" className="block py-2 px-4 hover:bg-gray-600">Profile</Link>
                  <Link to="/setting" className="block py-2 px-4 hover:bg-gray-600">Settings</Link>
                  <button onClick={handleLogout} className="block py-2 px-4 hover:bg-gray-600 w-full text-left">Sign Out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden flex flex-col bg-gray-800 mt-2 rounded-lg p-3">
            <Link to="/home" className="p-2 rounded-lg hover:bg-gray-700 flex items-center" onClick={() => { setSelected("/home"); setIsOpen(false); }}> <FaHome className="mr-2" /> Home </Link>
            <div className="relative">

              <button onClick={() => toggleDropdown("pages")} className="p-2 w-full text-left flex justify-between items-center hover:bg-gray-700 rounded-lg">
                Pages <FaChevronDown />
              </button>
              <AnimatePresence>
                {dropdownOpen.pages && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-gray-700 rounded-lg mt-2 overflow-hidden">
                    <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-600">Dashboard</Link>
                    <Link to="/Profile" className="block py-2 px-4 hover:bg-gray-600">Profile</Link>
                    <Link to="/setting" className="block py-2 px-4 hover:bg-gray-600">Settings</Link>
                    <Link to="/control" className="block py-2 px-4 hover:bg-gray-600">Control</Link>
                    <Link to="/notification" className="block py-2 px-4 hover:bg-gray-600">Notification</Link>
                    <Link to="/connect" className="block py-2 px-4 hover:bg-gray-600">Connect</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button onClick={() => toggleDropdown("account")} className="p-2 w-full text-left flex justify-between items-center hover:bg-gray-700 rounded-lg">
                Account <FaChevronDown />
              </button>
              <AnimatePresence>
                {dropdownOpen.account && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-gray-700 rounded-lg mt-2 overflow-hidden">
                    <button onClick={handleLogout} className="block py-2 px-4 hover:bg-gray-600 w-full text-left">Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbarlog;
