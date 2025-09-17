import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import API from "../../api";
import Header from "../Header";
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaUserCircle } from "react-icons/fa";

export default function MyPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get("/posts/my");
        if (response?.data?.statusCode === 200) {
          setPosts(response?.data?.data || []);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error fetching posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const updatePostState = (postId, update) => {
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...update } : p)));
    if (selectedPost?._id === postId) {
      setSelectedPost((prev) => ({ ...prev, ...update }));
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await API.post(`/posts/like`, { postId, like: "like" });
      if (data?.statusCode === 200) {
        updatePostState(postId, {
          likedByMe: !selectedPost?.likedByMe,
          likeCount: data.likeCount,
        });
      }
    } catch {
      toast.error("Error liking post");
    }
  };

  const handleFav = async (postId) => {
    try {
      const { data } = await API.post(`/posts/like`, { postId, like: "fav" });
      if (data?.statusCode === 200) {
        updatePostState(postId, {
          favorited: !selectedPost?.favorited,
        });
      }
    } catch {
      toast.error("Error updating favorites");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await API.delete(`/posts/${postId}`);
      if (res?.data?.statusCode === 200) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        if (selectedPost?._id === postId) setSelectedPost(null);
        toast.success("Post deleted!");
      }
    } catch {
      toast.error("Error deleting post");
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      const res = await API.post(`/posts/${postId}/comment`, { text });
      if (res?.data?.statusCode === 200) {
        toast.success("Comment added!");
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch {
      toast.error("Error adding comment");
    }
  };

  const handleUserProfile = (userId) => {
    navigate("/details", { state: { userId } });
  };

  const getProfileImage = (post) => {
    const size = 40;
    if (post?.userId?.userInfo?.profileImage) {
      const url = post.userId.userInfo.profileImage.startsWith("http")
        ? post.userId.userInfo.profileImage
        : `${API.defaults.baseURL}${post.userId.userInfo.profileImage}`;
      return (
        <img
          src={url}
          alt="Profile"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            marginRight: "10px",
            objectFit: "cover",
          }}
        />
      );
    }
    return <FaUserCircle size={size} style={{ marginRight: "10px" }} />;
  };

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <div className="container my-4 flex-grow-1">
        {loading ? (
          <p className="text-center">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted">No posts available</p>
        ) : (
          <div className="row g-2">
            {posts.map((post) => (
              <div key={post._id} className="col-3">
                <div
                  className="position-relative cursor-pointer"
                  style={{ overflow: "hidden", borderRadius: "8px" }}
                  onClick={() => openPostModal(post)}
                >
                  {post.image && (
                    <img
                      src={post.image.startsWith("http") ? post.image : `${API.defaults.baseURL}${post.image}`}
                      alt={post.title}
                      className="img-fluid"
                      style={{ width: "100%", height: "150px", objectFit: "cover" }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={closePostModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-body p-0">
                {selectedPost.image && (
                  <img
                    src={selectedPost.image.startsWith("http") ? selectedPost.image : `${API.defaults.baseURL}${selectedPost.image}`}
                    alt={selectedPost.title}
                    className="img-fluid w-100"
                    style={{ objectFit: "contain", maxHeight: "80vh" }}
                  />
                )}
                <div className="p-3">
                  <h5>{selectedPost.title}</h5>
                  <p>{selectedPost.description}</p>

                  <div className="d-flex align-items-center gap-3 mt-3">
                    <button className="btn btn-sm btn-light d-flex align-items-center" onClick={() => handleLike(selectedPost._id)}>
                      {selectedPost.likedByMe ? <FaHeart color="red" /> : <FaRegHeart />} {selectedPost.likeCount || 0}
                    </button>

                    <button className="btn btn-sm btn-light d-flex align-items-center" onClick={() => handleFav(selectedPost._id)}>
                      {selectedPost.favorited ? "★ Favorited" : "☆ Add to Fav"}
                    </button>

                    <button className="btn btn-sm btn-danger d-flex align-items-center" onClick={() => handleDelete(selectedPost._id)}>
                      <FaTrash />
                    </button>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add comment..."
                      className="form-control form-control-sm"
                      value={commentText[selectedPost._id] || ""}
                      onChange={(e) => setCommentText((prev) => ({ ...prev, [selectedPost._id]: e.target.value }))}
                    />
                    <button className="btn btn-sm btn-primary" onClick={() => handleComment(selectedPost._id)}>
                      <FaComment />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
