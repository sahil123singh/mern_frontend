import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEnvelope, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import 'react-toastify/dist/ReactToastify.css';
import '../../css/login.css';

import API from '../../api';

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post("/users/login", form);
            if (response?.data?.statusCode === 200) {
                localStorage.setItem("token", response?.data?.data?.token);
                localStorage.setItem("userId", response?.data?.data?.id);
                toast.success("Login successful!", { autoClose: 3000 });
                setTimeout(() => navigate("/home"), 1000);
            }
        } catch (error) {
            console.log('error======>>', error?.response?.data)
            toast.error(error.response?.data?.message || "Invalid credentials", { autoClose: 3000 });
        }
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center">
            <div className="login-card shadow p-4">
                <h3 className="card-title text-center mb-4">Login</h3>

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
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

                    {/* Password Input */}
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

                    <button className="btn btn-primary w-100 login-btn">Login</button>
                </form>

                <div className="text-center mt-3">
                    <Link className="forgot-link" to="/forgot-password">Forgot Password?</Link>
                </div>

                <div className="text-center mt-2">
                    <span className="text-muted">Don’t have an account? </span>
                    <Link className="signup-link" to="/register">Sign Up</Link>
                </div>
            </div>

            <ToastContainer position="top-right" newestOnTop />
        </div>
    );
}
