import {
  FaMoon,
  FaSun,
  FaHeart,
  FaPlus,
  FaList,
  FaUserCircle,
  FaFacebookMessenger,
  FaCog,
  FaHome,
  FaBell,
  FaRegBell,
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import API from "../api";
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [isCollapsed, setIsCollapsed] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const response = await API.get("/users/profile");
        if (response?.data?.statusCode === 200) setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-theme");
    else document.body.classList.remove("dark-theme");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const getProfileImage = () => {
    const size = 35;
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
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      );
    } else {

      return <FaUserCircle size={size} />;
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center ${isActive ? "active" : ""}`;

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);

  return (
    <nav
      className="navbar navbar-expand-md navbar-dark app-navbar px-2 sticky-top"
      style={{ background: "linear-gradient(90deg, #4b6cb7, #182848)" }}
    >
      <div className="container-fluid d-flex align-items-center">

        {/* Left: User Profile Image + Name */}
        <div className="d-flex align-items-center me-auto">
          <button
            className="btn btn-light btn-sm d-flex align-items-center p-0 me-2"
            onClick={() => navigate("/details", {state: {userId: userId}})}
            style={{ borderRadius: "50%" }}
            aria-label="Edit Profile"
          >
            {getProfileImage()}
          </button>
          <span className="text-white fw-semibold text-truncate ms-1">
            {user?.userInfo?.firstName} {user?.userInfo?.lastName}
          </span>
        </div>


        {/* Navbar toggler for small devices */}
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
          onClick={toggleNavbar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible menu */}
        <div
          className={`collapse navbar-collapse${isCollapsed ? "" : " show"}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <NavLink to="/home" className={getNavLinkClass}>
                <FaHome className="me-1" /> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/add-post" className={getNavLinkClass}>
                <FaPlus className="me-1" /> Add Post
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/my-posts" className={getNavLinkClass}>
                <FaList className="me-1" /> My Posts
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/favourite" className={getNavLinkClass}>
                <FaHeart className="me-1" /> My Fav
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/messages" className={getNavLinkClass}>
                <FaFacebookMessenger className="me-1" /> Messages
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/notifications" className={getNavLinkClass}>
                <FaRegBell className="me-1" /> Notifications
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/settings" className={getNavLinkClass}>
                <FaCog className="me-1" /> Settings
              </NavLink>
            </li>

            <li className="nav-item">
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center"
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <>
                    <FaSun className="me-1" /> Light
                  </>
                ) : (
                  <>
                    <FaMoon className="me-1" /> Dark
                  </>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
