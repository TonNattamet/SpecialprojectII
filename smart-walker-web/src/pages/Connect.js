import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbarlog";
import Header from "../components/Header";
import { FaCheckCircle, FaTimes, FaSpinner } from "react-icons/fa";
import useCheckUser from "../hooks/Checklogin";
import Moblie from "../hooks/MoblieMenu";
import DeviceNotFound from "../components/DeviceCheck";

const DEVICES = [
    { id: "0e01f7ba-ce71-4f50-ba2c-88004562dea5", token: "915y5BmnrCoP5kNn7M16TpxGxSneWyB2", name: "Device 1" },
    { id: "2aa9bed5-8390-48f8-ae74-ce8e298a45d7", token: "eUssr683Dsh6R9YeBs8XE4TbZ2jBwWVC", name: "Device 2" }
];

const API_URL = "https://api.netpie.io/v2/device/status";

const Connect = () => {
    const user = useCheckUser();
    const isMobile = Moblie();
    const [deviceStatuses, setDeviceStatuses] = useState({});
    const [loading, setLoading] = useState(true);
    


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
    }, []);

    const renderConnectionStatus = (isConnected, loading) => {
        if (loading) {
            return <FaSpinner className="text-gray-500 text-4xl animate-spin" />;
        }
        return isConnected
            ? <FaCheckCircle className="text-green-500 text-4xl" />
            : <FaTimes className="text-red-500 text-4xl" />;
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
                <div className="flex flex-col items-center justify-center space-y-12 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                        {DEVICES.map((device) => (
                            <div key={device.id} className="flex flex-col items-center bg-white shadow-lg p-6 rounded-xl">
                                <img src="/images/devices.png" alt={device.name} className="w-28 h-28 md:w-40 md:h-40" />
                                <p className="mt-4 text-lg font-semibold">{device.name}</p>
                                {renderConnectionStatus(deviceStatuses[device.id], loading)}
                                <img src="/images/MQTT.png" alt="MQTT" className="w-28 h-10 md:w-40 md:h-10 mt-4" />
                                <button
                                    className={`mt-6 px-6 py-3 rounded-lg text-lg font-semibold shadow transition ${deviceStatuses[device.id] ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                        }`}
                                >
                                    {deviceStatuses[device.id] ? "Connected" : "Not Connected"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Connect;