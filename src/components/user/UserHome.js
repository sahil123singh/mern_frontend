import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import API from "../../api";
import Header from "../Header";
import {
  FaHeart,
  FaRegHeart,
  FaUserCircle,
  FaBookmark,
  FaComment,
  FaShare,
  FaEllipsisH
} from "react-icons/fa";
import "../../css/homeFeed.css";

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();  // <-- Initialize navigate

  const loggedInUserId = localStorage.getItem("userId");

  const fetchFeedPosts = async () => {
    try {
      const { data } = await API.get("/posts/all");
      if (data?.statusCode === 200) {
        setPosts(data.data || []);
        // Initialize liked and bookmarked sets from fetched posts
        const likedSet = new Set();
        const bookmarkedSet = new Set();
        (data.data || []).forEach((post) => {
          if (post.likedByMe) likedSet.add(post._id);
          if (post.favorited) bookmarkedSet.add(post._id);
        });
        setLikedPosts(likedSet);
        setBookmarkedPosts(bookmarkedSet);
      } else {
        toast.info(data?.message || "No posts found");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const { data } = await API.post(`/posts/like`, { postId, like: 'like' });
      if (data?.statusCode === 200) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              const isLikedNow = !p.likedByMe;
              const newLikeCount = isLikedNow ? (p.likeCount || 0) + 1 : (p.likeCount || 0) - 1;
              return {
                ...p,
                likedByMe: isLikedNow,
                likeCount: newLikeCount,
              };
            }
            return p;
          })
        );
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      }
    } catch {
      toast.error("Error liking post");
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const { data } = await API.post(`/posts/like`, { postId, like: 'fav' });
      if (data?.statusCode === 200) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, favorited: !p.favorited } : p
          )
        );
        setBookmarkedPosts((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      }
    } catch {
      toast.error("Error adding to favorites");
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      const { data } = await API.post(`/posts/${postId}/comment`, { text });
      if (data?.statusCode === 200) {
        toast.success("Comment added!");
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
        // Optionally refresh comments or post data here
      }
    } catch {
      toast.error("Error adding comment");
    }
  };

  if (loading) {
    return (
      <div className="instagram-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="instagram-container">
        <Header />
        <div className="feed-container">
          <div className="feed-content">
            <div className="empty-feed">
              <div className="empty-icon">📷</div>
              <h3>No Posts Yet</h3>
              <p>Follow users to see their posts here.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="instagram-container">
      <Header />
      <div className="feed-container">
        <div className="feed-content">
          {posts.map((post) => {
            console.log('post========>>', post)
            const isLiked = likedPosts.has(post._id);
            const isBookmarked = bookmarkedPosts.has(post._id);
            const user = post?.userId?.userInfo || {}; // Assuming post.user contains user info

            const profileImageUrl = user?.profileImage
              ? (user?.profileImage.startsWith("http")
                ? user?.profileImage
                : `${API.defaults.baseURL}${user?.profileImage}`)
              : null;

            // Function to navigate to user profile
            const goToUserProfile = () => {
              if (post?.userId?._id) {
                navigate('/details', { state: { userId: post.userId._id } });
              } else {
                toast.info("User  profile not available");
              }
            };

            return (
              <div key={post._id} className="post-card">
                {/* Post Header */}
                <div className="post-header">
                  <div className="post-user">
                    <button className="user-avatar-btn"
                      onClick={() => window.alert(`Go to ${user.firstName}'s profile`)}>
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={user?.firstName}
                          className="profile-avatar"
                        />
                      ) : (
                        <FaUserCircle className="profile-avatar-placeholder" />
                      )}
                    </button>
                    <div className="user-info">
                      <button
                        className="username-btn"
                        // onClick={() => window.alert(`Go to ${user.firstName}'s profile`)}
                        onClick={goToUserProfile}
                      >
                      {user?.firstName} {user?.lastName}
                    </button>
                    <span className="post-time">
                      {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="post-options"
                  onClick={() => window.alert("Post options")}>
                  <FaEllipsisH />
                </button>
              </div>

                {/* Post Content */ }
            <div className="post-content">
              {post.image ? (
                <div className="post-image-container">
                  <img
                    src={post.image.startsWith("http") ? post.image : `${API.defaults.baseURL}${post.image}`}
                    alt={post.title || "Post image"}
                    className="post-image"
                  />
                </div>
              ) : (
                <div className="text-post">
                  <h3 className="post-title">{post.title || "Untitled"}</h3>
                  <p className="post-description">{post.caption || post.description || ""}</p>
                </div>
              )}
            </div>

            {/* Post Actions */ }
            <div className="post-actions">
              <div className="action-buttons">
                <button
                  className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
                  onClick={() => handleLike(post._id)}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  {isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                </button>
                <button
                  className="action-btn"
                  onClick={() => window.alert("Open comments")}
                  aria-label="Comment"
                >
                  <FaComment />
                </button>
                <button
                  className="action-btn"
                  onClick={() => window.alert("Share post")}
                  aria-label="Share"
                >
                  <FaShare />
                </button>
              </div>
              <button
                className={`bookmark-btn ${isBookmarked ? "favorited" : ""}`}
                onClick={() => handleBookmark(post._id)}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {isBookmarked ? <FaBookmark /> : <FaBookmark color="blue" />}
              </button>
            </div>

            {/* Comment input */ }
            <div className="comment-input-container"
              style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText[post._id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                }
                className="comment-input"
                style={{ flexGrow: 1, padding: "6px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleComment(post._id)}
                style={{ padding: "6px 12px", cursor: "pointer" }}
              >
                Post
              </button>
            </div>

            {/* Post Info */ }
            <div className="post-info" style={{ marginTop: "8px" }}>
              <div className="likes-count">
                <strong>{post.likeCount || 0} likes</strong>
              </div>
              {(post.caption || post.description) && (
                <div className="post-caption">
                  <span className="caption-text">{post.caption || post.description}</span>
                </div>
              )}
              <div
                className="view-comments"
                onClick={() => window.alert("View comments")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") window.alert("View comments"); }}
                style={{ cursor: "pointer", color: "#555", marginTop: "4px" }}
              >
                View all {post.commentCount || 0} comments
              </div>
            </div>
              </div>
        );
          })}
      </div>
    </div>
    </div >
  );
}
