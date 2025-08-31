import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./components/auth_flow/Register";
import VerifyOtp from "./components/auth_flow/VerifyOtp";
import Login from "./components/auth_flow/Login";
import ForgetPassword from "./components/auth_flow/ForgetPassword";
// import ResetPassword from "./components/auth_flow/ResetPassword";
// import Dashboard from "./components/auth_flow/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        {/* <Header /> */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </BrowserRouter>
  );
}
