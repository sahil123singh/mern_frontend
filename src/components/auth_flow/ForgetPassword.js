import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaEnvelope } from "react-icons/fa";

import API from "../../api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        try {
            let response = await API.post("/users/forgot-password", { email });
            console.log("response==>>", response?.data?.statusCode);

            if (response?.data?.statusCode) {
                toast.success("Reset link sent to your email");
                setTimeout(() => navigate("/verify-otp", { state: { email: email } }), 1000);

                setEmail(""); // clear field
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div
                className="card p-4 shadow-lg"
                style={{ maxWidth: "400px", width: "100%", borderRadius: "15px" }}
            >
                <h3 className="text-center mb-3">Forgot Password</h3>

                <form onSubmit={submit}>
                    {/* Email Input with Icon */}
                    <div className="mb-3 position-relative">
                        <span className="input-icon"><FaEnvelope /></span>
                        <input
                            type="email"
                            className="form-control ps-5"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-warning w-100">Send Reset Link</button>
                </form>

                <div className="text-center mt-3">
                    <Link to="/login" className="small">
                        Back to Login
                    </Link>
                </div>
            </div>
            <ToastContainer position="top-right" newestOnTop />
        </div>
    );
}
