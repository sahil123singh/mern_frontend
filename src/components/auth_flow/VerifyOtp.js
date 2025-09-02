import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/login.css'; // reuse existing CSS

import API from '../../api';

export default function VerifyOtp() {
    const { state } = useLocation();
    const [otp, setOtp] = useState(["", "", "", ""]);
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // only digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // move focus to next input
        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length < 4) {
            toast.error("Please enter 4-digit OTP", { autoClose: 3000 });
            return;
        }

        try {
            let response = await API.post('/users/verify', { email: state?.email, otp: otpValue });
            console.log('response=====>>', response?.data?.data?.email)
            toast.success("Verified! You can login now.", { autoClose: 3000 });
            setTimeout(() => navigate('/reset-password', { state: { email: response?.data?.data?.email } }), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error verifying OTP", { autoClose: 3000 });
        }
    };

    const handleResend = async () => {
        try {
            await API.post("/users/resend-otp", { email: state?.email });
            toast.success("OTP resent successfully!", { autoClose: 3000 });
        } catch (err) {
            toast.error(err.response?.data?.message || "Error resending OTP", { autoClose: 3000 });
        }
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center">
            <div className="login-card shadow p-4">
                <h3 className="card-title text-center mb-4">Verify OTP</h3>

                <form onSubmit={handleVerify}>
                    <div className="d-flex justify-content-between mb-3 otp-container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                className="form-control text-center otp-input"
                                maxLength={1}
                                value={digit}
                                ref={el => inputRefs.current[index] = el}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                required
                            />
                        ))}
                    </div>

                    <button type="submit" className="btn btn-success w-100 mb-2">Verify</button>
                    <button type="button" className="btn btn-link w-100" onClick={handleResend}>Resend OTP</button>
                </form>

                <div className="text-center mt-3">
                    <span className="text-muted">Back to </span>
                    <Link className="signup-link" to="/login">Login</Link>
                </div>
            </div>

            <ToastContainer position="top-right" newestOnTop />
        </div>
    );
}
