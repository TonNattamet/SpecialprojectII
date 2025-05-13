import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Setting from "./pages/setting";
import Control from "./pages/Control";
import Home from "./pages/Home";
import Connect from "./pages/Connect";
import Admin from "./pages/Admin";
import Welcome from './pages/Welcome';

import { Notification } from "./pages/Notification";

import { NotificationProvider } from "./context/Noti_context";

import { Route, Routes } from 'react-router-dom';
import { Navigate } from "react-router-dom";

export default function App() {
  return (
    <div>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/control" element={<Control />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/home" element={<Home />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </NotificationProvider>
    </div>
  )
}

