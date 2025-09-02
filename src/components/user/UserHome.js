import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaHome, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import API from "../../api";

export default function UserHome() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Fetch user profile
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await API.get("/users/profile");
                if (response?.data?.statusCode === 200) {
                    setUser(response.data.data);
                } else {
                    toast.error("Failed to load profile");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error fetching profile");
            }
        };

        fetchProfile();
    }, [navigate]);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logged out successfully");
        setTimeout(() => navigate("/login"), 1000);
    };

    // Helper: get profile image as circle
    const getProfileImage = () => {
        const size = 35; // diameter in px
        if (user?.userInfo?.profileImage) {
            const url = user.userInfo.profileImage.startsWith("http")
                ? user.userInfo.profileImage
                : `${API.defaults.baseURL}${user.userInfo.profileImage}`;
            return (
                <img
                    src={url}
                    alt="Profile"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        objectFit: "cover",
                        borderRadius: "50%"
                    }}
                />
            );
        }
        return <FaUserCircle size={size} />;
    };

    return (
        <div className="vh-100 d-flex flex-column">
            {/* Navbar */}
            <nav className="navbar navbar-dark bg-primary px-3 d-flex justify-content-between">
                <span className="navbar-brand d-flex align-items-center">
                    <FaHome className="me-2" /> User Home
                </span>

                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-light btn-sm d-flex align-items-center p-0"
                        onClick={() => navigate("/profile")}
                        style={{ borderRadius: "50%" }}
                    >
                        {getProfileImage()}
                    </button>

                    <button className="btn btn-danger btn-sm d-flex align-items-center" onClick={handleLogout}>
                        <FaSignOutAlt className="me-1" /> Logout
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div className="container mt-4 flex-grow-1">
                {user ? (
                    <h2>Welcome, {user.userInfo.firstName} {user.userInfo.lastName}</h2>
                ) : (
                    <p>Loading profile...</p>
                )}

                <div className="row mt-4">
                    {/* Quick Action */}
                    <div className="col-md-4 mb-3">
                        <div className="card shadow p-3">
                            <h5>Quick Action</h5>
                            <p className="text-muted">Update your profile details</p>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate("/profile")}>
                                Go to Profile
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="col-md-4 mb-3">
                        <div className="card shadow p-3">
                            <h5>Messages</h5>
                            <p className="text-muted">Check system notifications</p>
                            <button className="btn btn-warning btn-sm">View Messages</button>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="col-md-4 mb-3">
                        <div className="card shadow p-3">
                            <h5>Settings</h5>
                            <p className="text-muted">Manage account settings</p>
                            <button className="btn btn-success btn-sm">Go to Settings</button>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" newestOnTop />
        </div>
    );
}
