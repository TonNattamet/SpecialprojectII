import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbarlog";
import Header from "../components/Header";
import { FaSpinner, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaPause } from "react-icons/fa";
import useCheckUser from "../hooks/Checklogin";
import Moblie from "../hooks/MoblieMenu";
import DeviceNotFound from "../components/DeviceCheck";
import Swal from 'sweetalert2';

const Control = () => {
  const user = useCheckUser();
  const isMobile = Moblie();
  const [status, setStatus] = React.useState("--");
  const [lastCommand, setLastCommand] = React.useState(null);


  const DEVICES = React.useMemo(() => [
    { id: "0e01f7ba-ce71-4f50-ba2c-88004562dea5", token: "915y5BmnrCoP5kNn7M16TpxGxSneWyB2", name: "Device 1" },
    { id: "2aa9bed5-8390-48f8-ae74-ce8e298a45d7", token: "eUssr683Dsh6R9YeBs8XE4TbZ2jBwWVC", name: "Device 2" }
  ], []);

  const [deviceStatuses, setDeviceStatuses] = React.useState({});
  const [, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDeviceStatus = async () => {
      setLoading(true);
      let statuses = {};
      await Promise.all(DEVICES.map(async (device) => {
        try {
          const response = await fetch("https://api.netpie.io/v2/device/status", {
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

  const sendMQTTMessage = async (command) => {

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

    if (command === lastCommand) {
      setStatus(`❌ คำสั่ง "${command}" ถูกส่งไปแล้ว`);
      return;
    }

    const CLIENT_ID = "0e01f7ba-ce71-4f50-ba2c-88004562dea5";
    const TOKEN = "915y5BmnrCoP5kNn7M16TpxGxSneWyB2";
    const API_URL = "https://api.netpie.io/v2/device/message?topic=webcontrol";

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Device ${CLIENT_ID}:${TOKEN}`,
          "Content-Type": "text/plain",
        },
        body: command,
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      setTimeout(() => setLastCommand(null), 3000);
      setLastCommand(command);
      setStatus(`✅ คำสั่งที่ส่ง: ${command}`);
    } catch (error) {
      console.error("Error:", error);
      setStatus("❌ มีข้อผิดพลาดในการส่งคำสั่ง");
    }
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

        <div className="text-center mt-8 mb-4 font-semibold text-gray-700">
          <span>สถานะ:</span> <span className={`ml-2 ${status.startsWith("❌") ? "text-red-500" : "text-green-600"}`}>{status}</span>
        </div>

        {/* Control Panel 🎮 */}
        <div className="flex flex-col items-center mt-6 space-y-6 sm:space-y-10">
          {/* Forward */}
          <button
            onClick={() => sendMQTTMessage("FORWARD")}
            className="bg-black text-white p-6 sm:p-12 rounded-full shadow-lg hover:bg-gray-700 transition"
          >
            <FaArrowUp size={24} className="sm:size-6" />
          </button>

          {/* Left - Pause - Right */}
          <div className="flex gap-6 sm:gap-12 justify-center items-center">
            <button
              onClick={() => sendMQTTMessage("LEFT")}
              className="bg-black text-white p-6 sm:p-12 rounded-full shadow-lg hover:bg-gray-700 transition"
            >
              <FaArrowLeft size={24} className="sm:size-6" />
            </button>

            <button
              onClick={() => sendMQTTMessage("STOP")}
              className="bg-black text-white p-6 sm:p-12 rounded-full shadow-lg hover:bg-gray-700 transition"
            >
              <FaPause size={24} className="sm:size-6" />
            </button>

            <button
              onClick={() => sendMQTTMessage("RIGHT")}
              className="bg-black text-white p-6 sm:p-12 rounded-full shadow-lg hover:bg-gray-700 transition"
            >
              <FaArrowRight size={24} className="sm:size-6" />
            </button>
          </div>

          {/* Backward */}
          <button
            onClick={() => sendMQTTMessage("BACKWARD")}
            className="bg-black text-white p-6 sm:p-12 rounded-full shadow-lg hover:bg-gray-700 transition"
          >
            <FaArrowDown size={24} className="sm:size-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Control;
