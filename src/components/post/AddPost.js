import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import API from "../../api";
import Header from "../Header";

export default function AddPost() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        const imageUrl = res?.data?.data?.fileUrl;
        if (imageUrl) {
          setFormData((prev) => ({ ...prev, image: imageUrl }));
          setPreview(URL.createObjectURL(file));
          toast.success("Photo uploaded!");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error uploading photo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.image) delete dataToSubmit.image;

      const response = await API.post("/posts", dataToSubmit);

      if (response?.data?.statusCode === 200) {
        toast.success("Post created successfully!");
        setTimeout(() => navigate("/home"), 1000);
      } else {
        toast.error(response?.data?.message || "Failed to create post");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <div className="container my-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12">
            <div className="card shadow-lg rounded-4 border-0">
              <div
                className="p-3 rounded-top-4 text-center text-white fw-bold"
                style={{ background: "linear-gradient(135deg, #6a11cb, #2575fc)", fontSize: "1.5rem" }}
              >
                Add New Post
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control form-control-lg rounded-3 shadow-sm border-0"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter post title"
                    required
                    style={{ background: "#f5f7fa" }}
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    name="description"
                    className="form-control form-control-lg rounded-3 shadow-sm border-0"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write your post description..."
                    required
                    style={{ background: "#f5f7fa" }}
                  />
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control rounded-3 shadow-sm border-0"
                    onChange={handlePhotoUpload}
                    style={{ background: "#f5f7fa" }}
                  />
                </div>

                {/* Preview */}
                {preview && (
                  <div className="mb-4 text-center">
                    <p className="fw-semibold">Image Preview</p>
                    <img
                      src={preview}
                      alt="Preview"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: "300px", objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-gradient btn-lg rounded-3 fw-bold text-white"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    }}
                  >
                    {loading ? "Posting..." : "Submit Post"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" newestOnTop />
    </div>
  );
}
