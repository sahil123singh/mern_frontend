import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/login.css';

import API from '../../api';

export default function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
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
          <div className="mb-3">
            <input
              type="text"
              name="firstName"
              className="form-control"
              placeholder="First Name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="lastName"
              className="form-control"
              placeholder="Last Name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Password"
              onChange={handleChange}
              required
            />
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
