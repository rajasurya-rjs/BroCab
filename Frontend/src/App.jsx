import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Components/Dashboard/Dashboard";
import LoginPage from "./Components/Pages/LoginPage";
import ForgotPasswordPage from "./Components/Pages/ForgotPasswordPage";
import SignUpPage from "./Components/Pages/SignUpPage";
import Available_rides from "./Components/Available_rides/Available_rides";
import Contact_us from "./Components/Contact_us/Contact_us";
import Privileges from "./Components/Privileges/Privileges";
import Notifications from "./Components/Notifications/Notifications"; // Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/available-rides" element={<Available_rides />} />
        <Route path="/contact-us" element={<Contact_us />} />
        <Route path="/privileges" element={<Privileges />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
