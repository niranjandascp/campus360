import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Issues from "./pages/Issues";
import LostFound from "./pages/LostFound";
import EventHub from "./pages/EventHub";
import MessagesPage from "./pages/MessagesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/event-hub" element={<EventHub />} />
        <Route path="/messages" element={<MessagesPage />} />
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