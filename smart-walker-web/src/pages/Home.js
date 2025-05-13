import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import NavbarDark from "../components/Navbar"; // Ensure correct import
import { Link, useNavigate } from "react-router-dom";
import useCheckUser from "../hooks/Checklogin";

import Voicemode from "../components/Voicemode";


const Home = () => {
    const navigate = useNavigate();
    const userData = useCheckUser();

    return (
        <div className="min-h-screen text-white bg-cover bg-center"
            style={{ backgroundImage: "url('/images/bg-home1.jpg')" }}>
            {/* Navbar */}
            <Voicemode/>
            <NavbarDark />

            {/* Welcome Section */}
            <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white"
                style={{ backgroundImage: "url('/images/walker-bg.png')" }}>

                {/* Box wrapper for welcome section */}
                <div className="bg-white bg-opacity-80 p-8 sm:p-16 rounded-3xl shadow-2xl max-w-4xl mx-auto text-gray-700">
                    <motion.h1
                        className="text-4xl sm:text-5xl font-bold mb-4"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Welcome to Smart Walker System
                    </motion.h1>

                    <motion.p
                        className="text-lg mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Discover amazing content and experiences.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9 }}
                    >
                        {userData ? (
                            <Button
                                className="px-6 py-3 text-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-all"
                                onClick={() => navigate("/dashboard")}
                            >
                                Get Started
                            </Button>
                        ) : (
                            <Button
                                className="px-6 py-3 text-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-all"
                                onClick={() => navigate("/login")}
                            >
                                Get Started
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Main Pages Section */}
            <div className="p-6 sm:p-10">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl sm:text-5xl font-bold text-center mb-12 drop-shadow-md"
                >
                    Main Pages for Usage
                </motion.h1>

                {/* Cards Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            viewport={{ once: true }}
                        >
                            <Card className="rounded-2xl shadow-xl overflow-hidden bg-white text-gray-900">
                                <motion.img
                                    src={i === 0 ? "/images/dashboard.png" :
                                        i === 1 ? "/images/settings.png" :
                                            "/images/controller.png"}
                                    alt={`Nature ${i + 1}`}
                                    className="w-full h-48 object-cover"
                                />
                                <CardContent className="p-6">
                                    <h2 className="text-2xl sm:text-3xl font-semibold">
                                        {i === 0 ? "Dashboard" :
                                            i === 1 ? "Settings" :
                                                "Controller"}
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {i === 0 ? "Check and track progress of operations." :
                                            i === 1 ? "Specify walker device data." :
                                                "Remotely control operations."}
                                    </p>
                                    <Link to={i === 0 ? "/dashboard" :
                                        i === 1 ? "/setting" :
                                            "/control"}
                                        className="mt-4 text-blue-500 hover:text-blue-700">
                                        Go to page
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default Home;

