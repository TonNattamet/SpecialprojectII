// ActiveTimeChart.jsx
import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const colors = {
  Morning: "#74ACFF",
  Afternoon: "#F4B8FF",
  Evening: "#FFC882",
};

const ActiveTimeChart = ({ monthOffset = 0, onSummaryChange }) => {
  const [data, setData] = useState([
    { name: "Morning", value: 0 },
    { name: "Afternoon", value: 0 },
    { name: "Evening", value: 0 },
  ]);

  useEffect(() => {
    const colRef = collection(db, "Final_FeedData2");
    const q = query(colRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => doc.data());
      const now = new Date();

      const start = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 1);


      const timeSlots = {
        Morning: { distance: 0, steps: 0 },
        Afternoon: { distance: 0, steps: 0 },
        Evening: { distance: 0, steps: 0 },
      };


      all.forEach((item) => {
        const itemTime = new Date(item.timestamp.seconds * 1000);
        if (itemTime < start || itemTime >= end) return; 

        const hour = itemTime.getHours();

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

        let timePeriod = "";
        if (hour >= 5 && hour < 12) timePeriod = "Morning";
        else if (hour >= 12 && hour < 18) timePeriod = "Afternoon";
        else timePeriod = "Evening";

        timeSlots[timePeriod].distance += totalDistance;
        timeSlots[timePeriod].steps += totalSteps;
      });



      const chartData = [
        { name: "Morning", value: timeSlots.Morning.distance, steps: timeSlots.Morning.steps },
        { name: "Afternoon", value: timeSlots.Afternoon.distance, steps: timeSlots.Afternoon.steps },
        { name: "Evening", value: timeSlots.Evening.distance, steps: timeSlots.Evening.steps },
      ];


      // console.log("ข้อมูลสุดท้ายที่ใช้ใน PieChart:", chartData);

      setData(chartData);

      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const summary = chartData.map((item) => ({
        name: item.name,
        value: item.value,
        percent: total === 0 ? 0 : ((item.value / total) * 100).toFixed(0),
        color: colors[item.name],
      }));

      if (onSummaryChange) {
        onSummaryChange(summary, { startDate: start, endDate: end });
      }
    });

    return () => unsubscribe();
  }, [monthOffset, onSummaryChange]);

  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-center">
      {data.every((item) => item.value === 0) ? (
        <p className="text-gray-500 text-center">ไม่มีข้อมูล</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              dataKey="value"
            // แสดงเปอร์เซ็นของ pie chart
            // label={({ name, percent }) =>
            //   `${name} ${(percent * 100).toFixed(0)}%`
            // }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => {
                const { payload } = props;
                return [
                  `(Total_Distance: ${value.toFixed(2)} m) (Total_Steps: ${(payload.steps || 0).toFixed(0)} Steps) `,
                  
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ActiveTimeChart;
