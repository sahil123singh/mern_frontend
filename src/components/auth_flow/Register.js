import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import 'react-toastify/dist/ReactToastify.css';
import '../../css/login.css';

import API from '../../api';

export default function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/', form);
      toast.success("Registered successfully. Check email for OTP.", { autoClose: 3000 });
      setTimeout(() => navigate("/verify-otp", { state: { email: form.email } }), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred", { autoClose: 3000 });
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-card shadow p-4">
        <h3 className="card-title text-center mb-4">Register</h3>

        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="mb-3 position-relative">
            <span className="input-icon"><FaUser /></span>
            <input
              type="text"
              name="firstName"
              className="form-control ps-5"
              placeholder="First Name"
              onChange={handleChange}
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-3 position-relative">
            <span className="input-icon"><FaUser /></span>
            <input
              type="text"
              name="lastName"
              className="form-control ps-5"
              placeholder="Last Name"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3 position-relative">
            <span className="input-icon"><FaEnvelope /></span>
            <input
              type="email"
              name="email"
              className="form-control ps-5"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password with toggle */}
          <div className="mb-3 position-relative">
            <span className="input-icon"><FaLock /></span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control ps-5 pe-5"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <span 
              className="toggle-password" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          <button className="btn btn-primary w-100 login-btn">Register</button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted">Already have an account? </span>
          <Link className="signup-link" to="/login">Login</Link>
        </div>
      </div>

      <ToastContainer position="top-right" newestOnTop />
    </div>
  );
}
