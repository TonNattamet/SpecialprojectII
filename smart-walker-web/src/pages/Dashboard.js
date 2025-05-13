import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbarlog";
import Header from '../components/Header';
import StatisticsChart from "../components/StatisticsChart";
import { FaHeartbeat, FaRoute, FaSpinner } from "react-icons/fa";
import { IoFootstepsSharp } from "react-icons/io5";
import useCheckUser from "../hooks/Checklogin";
import Moblie from "../hooks/MoblieMenu";
import DeviceNotFound from "../components/DeviceCheck";

import '../styles/Dashboard.css';
import ActiveTimeChart from "../components/ActiveTimeChart";
import LineChartCard from "../components/LineChartCard";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const Dashboard = () => {
  const user = useCheckUser();
  const isMobile = Moblie();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rawData, setRawData] = useState([]);

  const [statisticsOffset, setStatisticsOffset] = useState(0);
  const [activeTimeOffset, setActiveTimeOffset] = useState(0);

  const [heartRateChartData, setHeartRateChartData] = useState([]);
  const [distanceChartData, setDistanceChartData] = useState([]);
  const [stepsChartData, setStepsChartData] = useState([]);

  const [heartrate, setHeartrate] = useState("--");
  const [distance, setDistance] = useState("--");
  const [steps, setSteps] = useState("--");

  const [activeTimeSummary, setActiveTimeSummary] = useState([
    { name: "กำลังโหลด", color: "#74ACFF" },
    { name: "กำลังโหลด", color: "#F4B8FF" },
    { name: "กำลังโหลด", color: "#FFC882" }
  ]);

  const maxOffset = 10;

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getMonthName(offset) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - offset);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = date.getMonth();
    const year = date.getFullYear();
    const daysInMonth = getDaysInMonth(year, month);
    return `From 1-${daysInMonth} ${monthNames[month]}, ${year}`;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const q = query(collection(db, "Final_FeedData2"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map(doc => doc.data());

      setRawData(all);
    });
    return () => unsubscribe();
  }, []);


  
  useEffect(() => {
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - statisticsOffset * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const filtered = rawData.filter(item => {
      const time = new Date(item.timestamp.seconds * 1000);
      return time >= start && time < end;
    });

    const sorted = [...filtered].sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

    const heartRateData = [];
    const distanceData = [];
    const stepsData = [];

    sorted.forEach(item => {
      const timestamp = new Date(item.timestamp.seconds * 1000).toLocaleDateString("en-GB");
      if (typeof item.Heart_RateValue2 === "number") {
        heartRateData.push({ date: timestamp, value: item.Heart_RateValue2 });
      }
      if (typeof item.DistanceValue1 === "number") {
        distanceData.push({ date: timestamp, value: item.DistanceValue1 });
      }
      if (typeof item.StepValue2 === "number") {
        stepsData.push({ date: timestamp, value: item.StepValue2 });
      }
    });

    setHeartRateChartData(heartRateData);
    setDistanceChartData(distanceData);
    setStepsChartData(stepsData);

    const latestavgHeartEntry = [...sorted].reverse().find(
      item => typeof item.Heart_RateValue2 === "number"
    );

    const latestDistEntry = [...sorted].reverse().find(
      item => typeof item.DistanceValue1 === "number"
    );
    const latestStepEntry = [...sorted].reverse().find(
      item => typeof item.StepValue2 === "number"
    );

    const latesavgHeart = latestavgHeartEntry
      ? latestavgHeartEntry.Heart_RateValue2.toFixed(0)
      : "--";

    const latestDist = latestDistEntry
      ? latestDistEntry.DistanceValue1.toFixed(0)
      : "--";

    const totalSteps = latestStepEntry
      ? latestStepEntry.StepValue2.toFixed(0)
      : "--";


    setHeartrate(latesavgHeart);
    setDistance(latestDist);
    setSteps(totalSteps);
  }, [statisticsOffset, rawData]);


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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 px-4 w-full">

          {/* Heart Rate */}
          <div className="dashboard-card heart-rate-card sm:col-span-2 sm:row-span-2">
            <div className="dashboard-icon"><FaHeartbeat /></div>
            <h2>Heart Rate</h2>
            <p>{heartrate} <span className="dashboard-unit">bpm</span></p>
            <span className="status-label">Present</span>
            <LineChartCard data={heartRateChartData} strokeColor="#f87171" gradientId="colorHeart" />
          </div>

          {/* Distance */}
          <div className="dashboard-card distance-card sm:col-span-2 sm:row-span-2">
            <div className="dashboard-icon"><FaRoute /></div>
            <h2>Distance</h2>
            <p>{distance} <span className="dashboard-unit">m</span></p>
            <span className="status-label">Present</span>
            <LineChartCard data={distanceChartData} strokeColor="#c084fc" gradientId="colorDistance" />
          </div>

          {/* Steps */}
          <div className="dashboard-card steps-card sm:col-span-2 sm:row-span-2">
            <div className="dashboard-icon"><IoFootstepsSharp /></div>
            <h2>Steps</h2>
            <p>{steps} <span className="dashboard-unit">once</span></p>
            <span className="status-label">Present</span>
            <LineChartCard data={stepsChartData} strokeColor="#38bdf8" gradientId="colorSteps" />
          </div>

          {/* Active Time */}
          <div className="dashboard-card active-time-card sm:col-span-6 sm:row-span-6 sm:col-start-7">
            <div className="dashboard-time">
              <h3>Active Time</h3>
            </div>
            <span className="dashboard-time text-sm">
              <select
                className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1 shadow-sm"
                value={activeTimeOffset}
                onChange={(e) => setActiveTimeOffset(parseInt(e.target.value, 10))}
              >
                {[...Array(6)].map((_, i) => (
                  <option key={i} value={i}>
                    {getMonthName(i)}
                  </option>
                ))}
              </select>
            </span>
            <ActiveTimeChart
              monthOffset={activeTimeOffset}
              onSummaryChange={setActiveTimeSummary}
            />
            <div className="pie-legend mt-4 flex flex-row justify-around text-sm">
              {activeTimeSummary.map((entry, index) => (
                <div key={index} className="legend-item flex items-center gap-2">
                  <span className="circle inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.name} ({entry.percent}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Header */}
          <div className="sm:col-span-6 sm:row-span-2 sm:col-start-1 sm:row-start-3 text-gray-500 text-[30px] font-[400]">
            Statistics
          </div>

          {/* Weekly Distance */}
          <div className="dashboard-card weekly-distance-card sm:col-span-6 sm:row-span-2 sm:col-start-1 sm:row-start-5">
            <div className="relative mb-2 mr-auto">
              <button
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between px-4 py-2 text-lg font-semibold text-gray-700 hover:bg-gray-200 rounded-md"
              >
                <span>Weekly Distance</span>
                <span className={`text-gray-500 transform transition-all duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
                  {isDropdownOpen ? "▲" : "⏷"}
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg w-64 max-h-60 overflow-y-auto">
                  {[...Array(maxOffset + 1).keys()].map((i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setStatisticsOffset(i);
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${statisticsOffset === i ? "bg-gray-100 font-semibold" : ""}`}
                    >
                      ({i * 7} วันที่ผ่านมา)
                    </button>
                  ))}


                </div>
              )}
            </div>

            <StatisticsChart offset={statisticsOffset} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
