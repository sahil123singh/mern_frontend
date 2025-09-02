import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

import API from "../../api";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { state } = useLocation();

    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        try {
            let response = await API.post("/users/reset-password", { password, confirmPassword, email: state?.email });

            if (response?.data?.stausCode === 200) {
                toast.success("Password reset successful!");
                setPassword(""); // clear field
                setConfirmPassword(""); // clear field
                navigate("/login");
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
                <h3 className="text-center mb-3">Reset Password</h3>

                <form onSubmit={submit}>

                    <div className="mb-3 position-relative">
                        <span className="input-icon"><FaLock /></span>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control ps-5 pe-3"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >         {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>
                    </div>
                    <div className="mb-3 position-relative">
                        <span className="input-icon"><FaLock /></span>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control ps-5 pe-3"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >         {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                        </span>
                    </div>
                    <button className="btn btn-success w-100">Reset</button>
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
