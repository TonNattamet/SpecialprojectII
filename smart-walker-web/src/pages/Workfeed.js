// src/pages/Workfeed.js
import React, { useEffect, useState } from "react";

const deviceId = "0e01f7ba-ce71-4f50-ba2c-88004562dea5";
const deviceToken = "915y5BmnrCoP5kNn7M16TpxGxSneWyB2";

const Workfeed = () => {
  const [dataList, setDataList] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const body = {
      start_relative: { value: 1, unit: "minutes" },
      metrics: [
        {
          name: deviceId,
          tags: { attr: ["Distance1", "ID_Distance1"] },
          limit: 50,
        },
      ],
    };

    try {
      const res = await fetch(
        "https://api.netpie.io/v2/feed/api/v1/datapoints/query",
        {
          method: "POST",
          headers: {
            Authorization: `Device ${deviceId}:${deviceToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      const results = data.queries[0]?.results || [];

      let distances = [];
      let ids = [];

      results.forEach((result) => {
        const attr = result.tags?.attr?.[0];
        result.values.forEach(([timestamp, value]) => {
          if (attr === "Distance1") {
            distances.push({ timestamp, value });
          } else if (attr === "ID_Distance1") {
            ids.push({ timestamp, value });
          }
        });
      });

      const combined = distances
        .map((dist, index) => {
          const match = ids[index];
          return match
            ? {
                distance: dist.value,
                id: match.value,
                time: new Date(dist.timestamp).toLocaleTimeString(),
              }
            : null;
        })
        .filter((item) => item !== null);

      combined.sort((a, b) => b.time.localeCompare(a.time));
      setDataList(combined);
      setError("");
    } catch (e) {
      console.error("Error fetching:", e);
      setError("❌ เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-4">📏 ข้อมูลล่าสุดจาก NETPIE</h2>
      {error ? (
        <div className="text-red-600">{error}</div>
      ) : dataList.length === 0 ? (
        <div>กำลังโหลด...</div>
      ) : (
        <div className="space-y-2">
          {dataList.map((item, index) => (
            <div key={index}>
              • 📏 Distance: <b>{item.distance}</b> cm | 🆔 ID: <b>{item.id}</b> @{" "}
              {item.time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workfeed;
