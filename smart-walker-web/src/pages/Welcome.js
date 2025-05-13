import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const audio = new Audio('/sounds/Welcome.mp3');
    audio.volume = 0.5; // ปรับระดับเสียงได้ตามใจ
    audio.play().catch(err => {
      console.warn('ไม่สามารถเล่นเสียงได้:', err);
    });
  
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    const navigateTimer = setTimeout(() => {
      navigate('/home');
    }, 3500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden font-mono">
      {/* เอฟเฟกต์ scan line */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan z-0 pointer-events-none" />

      {/* จุด background sci-fi */}
      <div className="absolute w-full h-full bg-black opacity-30 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#glow)" />
        </svg>
      </div>

      {/* เนื้อหาหลัก */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="sci-fi-welcome"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="z-10 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-6xl text-cyan-400 font-bold tracking-widest neon-text drop-shadow-[0_0_10px_#0ff]"
            >
              SWS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-4 text-lg text-gray-300"
            >
              Welcome to<br />
              Smart Walker System
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* เส้นพลังงานแนวนอน */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 blur-sm"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};

export default Welcome;
