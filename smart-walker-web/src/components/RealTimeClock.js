import { useState, useEffect } from "react";

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูก unmount
  }, []);

  return (
    <div className="flex justify-between items-center pl-16">
      <p className="text-gray-500 text-sm">
        {currentTime.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })}
      </p>
    </div>
  );
};

export default RealTimeClock;
