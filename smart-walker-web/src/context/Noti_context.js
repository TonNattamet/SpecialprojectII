import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading,] = useState(true);

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
              message: `${FallStatus}`,
              time: timeStr,
              timestamp,
            });
          }
        }
      });
  
      newNotifications.sort((a, b) => (a.time < b.time ? 1 : -1));
      setNotifications(newNotifications);
    });
  
    return () => unsubscribe();
  }, []);

const removeNotification = async (id) => {
  const [docId] = id.split("-");
  await deleteDoc(doc(db, "Final_FeedData2", docId));
  setNotifications((prev) => prev.filter((n) => n.id !== id));
};

return (
  <NotificationContext.Provider value={{ notifications, loading, removeNotification }}>
    {children}
  </NotificationContext.Provider>
);
};

// hook สำหรับเรียกใช้งาน context ได้ง่าย
export const useNotifications = () => {
  return useContext(NotificationContext);
};
