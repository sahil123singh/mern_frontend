import { useState, useEffect, useRef } from "react";
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // ✅ import navigate hook
import API from "../../api";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        profileImage: ""
    });
    const [isEditing, setIsEditing] = useState(false); // ✅ new state

    const calledRef = useRef(false);
    const navigate = useNavigate(); // ✅ initialize navigate

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

    const handleEditSave = async () => {
        if (!isEditing) {
            setIsEditing(true);
        } else {
            try {

                let payload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                }
                if (formData?.profileImage) {
                    payload.profileImage = formData?.profileImage
                }
                const res = await API.put("/users/", payload);
                if (res?.data?.statusCode === 200) {
                    toast.success("Profile updated successfully!");
                    setUser({ ...user, ...formData });
                    setIsEditing(false); // Disable editing after save

                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error updating profile");
            }
        }
    };

    if (!user) return <p className="text-center mt-4">Loading profile...</p>;

    return (
        <div className="container mt-5">
            <h3 className="mb-4">Edit Profile</h3>
            <div className="row">
                {/* Left Section */}
                <div className="col-md-4 text-center mb-4">
                    <div className="position-relative d-inline-block">
                        {formData.profileImage ? (
                            <img
                                src={formData?.profileImage}
                                alt="Profile"
                                className="rounded-4 shadow img-fluid"
                                style={{ maxWidth: "250px", height: "auto", objectFit: "cover" }}
                            />
                        ) : (
                            <FaUserCircle
                                size={250}
                                className="text-secondary"
                                style={{ borderRadius: "50%" }}
                            />
                        )}

                        {isEditing && (
                            <>
                                <label
                                    htmlFor="upload-photo"
                                    className="position-absolute top-0 end-0 bg-white rounded-circle p-2 shadow"
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
                            </>
                        )}

                    </div>
                    <h5 className="mt-3">
                        {formData.firstName} {formData.lastName}
                    </h5>
                </div>

                {/* Right Section */}
                <div className="col-md-8">
                    <div className="mb-3">
                        <label className="form-label fw-bold">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={formData?.firstName}
                            onChange={handleChange}
                            disabled={!isEditing} // ✅ disable if not editing

                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={formData?.lastName}
                            onChange={handleChange}
                            disabled={!isEditing} // ✅ disable if not editing

                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData?.email}
                            disabled
                        />
                    </div>

                    <div className="d-flex gap-3">
                        <button className="btn btn-warning px-4" onClick={handleEditSave}>
                            {isEditing ? "Save" : "Edit"} {/* ✅ toggle text */}
                        </button>
                        <button
                            className="btn btn-secondary px-4"
                            onClick={() => navigate("/home")} // ✅ back to home
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
