import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import API from "../../api";
import Header from "../Header";
import { FaHeart, FaRegHeart, FaUserCircle } from "react-icons/fa";

export default function MyFavPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get("/posts/fav");
        if (response?.data?.statusCode === 200) {
          setPosts(response?.data?.data || []);
        }
      } catch {
        toast.error("Error fetching posts");
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
          className="rounded-circle me-2"
          style={{ width: size, height: size, objectFit: "cover" }}
        />
      );
    }
    return <FaUserCircle size={size} className="me-2" />;
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

      {/* Expanded Post Modal */}
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
