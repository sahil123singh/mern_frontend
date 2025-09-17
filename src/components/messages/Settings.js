import { useState } from "react";
import { FaSignOutAlt, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Header from "../Header";

export default function Settings() {
  const navigate = useNavigate();

  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem("isActive") === "true";
  });

  const handleToggleActive = () => {
    const newActiveStatus = !isActive;
    setIsActive(newActiveStatus);
    localStorage.setItem("isActive", newActiveStatus);
    toast.info(`User is now ${newActiveStatus ? "Active" : "Inactive"}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/login"), 800);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <div className="container my-5">
        <h2 className="text-center mb-5 fw-bold" style={{ color: "#6a11cb" }}>
          Settings
        </h2>

        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7 col-sm-10">

            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 d-flex flex-column gap-4">

                {/* Active / Inactive Toggle */}
                <button
                  className={`btn d-flex align-items-center justify-content-between p-3 rounded-3 shadow-sm text-white`}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #00c853, #b2ff59)"
                      : "linear-gradient(135deg, #9e9e9e, #bdbdbd)",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                  }}
                  onClick={handleToggleActive}
                >
                  <span className="d-flex align-items-center">
                    {isActive ? <FaToggleOn className="me-2" /> : <FaToggleOff className="me-2" />}
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <span className={`badge ${isActive ? "bg-success" : "bg-secondary"} px-3 py-2`}>
                    {isActive ? "Online" : "Offline"}
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  className="btn d-flex align-items-center justify-content-center p-3 rounded-3 shadow-sm text-white"
                  style={{
                    background: "linear-gradient(135deg, #ff3d00, #ff6e40)",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                  }}
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-2" /> Logout
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 768px) {
          .card-body button {
            font-size: 1rem;
            padding: 0.8rem;
          }
        }
        @media (max-width: 480px) {
          h2 {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
