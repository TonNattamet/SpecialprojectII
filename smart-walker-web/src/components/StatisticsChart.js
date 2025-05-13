import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const StatisticsChart = ({ offset }) => {
  const [chartData, setChartData] = useState([]);
  const [hasData, setHasData] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const colRef = collection(db, "Final_FeedData2");
    const q = query(colRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map((doc) => doc.data());
      const now = new Date();
      const start = new Date();
      start.setDate(now.getDate() - offset * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      const labels = [];
      const grouped = {};
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const day = d.getDate();
        const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
        const label = `${day} ${weekday}`;
        labels.push(label);
        grouped[label] = { distance: 0, steps: 0 };
      }

      raw.forEach((item) => {
        if (!item.timestamp) return;
        const dateObj = new Date(item.timestamp.seconds * 1000);
        if (dateObj >= start && dateObj < end) {
          const day = dateObj.getDate();
          const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const label = `${day} ${weekday}`;

          // Distance
          const distanceValues = Array.isArray(item.DistanceValue1)
            ? item.DistanceValue1.filter((v) => typeof v === "number")
            : typeof item.DistanceValue1 === "number"
              ? [item.DistanceValue1]
              : [];
          const totalDistance = distanceValues.reduce((acc, val) => acc + val, 0);

          // Steps
          const stepsValues = Array.isArray(item.StepValue2)
            ? item.StepValue2.filter((v) => typeof v === "number")
            : typeof item.StepValue2 === "number"
              ? [item.StepValue2]
              : [];
          const totalSteps = stepsValues.reduce((acc, val) => acc + val, 0);

          grouped[label].distance += totalDistance;
          grouped[label].steps += totalSteps;
        }
      });

      const filled = labels.map((label) => ({
        name: label,
        distance: grouped[label].distance || 0,
        steps: parseFloat((grouped[label].steps || 0).toFixed(0)),
      }));

      setHasData(filled.some((entry) => entry.distance > 0 || entry.steps > 0));
      setChartData(filled);
    });

    return () => unsubscribe();
  }, [offset]);

  const barSize = isMobile ? 40 : 45;

  return (
    <div style={{ position: "relative", width: "100%", height: 250 }}>
      {!hasData && (
        <p className="text-gray-500 text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-base">
          ไม่มีข้อมูล
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            angle={isMobile ? 45 : 0}
            textAnchor={isMobile ? "start" : "middle"}
            interval={0}
            height={isMobile ? 70 : 50}
          />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              if (name === "distance") return [`${value} cm`, "Distance"];
              if (name === "steps") return [`${value} steps`, "Steps"];
              return value;
            }}
          />
          <Legend />
          <Bar dataKey="distance" fill="#c084fc" barSize={barSize} name="Total Distance per Today" />
          <Bar dataKey="steps" fill="#36a2eb" barSize={barSize} name="Total Steps per Today" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatisticsChart;
