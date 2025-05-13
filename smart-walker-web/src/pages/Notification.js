import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbarlog";
import Header from "../components/Header";
import { FaBell, FaTimes, FaPhoneAlt } from "react-icons/fa";
import useCheckUser from "../hooks/Checklogin";
import Moblie from "../hooks/MoblieMenu";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { FaSpinner } from "react-icons/fa";

const Notification = () => {
  const [, setUser] = useState(null);
  useCheckUser(setUser);
  const isMobile = Moblie();
  const [loading, setLoading] = useState(true);


  const [notifications, setNotifications] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;

    if (diffMs < 60000) {
      return "เมื่อสักครู่";
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const remainingMinutes = totalMinutes % 60;

    if (diffDays === 0 && totalHours === 0) {
      return `${totalMinutes} นาทีที่ผ่านมา`;
    } else if (diffDays === 0) {
      return `${remainingHours} ชั่วโมง ${remainingMinutes} นาทีที่ผ่านมา`;
    } else if (diffDays === 1) {
      return "เมื่อวาน";
    } else {
      return `${diffDays} วันที่ผ่านมา`;
    }
  };




  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Final_FeedData2"), (snapshot) => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const newNotifications = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        if (!data.timestamp) return;

        const timestamp = new Date(data.timestamp.seconds * 1000);

        if (timestamp >= startOfDay && timestamp < endOfDay) {
          const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const FallStatus = data.FallStatusValue2;
          if (FallStatus && FallStatus !== "Stable") {
            newNotifications.push({
              id: doc.id + "-fall",
              message:` ${FallStatus}`,
              time: timeStr,
              timestamp,
            });
          }
        }
      });

      newNotifications.sort((a, b) => (a.time < b.time ? 1 : -1));
      setNotifications(newNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);




  const handleRemoveNotification = async (id) => {
    setRemovingId(id);
    const [docId,] = id.split("-");
    try {
      await deleteDoc(doc(db, "Final_FeedData2", docId));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setRemovingId(null);
    }, 300);
  };




  return (
    <div className="flex min-h-screen bg-gray-50">
      {isMobile ? <Navbar className="fixed top-0 w-full" /> : <Sidebar />}
      <div className={`p-4 w-full sm:pl-32 ${isMobile ? "pt-20" : ""}`}>
        <Header />

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center text-gray-500">
              <FaSpinner className="animate-spin text-3xl" />
              <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-400 text-center">ไม่มีการแจ้งเตือนวันนี้</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`transition-all duration-300 transform
                ${removingId === notif.id ? "animate-fade-out" : "animate-fade-in-up"}
                flex flex-col lg:flex-row items-start justify-between p-4 bg-white shadow-md rounded-lg`}
              >
                <div className="flex items-center gap-4">
                  <FaBell className="text-red-500 text-2xl" />
                  <div>
                    <p className="font-semibold">Notification: {notif.message}</p>
                    <p className="text-gray-500 text-sm">{getTimeAgo(new Date(notif.timestamp))}</p>

                  </div>
                </div>
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mt-2 lg:mt-0">
                  <span className="text-gray-600">{new Date().toLocaleDateString()}</span>
                  <button className="flex items-center text-red-500 font-semibold">
                    <FaPhoneAlt className="mr-2" /> โปรดติดต่อ: 1669
                  </button>
                  <button onClick={() => handleRemoveNotification(notif.id)}>
                    <FaTimes className="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export { Notification };
