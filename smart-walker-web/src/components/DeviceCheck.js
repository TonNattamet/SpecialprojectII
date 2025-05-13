// components/DeviceNotFound.js
import React from "react";
import { useNavigate } from "react-router-dom";

const DeviceNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-4 text-center">
      <h2 className="text-3xl font-semibold text-red-600 mb-4">ไม่พบข้อมูลอุปกรณ์ผู้ใช้</h2>
      <p className="text-gray-600 mb-6">กรุณาตรวจสอบการเชื่อมต่อหรือเพิ่มอุปกรณ์ในระบบ</p>

      <button
        onClick={() => navigate(-1)}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        ย้อนกลับ
      </button>
    </div>
  );
};

export default DeviceNotFound;
