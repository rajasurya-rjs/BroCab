import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Components/Dashboard/Dashboard";
import LoginPage from "./Components/Pages/LoginPage";
import ForgotPasswordPage from "./Components/Pages/ForgotPasswordPage";
import SignUpPage from "./Components/Pages/SignUpPage";
import Available_rides from "./Components/Available_rides/Available_rides"; // Add this import
import Contact_us from "./Components/Contact_us/Contact_us";
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
