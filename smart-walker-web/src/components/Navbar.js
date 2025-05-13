import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/NavbarDark.css";
import useCheckUser from "../hooks/Checklogin";


const NavbarDark = () => {
    const navigate = useNavigate();
    const userData = useCheckUser();
    const [dropdownOpen, setDropdownOpen] = useState({ account: false, landing: false });
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState({ account: false, landing: false });

    const toggleDropdown = (menu) => {
        setDropdownOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };

    const toggleMobileDropdown = (menu) => {
        setMobileDropdown((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 text-white p-4 fixed top-0 left-0 w-full z-50 shadow-lg">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to="/home" className="navbar-link flex items-center text-lg font-bold">
                        <img src="/images/walker.png" alt="Logo" className="w-10 h-10 mr-2" />
                        SWS
                    </Link>
                </div>

                {/* Hamburger Menu */}
                <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none md:hidden">
                    <FaBars size={24} />
                </button>

                {/* Navigation Links (Desktop) */}
                <div className={`hidden md:flex space-x-4`}>
                    <Link to="/home" className="py-2 px-4 hover:bg-gray-700 rounded transition duration-200">Home</Link>
                    <div className="relative" onClick={() => toggleDropdown("landing")}>
                        <button className="py-2 px-4 flex items-center hover:bg-gray-700 rounded transition duration-200">
                            Pages <FaChevronDown className="ml-1" />
                        </button>
                        <AnimatePresence>
                            {dropdownOpen.landing && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bg-gray-800 text-white p-2 rounded-lg shadow-md w-40">
                                    <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-600">Dashboard</Link>
                                    <Link to="/control" className="block py-2 px-4 hover:bg-gray-600">Control</Link>
                                    <Link to="/Profile" className="block py-2 px-4 hover:bg-gray-600">Profile</Link>
                                    <Link to="/notification" className="block py-2 px-4 hover:bg-gray-600">Notification</Link>
                                    <Link to="/setting" className="block py-2 px-4 hover:bg-gray-600">Settings</Link>
                                    <Link to="/connect" className="block py-2 px-4 hover:bg-gray-600">Connect</Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="relative" onClick={() => toggleDropdown("account")}>
                        <button className="py-2 px-4 flex items-center hover:bg-gray-700 rounded transition duration-200">
                            Account <FaChevronDown className="ml-1" />
                        </button>
                        <AnimatePresence>
                            {dropdownOpen.account && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bg-gray-800 text-white p-2 rounded-lg shadow-md w-40">
                                    {userData ? (
                                        <button onClick={handleLogout} className="block py-2 px-4 hover:bg-gray-600 w-full text-left">Sign Out</button>
                                    ) : (
                                        <Link to="/login" className="block py-2 px-4 hover:bg-gray-600">Sign In</Link>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden flex flex-col bg-gray-800 mt-2 rounded-lg p-3">
                        <Link to="/home" className="p-2 rounded-lg hover:bg-gray-700" onClick={() => setMenuOpen(false)}>Home</Link>
                        <div className="relative">
                            <button onClick={() => toggleMobileDropdown("landing")} className="p-2 w-full text-left flex justify-between items-center hover:bg-gray-700 rounded-lg">
                                Pages <FaChevronDown />
                            </button>
                            <AnimatePresence>
                                {mobileDropdown.landing && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-gray-700 rounded-lg mt-2 overflow-hidden">
                                        <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-600">Dashboard</Link>
                                        <Link to="/control" className="block py-2 px-4 hover:bg-gray-600">Control</Link>
                                        <Link to="/Profile" className="block py-2 px-4 hover:bg-gray-600">Profile</Link>
                                        <Link to="/notification" className="block py-2 px-4 hover:bg-gray-600">Notification</Link>
                                        <Link to="/setting" className="block py-2 px-4 hover:bg-gray-600">Settings</Link>
                                        <Link to="/connect" className="block py-2 px-4 hover:bg-gray-600">Connect</Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="relative">
                            <button onClick={() => toggleMobileDropdown("account")} className="p-2 w-full text-left flex justify-between items-center hover:bg-gray-700 rounded-lg">
                                Account <FaChevronDown />
                            </button>
                            <AnimatePresence>
                                {mobileDropdown.account && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-gray-700 rounded-lg mt-2 overflow-hidden">
                                        {userData ? (
                                            <button onClick={handleLogout} className="block py-2 px-4 hover:bg-gray-600 w-full text-left">Sign Out</button>
                                        ) : (
                                            <Link to="/login" className="block py-2 px-4 hover:bg-gray-600">Sign In</Link>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default NavbarDark;