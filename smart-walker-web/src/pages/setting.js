import React, { useEffect, useState,useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbarlog";
import Header from '../components/Header';
import { FaSpinner, FaShoePrints, FaRegClock, FaMapMarkerAlt } from "react-icons/fa";
import useCheckUser from "../hooks/Checklogin";
import Moblie from "../hooks/MoblieMenu";
import DeviceNotFound from "../components/DeviceCheck";
import Swal from 'sweetalert2';

const Setting = () => {
    const isMobile = Moblie();
    const user = useCheckUser();

    const [speed, setSpeed] = useState("200");
    const [delay, setDelay] = useState("2");
    const [distance, setDistance] = useState("20");
    const [statusMsg, setStatusMsg] = useState("");

    const settings = [
        {
            title: "Speed",
            description: "Description of Speed",
            min: "200 PWM",
            max: "255 PWM",
            suggestion: "200 PWM",
            options: ["200", "210", "220", "230", "240", "255"],
            icon: <FaShoePrints className="text-4xl text-red-500" />,
            color: "bg-yellow-100",
            state: speed,
            setState: setSpeed
        },
        {
            title: "Delay",
            description: "Description of Delay",
            min: "1 Sec.",
            max: "5 Sec.",
            suggestion: "2 Sec.",
            options: ["1", "2", "3", "4", "5"],
            icon: <FaRegClock className="text-4xl text-blue-500" />,
            color: "bg-blue-100",
            state: delay,
            setState: setDelay
        },
        {
            title: "Distance",
            description: "Description of Distance",
            min: "10 m",
            max: "50 m",
            suggestion: "20 m",
            options: ["10", "20", "30", "40", "50"],
            icon: <FaMapMarkerAlt className="text-4xl text-purple-500" />,
            color: "bg-purple-100",
            state: distance,
            setState: setDistance
        },
    ];

    const DEVICES = useMemo(() => [
        { id: "0e01f7ba-ce71-4f50-ba2c-88004562dea5", token: "915y5BmnrCoP5kNn7M16TpxGxSneWyB2", name: "Device 1" },
        { id: "2aa9bed5-8390-48f8-ae74-ce8e298a45d7", token: "eUssr683Dsh6R9YeBs8XE4TbZ2jBwWVC", name: "Device 2" }
    ], []);

    const API_URL = "https://api.netpie.io/v2/device/status";

    const [deviceStatuses, setDeviceStatuses] = useState({});
    const [, setLoading] = useState(true);


    useEffect(() => {
        const fetchDeviceStatus = async () => {
            setLoading(true);
            let statuses = {};
            await Promise.all(DEVICES.map(async (device) => {
                try {
                    const response = await fetch(API_URL, {
                        method: 'GET',
                        headers: { "Authorization": `Device ${device.id}:${device.token}` }
                    });
                    if (!response.ok) throw new Error("Unauthorized");
                    const data = await response.json();
                    statuses[device.id] = data.status === 1;
                } catch (error) {
                    console.error(`Error fetching ${device.name} status:`, error);
                    statuses[device.id] = false;
                }
            }));
            setDeviceStatuses(statuses);
            setLoading(false);
        };

        fetchDeviceStatus();
    }, [DEVICES]);

    const submitSetup = () => {
        const isAnyDeviceConnected = Object.values(deviceStatuses).some(status => status === true);
        if (!isAnyDeviceConnected) {
            Swal.fire({
                title: 'อุปกรณ์ไม่เชื่อมต่อ',
                text: 'ยังไม่มีการเชื่อมต่อกับอุปกรณ์ กรุณาตรวจสอบการเชื่อมต่อ',
                imageUrl: '/images/disconnect.gif',
                imageWidth: 200,
                imageHeight: 200,
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        const CLIENT_ID = "0e01f7ba-ce71-4f50-ba2c-88004562dea5";
        const TOKEN = "915y5BmnrCoP5kNn7M16TpxGxSneWyB2";
        const API_URL = "https://api.netpie.io/v2/device/message?topic=websetting";

        const setupCommand = `SETUP|SPEED:${speed}|DELAY:${delay}|DISTANCE:${distance}`;

        fetch(API_URL, {
            method: 'PUT',
            headers: {
                "Authorization": `Device ${CLIENT_ID}:${TOKEN}`,
                "Content-Type": "text/plain"
            },
            body: setupCommand
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                setStatusMsg(` ส่งคำสั่งสำเร็จ: ${setupCommand}`);
            })
            .catch(error => {
                console.error("Error:", error);
                setStatusMsg(" เกิดข้อผิดพลาดในการส่งคำสั่ง");
            });
    };

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <FaSpinner className="text-gray-500 text-6xl animate-spin" />
                <p>กำลังโหลดข้อมูล</p>
            </div>

        );
    }

    if (!user?.deviceID1 && !user?.deviceID2) {
        return <DeviceNotFound />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {isMobile ? <Navbar className="fixed top-0 w-full" /> : <Sidebar />}
            <div className={`p-4 w-full sm:pl-32 ${isMobile ? "pt-20" : ""}`}>
                <Header />

                <div className="flex flex-col items-center bg-gray-50 p-8 sm:p-4 mt-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                        {settings.map((item, index) => (
                            <div key={index} className="bg-white shadow-md rounded-lg p-4">
                                <div className={`p-3 rounded-full inline-block ${item.color}`}>{item.icon}</div>
                                <h3 className="text-2xl font-semibold mt-2">{item.title}</h3>
                                <p className="text-lg text-gray-600">{item.description}</p>
                                {item.min && <p className="text-sm text-gray-500">Min: {item.min}</p>}
                                {item.max && <p className="text-sm text-gray-500">Max: {item.max}</p>}
                                {item.suggestion && <p className="text-sm text-gray-500">Suggestion: {item.suggestion}</p>}
                                {item.options ? (
                                    <select
                                        className="mt-2 w-full border rounded p-2 text-sm"
                                        value={item.state}
                                        onChange={(e) => item.setState(e.target.value)}
                                    >
                                        {item.options.map((option, i) => (
                                            <option key={i} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="mt-2">
                                        {item.buttons?.map((btn, i) => (
                                            <button key={i} className={`w-full mt-2 p-2 rounded ${btn.className}`}>{btn.text}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={submitSetup}
                        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md w-full sm:w-auto"
                    >
                        SUBMIT
                    </button>

                    <div className="mt-4 text-center text-sm text-green-600">{statusMsg}</div>

                </div>
            </div>
        </div>
    );
};

export default Setting;
