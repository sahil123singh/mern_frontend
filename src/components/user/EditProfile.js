import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import Header from "../Header"; // ✅ Import Header

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImage: ""
  });

  const calledRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const fetchProfile = async () => {
      try {
        const response = await API.get("/users/profile");
        if (response?.data?.statusCode === 200) {
          const userData = response.data.data;
          setUser(userData);
          setFormData({
            firstName: userData?.userInfo.firstName,
            lastName: userData?.userInfo.lastName,
            email: userData?.email,
            profileImage: userData?.userInfo.profileImage || ""
          });
        } else {
          toast.error("Failed to fetch profile");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error loading profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append("file", file);
    try {
      const res = await API.post("/users/uploads", imgData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.statusCode === 200) {
        setFormData((prev) => ({ ...prev, profileImage: res?.data?.data?.fileUrl }));
        toast.success("Photo uploaded!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error uploading photo");
    }
  };

  const handleSave = async () => {
    try {
      let payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      if (formData?.profileImage) {
        payload.profileImage = formData?.profileImage;
      }
      const res = await API.put("/users/", payload);
      if (res?.data?.statusCode === 200) {
        toast.success("Profile updated successfully!");
        setUser({ ...user, ...formData });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    }
  };

  if (!user) return <p className="text-center mt-4">Loading profile...</p>;

  return (
    <div className="d-flex flex-column">
      <Header />
      <div className="container my-5 custom-mobile-container">
        <div className="card shadow-lg rounded-4 border-0 p-4 mt-4 custom-mobile-card">
          <div className="row">
            {/* Left: Profile Photo */}
            <div className="col-md-4 text-center mb-4">
              <div className="position-relative d-inline-block">
                {formData.profileImage ? (
                  <img
                    src={formData?.profileImage}
                    alt="Profile"
                    className="rounded-circle border shadow"
                    style={{ width: "200px", height: "200px", objectFit: "cover" }}
                  />
                ) : (
                  <FaUserCircle size={200} className="text-secondary" />
                )}

                {/* Always show edit photo */}
                <label
                  htmlFor="upload-photo"
                  className="position-absolute bottom-0 end-0 bg-white rounded-circle p-2 shadow"
                  style={{ cursor: "pointer" }}
                >
                  <FaEdit color="orange" />
                </label>
                <input
                  type="file"
                  id="upload-photo"
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
              </div>
              <h5 className="mt-3 fw-semibold">
                {formData.firstName} {formData.lastName}
              </h5>
            </div>

            {/* Right: Form Fields */}
            <div className="col-md-8">
              <div className="mb-3">
                <label className="form-label fw-bold">First Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  name="firstName"
                  value={formData?.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Last Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  name="lastName"
                  value={formData?.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg rounded-3"
                  name="email"
                  value={formData?.email}
                  disabled
                />
              </div>

              {/* Save Button */}
              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-warning px-4 rounded-pill" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>

  );
}
