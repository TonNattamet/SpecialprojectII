// components/VoiceRecognition.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa"; // ไอคอนไมล์จาก react-icons

const VoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [, setCommand] = useState("");
    const navigate = useNavigate();
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "th-TH";  // รองรับภาษาไทย

        recognitionInstance.onstart = () => setIsListening(true);
        recognitionInstance.onend = () => setIsListening(false);
        recognitionInstance.onresult = (event) => {
            const spokenCommand = event.results[0][0].transcript.toLowerCase();
            setCommand(spokenCommand);
            if (spokenCommand.includes("dashboard") || spokenCommand.includes("แดชบอร์ด")) {
                playNavigationSound();
                navigate("/dashboard");
            } else if (spokenCommand.includes("setting") || spokenCommand.includes("ตั้งค่า")) {
                playNavigationSound();
                navigate("/setting");
            } else if (spokenCommand.includes("controller") || spokenCommand.includes("ควบคุม")) {
                playNavigationSound();
                navigate("/control");
            } else if (spokenCommand.includes("profile") || spokenCommand.includes("ข้อมูลส่วนตัว")) {
                playNavigationSound();
                navigate("/profile");
            } else if (spokenCommand.includes("connect") || spokenCommand.includes("เชื่อมต่อ")) {
                playNavigationSound();
                navigate("/connect");
            } else if (spokenCommand.includes("notification") || spokenCommand.includes("แจ้งเตือน")) {
                playNavigationSound();
                navigate("/notification");
            }
            else {
                speakResponse("โปรดระบุชื่อหน้าที่ต้องการไป");
            }
        };

        setRecognition(recognitionInstance);
    }, [navigate]);

    const toggleListening = () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    // ฟังก์ชันเพื่อให้ระบบพูดตอบกลับ
    const speakResponse = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utterance);
    };

    const playNavigationSound = () => {
        const audio = new Audio("/sounds/next-page.mp3");
        audio.play();
    };

    return (
        <div className="fixed bottom-10 right-10 z-50">
            <button
                onClick={toggleListening}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isListening ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                    }`}
            >
                {isListening ? (
                    <FaMicrophone className="text-white text-3xl" />
                ) : (
                    <FaMicrophoneSlash className="text-white text-3xl" />
                )}
            </button>
        </div>
    );
};

export default VoiceRecognition;
