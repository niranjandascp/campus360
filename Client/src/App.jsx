import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Issues from "./pages/Issues";
import LostFound from "./pages/LostFound";
import EventHub from "./pages/EventHub";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import RoomFinder from "./pages/RoomFinder";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/events" element={<EventHub />} />
        <Route path="/event-hub" element={<EventHub />} />
        <Route path="/rooms" element={<RoomFinder />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:identifier" element={<ProfilePage />} />
        <Route path="/users" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        
        {/* Backward compatibility redirects */}
        <Route path="/login" element={<Navigate to="/signin" />} />
        <Route path="/register" element={<Navigate to="/signup" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;