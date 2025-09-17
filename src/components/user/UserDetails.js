import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import Header from "../Header";
import {
  FaHeart,
  FaRegHeart,
  FaUserCircle,
  FaCog,
  FaEllipsisH,
  FaUser ,
  FaBookmark,
  FaTag,
  FaComment,
  FaShare
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/userDetails.css";

export default function UserDetails() {
  const [user, setUser ] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;
  const loggedInUserId = localStorage.getItem("userId");

  // Fetch user details and posts
  const fetchUserDetails = async () => {
    try {
      const { data } = await API.get(`/users/${userId}`);
      if (data?.statusCode === 200) {
        setUser (data?.data);
        setPosts(data?.data?.postDetails || []);
      } else {
        toast.info(data?.message || "No details found");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch fav/saved posts when "saved" tab is active
  useEffect(() => {
    if (activeTab === 'saved') {
      const fetchSavedPosts = async () => {
        setSavedLoading(true);
        try {
          const { data } = await API.get(`/posts/fav?id=${userId}`); // Adjust endpoint if needed
          console.log('data=========>>>', data)
          if (data?.statusCode === 200) {
            setSavedPosts(data.data || []);
          } else {
            toast.info(data?.message || "No saved posts found");
            setSavedPosts([]);
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error fetching saved posts");
          setSavedPosts([]);
        } finally {
          setSavedLoading(false);
        }
      };
      fetchSavedPosts();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  // Follow / Unfollow handler
  const handleFollowUnfollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    const isFollowing = user.followers.includes(loggedInUserId);
    const type = isFollowing ? "unfollow" : "follow";

    try {
      const payload = {
        userId: userId,
        type: type
      };
      const { data } = await API.post("/users/follow", payload);

      if (data?.statusCode === 200) {
        toast.success(data.message || "Success");
        fetchUserDetails();
      } else {
        toast.error(data?.message || "Failed to update follow status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <Header />
        <div className="error-container">
          <h3>User not found</h3>
        </div>
      </div>
    );
  }

  const getProfileImage = () => {
    if (user.userInfo?.profileImage) {
      const url = user.userInfo?.profileImage?.startsWith("http")
        ? user.userInfo.profileImage
        : `${API.defaults.baseURL}${user?.userInfo?.profileImage}`;
      return (
        <img
          src={url}
          alt="Profile"
          className="profile-image"
        />
      );
    }
    return <FaUserCircle className="profile-image-placeholder" />;
  };

  const isFollowing = user.followers.includes(loggedInUserId);
  const isOwnProfile = user._id === loggedInUserId;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="profile-container">
      <Header />

      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {getProfileImage()}
            </div>

            <div className="profile-details">
              <div className="profile-username">
                <h1>{user.userInfo?.firstName} {user.userInfo?.lastName}</h1>

                <div className="profile-actions">
                  {isOwnProfile ? (
                    <>
                      <button
                        className="btn-edit-profile"
                        onClick={() => navigate("/edit-profile")}
                      >
                        Edit profile
                      </button>
                      <button className="btn-settings">
                        <FaCog />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={`btn-follow ${isFollowing ? 'following' : ''}`}
                        onClick={handleFollowUnfollow}
                        disabled={followLoading}
                      >
                        {followLoading ? "Loading..." : (isFollowing ? "Following" : "Follow")}
                      </button>

                      <button
                        className="btn-message"
                        onClick={() => {
                          navigate('/messages', {
                            state: { receiverId: user._id, receiverInfo: user }
                          });
                        }}
                      >
                        Message
                      </button>

                      <button className="btn-more">
                        <FaEllipsisH />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{formatNumber(posts.length)}</span>
                  <span className="stat-label">posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{formatNumber(user.followers.length)}</span>
                  <span className="stat-label">followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{formatNumber(user.following.length)}</span>
                  <span className="stat-label">following</span>
                </div>
              </div>

              <div className="profile-bio">
                <div className="bio-text">
                  {user.userInfo?.bio || `${user.userInfo?.firstName} ${user.userInfo?.lastName}`}
                </div>
                <div className="join-date">
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="mobile-stats">
            <div className="stat">
              <span className="stat-number">{formatNumber(posts.length)}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatNumber(user.followers.length)}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatNumber(user.following.length)}</span>
              <span className="stat-label">following</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <FaUser  />
            <span>POSTS</span>
          </button>
          <button
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <FaBookmark />
            <span>SAVED</span>
          </button>
          <button
            className={`tab ${activeTab === 'tagged' ? 'active' : ''}`}
            onClick={() => setActiveTab('tagged')}
          >
            <FaTag />
            <span>TAGGED</span>
          </button>
        </div>

        {/* Posts Section */}
        <div className="posts-section">
          {activeTab === 'posts' && (
            <>
              {posts?.length > 0 ? (
                <div className="posts-grid">
                  {posts.map((post) => (
                    <div key={post._id} className="post-item">
                      <div className="post-overlay">
                        <div className="post-stats">
                          <div className="stat-item">
                            <FaHeart />
                            <span>{post.likeCount || 0}</span>
                          </div>
                          <div className="stat-item">
                            <FaComment />
                            <span>{post.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {post.image ? (
                        <img
                          src={post.image.startsWith("http") ? post.image : `${API.defaults.baseURL}${post.image}`}
                          alt={post.title}
                          className="post-image"
                        />
                      ) : (
                        <div className="post-placeholder">
                          <div className="post-text">
                            <h4>{post.title}</h4>
                            <p>{post.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📷</div>
                  <h3>No Posts Yet</h3>
                  <p>When {isOwnProfile ? 'you' : user.userInfo?.firstName} posts, they'll appear here.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {savedLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                </div>
              ) : savedPosts.length > 0 ? (
                <div className="posts-grid">
                  {savedPosts.map((post) => (
                    <div key={post._id} className="post-item">
                      <div className="post-overlay">
                        <div className="post-stats">
                          <div className="stat-item">
                            <FaHeart />
                            <span>{post.likeCount || 0}</span>
                          </div>
                          <div className="stat-item">
                            <FaComment />
                            <span>{post.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {post.image ? (
                        <img
                          src={post.image.startsWith("http") ? post.image : `${API.defaults.baseURL}${post.image}`}
                          alt={post.title}
                          className="post-image"
                        />
                      ) : (
                        <div className="post-placeholder">
                          <div className="post-text">
                            <h4>{post.title}</h4>
                            <p>{post.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔖</div>
                  <h3>No Saved Posts</h3>
                  <p>Save posts to see them here.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'tagged' && (
            <div className="empty-state">
              <div className="empty-icon">🏷️</div>
              <h3>No Tagged Posts</h3>
              <p>Posts where {isOwnProfile ? 'you' : user.userInfo?.firstName} are tagged will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
