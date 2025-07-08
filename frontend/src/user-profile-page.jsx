"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BASE_URL } from './main.jsx';
// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Caricamento profilo...</p>
  </div>
)

// User Avatar Component
const UserAvatar = ({ username, size = "lg" }) => {
  const sizes = {
    sm: "40px",
    md: "60px",
    lg: "120px",
    xl: "150px",
  }

  return (
    <div
      className="user-avatar"
      style={{
        width: sizes[size],
        height: sizes[size],
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        fontSize: size === "xl" ? "4rem" : size === "lg" ? "3rem" : "1.5rem",
      }}
    >
      {username?.charAt(0).toUpperCase() || "U"}
    </div>
  )
}

// Stats Card Component
const StatsCard = ({ icon, label, value, color }) => (
  <div className="stats-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stats-icon" style={{ color }}>
      {icon}
    </div>
    <div className="stats-content">
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
    </div>
  </div>
)

// Follow Button Component
const FollowButton = ({ username, isFollowing, onFollowToggle, loading }) => (
  <button
    onClick={onFollowToggle}
    disabled={loading}
    className={`follow-btn ${isFollowing ? "following" : ""} ${loading ? "loading" : ""}`}
  >
    {loading ? "⏳" : isFollowing ? "✓ Following" : "+ Segui"}
  </button>
)

// Post Card Component for User Profile
const UserPostCard = ({ post }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="user-post-card">
      <div className="post-header">
        <div className="post-date">
          {post.created_at ? new Date(post.created_at).toLocaleDateString("it-IT") : "Data non disponibile"}
        </div>
        <div className="post-visibility">{post.is_pinned && <span className="pinned-badge">📌 In evidenza</span>}</div>
      </div>

      <div className="post-content">
        <p className={expanded ? "" : "truncate"} onClick={() => setExpanded(!expanded)}>
          {post.content}
        </p>
        {post.content.length > 150 && (
          <button className="read-more-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Mostra meno" : "Leggi tutto"}
          </button>
        )}
      </div>

      {post.image && (
        <div className="post-image-container">
          <img src={post.image || "/placeholder.svg"} alt="post" className="post-image" />
        </div>
      )}

      <div className="post-stats">
        <span>❤️ {post.likes_count || 0}</span>
        <span>💬 {post.comments?.length || 0}</span>
        <span>👁️ {post.views_count || 0}</span>
      </div>
    </div>
  )
}

// Recent Activity Component
const RecentActivity = ({ activities }) => (
  <div className="recent-activity">
    <h3>📈 Attività Recente</h3>
    <div className="activity-list">
      {activities.length === 0 ? (
        <div className="empty-activity">
          <p>Nessuna attività recente</p>
        </div>
      ) : (
        activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon" style={{ background: activity.color }}>
              {activity.icon}
            </div>
            <div className="activity-content">
              <p>{activity.text}</p>
              <small>{activity.time}</small>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)

// Mutual Connections Component
const MutualConnections = ({ mutualFollowers, currentUser }) => (
  <div className="mutual-connections">
    <h3>👥 Connessioni in Comune</h3>
    <div className="mutual-list">
      {mutualFollowers.length === 0 ? (
        <p>Nessuna connessione in comune</p>
      ) : (
        mutualFollowers.slice(0, 6).map((user) => (
          <div key={user.id} className="mutual-user">
            <UserAvatar username={user.username} size="sm" />
            <span>@{user.username}</span>
          </div>
        ))
      )}
      {mutualFollowers.length > 6 && (
        <div className="more-mutual">
          <span>+{mutualFollowers.length - 6} altri</span>
        </div>
      )}
    </div>
  </div>
)

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [mutualFollowers, setMutualFollowers] = useState([])
  const [activities, setActivities] = useState([])

  const navigate = useNavigate()
  const { username } = useParams()
  const token = localStorage.getItem("access")

  // Get current user info
  const currentUserPayload = token ? JSON.parse(atob(token.split(".")[1])) : null
  const currentUsername = currentUserPayload?.username

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/")
      return
    }
  }, [token, navigate])

  // Redirect if viewing own profile
  useEffect(() => {
    if (username === currentUsername) {
      navigate("/profile")
      return
    }
  }, [username, currentUsername, navigate])

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/accounts/user/${username}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Utente non trovato")
        }
        throw new Error("Errore nel caricamento del profilo")
      }
      const data = await response.json()
      setProfile(data)
      setIsFollowing(data.is_following || false)
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/posts/user/${username}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Errore nel caricamento dei post")
      const data = await response.json()
      setUserPosts(Array.isArray(data) ? data : [])

      // Generate activity timeline from posts
      const postActivities = data.slice(0, 5).map((post) => ({
        icon: "📝",
        text: `Ha pubblicato: "${post.content.slice(0, 50)}${post.content.length > 50 ? "..." : ""}"`,
        time: new Date(post.created_at).toLocaleDateString("it-IT"),
        color: "#6366f1",
      }))

      setActivities(postActivities)
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch mutual followers
  const fetchMutualFollowers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/accounts/mutual-followers/${username}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMutualFollowers(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Errore nel caricamento delle connessioni comuni:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!token || followLoading) return
    setFollowLoading(true)

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      }

      if (isFollowing) {
        await fetch(`${BASE_URL}/api/accounts/follow/${username}/`, {
          method: "DELETE",
          ...config,
        })
        setIsFollowing(false)
        // Update follower count
        setProfile((prev) => ({
          ...prev,
          followers_count: (prev.followers_count || 1) - 1,
        }))
      } else {
        await fetch(`${BASE_URL}/api/accounts/follow/${username}/`, {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
            ...config.headers,
          },
        })
        setIsFollowing(true)
        // Update follower count
        setProfile((prev) => ({
          ...prev,
          followers_count: (prev.followers_count || 0) + 1,
        }))
      }
    } catch (error) {
      console.error("Errore durante il follow/unfollow", error)
      alert("Errore durante l'operazione. Riprova.")
    } finally {
      setFollowLoading(false)
    }
  }

  // Send message (placeholder)
  const handleSendMessage = () => {
    alert("Funzionalità messaggi in arrivo! 💬")
  }

  // Report user (placeholder)
  const handleReportUser = () => {
    if (window.confirm("Vuoi segnalare questo utente?")) {
      alert("Segnalazione inviata. Grazie per aver contribuito alla sicurezza della community.")
    }
  }

  // Initialize data
  useEffect(() => {
    if (token && username) {
      Promise.all([fetchUserProfile(), fetchUserPosts(), fetchMutualFollowers()])
    }
  }, [token, username])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ Errore</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/home")} className="back-btn">
          🏠 Torna alla Home
        </button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="error-container">
        <h2>👤 Utente non trovato</h2>
        <p>L'utente @{username} non esiste o non è disponibile.</p>
        <button onClick={() => navigate("/home")} className="back-btn">
          🏠 Torna alla Home
        </button>
      </div>
    )
  }

  return (
    <div className="user-profile-container">
      <style>
        {`
          :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #8b5cf6;
            --danger: #ef4444;
            --success: #10b981;
            --warning: #f59e0b;
            --info: #3b82f6;
            --light: #f8fafc;
            --dark: #1e293b;
            --gray: #64748b;
            --light-gray: #e2e8f0;
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          body {
            background-color: #f1f5f9;
            color: var(--dark);
          }
          
          .user-profile-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #10b981 100%);
            padding: 20px;
          }
          
          /* Animations */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          .fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          .slide-in {
            animation: slideIn 0.5s ease-out forwards;
          }
          
          /* Loading */
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: white;
          }
          
          .loading-container .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          /* Error */
          .error-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: white;
            text-align: center;
          }
          
          .back-btn {
            margin-top: 20px;
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .back-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
          }
          
          /* Header */
          .profile-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          
          .back-to-home {
            padding: 10px 20px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .back-to-home:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          
          .profile-info {
            display: flex;
            align-items: center;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .user-avatar {
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
            flex-shrink: 0;
          }
          
          .profile-details h1 {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          
          .profile-details p {
            color: var(--gray);
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          .profile-actions {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }
          
          .follow-btn {
            padding: 12px 24px;
            border-radius: 25px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .follow-btn.following {
            background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          
          .follow-btn.loading {
            cursor: not-allowed;
            transform: scale(0.95);
          }
          
          .follow-btn:not(.loading):hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          
          .follow-btn.following:not(.loading):hover {
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }
          
          .message-btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, var(--info) 0%, #0ea5e9 100%);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .message-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          
          .report-btn {
            padding: 12px 24px;
            background: var(--light-gray);
            color: var(--gray);
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .report-btn:hover {
            background: #fee2e2;
            color: var(--danger);
            transform: translateY(-2px);
          }
          
          /* Stats */
          .profile-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .stats-card {
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
          }
          
          .stats-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
            animation: pulse 2s infinite;
          }
          
          .stats-icon {
            font-size: 2rem;
          }
          
          .stats-value {
            font-size: 2rem;
            font-weight: 800;
            color: var(--dark);
          }
          
          .stats-label {
            color: var(--gray);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
          }
          
          /* Main Content */
          .profile-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
          }
          
          .main-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            overflow: hidden;
          }
          
          .sidebar-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          /* Tabs */
          .profile-tabs {
            display: flex;
            background: rgba(248, 250, 252, 0.8);
            border-bottom: 1px solid var(--light-gray);
          }
          
          .tab-button {
            flex: 1;
            padding: 20px;
            border: none;
            background: none;
            cursor: pointer;
            font-weight: 600;
            color: var(--gray);
            transition: all 0.3s ease;
            position: relative;
          }
          
          .tab-button.active {
            color: var(--primary);
            background: rgba(99, 102, 241, 0.05);
          }
          
          .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          }
          
          .tab-button:hover:not(.active) {
            background: rgba(99, 102, 241, 0.02);
            color: var(--primary);
          }
          
          /* Tab Content */
          .tab-content {
            padding: 30px;
          }
          
          /* Posts Grid */
          .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
          }
          
          .user-post-card {
            background: rgba(248, 250, 252, 0.8);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid var(--light-gray);
            transition: all 0.3s ease;
          }
          
          .user-post-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
            background: white;
          }
          
          .post-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .post-date {
            color: var(--gray);
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .pinned-badge {
            background: linear-gradient(135deg, var(--warning) 0%, #f97316 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          
          .post-content p {
            color: var(--dark);
            line-height: 1.6;
            margin-bottom: 10px;
          }
          
          .truncate {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .read-more-btn {
            background: none;
            border: none;
            color: var(--primary);
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .post-image-container {
            margin: 15px 0;
          }
          
          .post-image {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
            border-radius: 10px;
          }
          
          .post-stats {
            display: flex;
            gap: 15px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--light-gray);
            color: var(--gray);
            font-size: 0.9rem;
          }
          
          /* Sidebar Components */
          .recent-activity, .mutual-connections {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .recent-activity h3, .mutual-connections h3 {
            margin-bottom: 20px;
            color: var(--dark);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem;
          }
          
          .activity-list {
            max-height: 300px;
            overflow-y: auto;
          }
          
          .activity-item {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 15px;
            padding: 12px;
            background: rgba(248, 250, 252, 0.5);
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          
          .activity-item:hover {
            background: rgba(248, 250, 252, 0.8);
            transform: translateX(5px);
          }
          
          .activity-icon {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1rem;
            flex-shrink: 0;
          }
          
          .activity-content p {
            margin: 0;
            color: var(--dark);
            font-weight: 500;
            font-size: 0.9rem;
          }
          
          .activity-content small {
            color: var(--gray);
            font-size: 0.8rem;
          }
          
          .empty-activity {
            text-align: center;
            padding: 40px 20px;
            color: var(--gray);
          }
          
          .mutual-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .mutual-user {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            background: rgba(248, 250, 252, 0.5);
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          
          .mutual-user:hover {
            background: rgba(248, 250, 252, 0.8);
            transform: translateX(5px);
          }
          
          .mutual-user span {
            font-weight: 600;
            color: var(--dark);
            font-size: 0.9rem;
          }
          
          .more-mutual {
            text-align: center;
            padding: 10px;
            color: var(--gray);
            font-size: 0.9rem;
            font-weight: 600;
          }
          
          /* Empty State */
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--gray);
          }
          
          .empty-state div:first-child {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
          }
          
          .empty-state p {
            font-size: 1.1rem;
            margin-bottom: 10px;
          }
          
          /* Responsive */
          @media (max-width: 1024px) {
            .profile-content {
              grid-template-columns: 1fr;
            }
            
            .sidebar-content {
              order: -1;
            }
          }
          
          @media (max-width: 768px) {
            .user-profile-container {
              padding: 10px;
            }
            
            .profile-info {
              flex-direction: column;
              text-align: center;
              gap: 20px;
            }
            
            .profile-details h1 {
              font-size: 2rem;
            }
            
            .profile-stats {
              grid-template-columns: 1fr;
            }
            
            .profile-tabs {
              flex-direction: column;
            }
            
            .posts-grid {
              grid-template-columns: 1fr;
            }
            
            .header-top {
              flex-direction: column;
              gap: 15px;
            }
            
            .profile-actions {
              justify-content: center;
            }
          }
        `}
      </style>

      <div className="profile-header fade-in">
        <div className="header-top">
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            👤 Profilo di @{username}
          </h2>
          <button onClick={() => navigate("/home")} className="back-to-home">
            🏠 Torna alla Home
          </button>
        </div>

        <div className="profile-info slide-in">
          <UserAvatar username={profile.username} size="xl" />
          <div className="profile-details">
            <h1>@{profile.username}</h1>
            <p>{profile.bio || "Nessuna biografia disponibile."}</p>
            <div className="profile-actions">
              <FollowButton
                username={username}
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
                loading={followLoading}
              />
              <button onClick={handleSendMessage} className="message-btn">
                💬 Messaggio
              </button>
              <button onClick={handleReportUser} className="report-btn">
                🚨 Segnala
              </button>
            </div>
          </div>
        </div>

        <div className="profile-stats slide-in">
          <StatsCard icon="📝" label="Post" value={userPosts.length} color="var(--primary)" />
          <StatsCard icon="👥" label="Follower" value={profile.followers_count || 0} color="var(--success)" />
          <StatsCard icon="➕" label="Following" value={profile.following_count || 0} color="var(--warning)" />
          <StatsCard
            icon="📅"
            label="Membro da"
            value={new Date(profile.date_joined).getFullYear()}
            color="var(--info)"
          />
        </div>
      </div>

      <div className="profile-content fade-in">
        <div className="main-content">
          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              📝 Post ({userPosts.length})
            </button>
            <button
              className={`tab-button ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              📋 Informazioni
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "posts" && (
              <div className="slide-in">
                {userPosts.length === 0 ? (
                  <div className="empty-state">
                    <div>📝</div>
                    <p>@{username} non ha ancora pubblicato nessun post.</p>
                    <p>Torna più tardi per vedere i suoi contenuti!</p>
                  </div>
                ) : (
                  <div className="posts-grid">
                    {userPosts.map((post) => (
                      <UserPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "info" && (
              <div className="slide-in">
                <div style={{ display: "grid", gap: "20px", maxWidth: "600px" }}>
                  <div style={{ padding: "20px", background: "rgba(248, 250, 252, 0.5)", borderRadius: "15px" }}>
                    <h3 style={{ marginBottom: "10px", color: "var(--dark)" }}>👤 Username</h3>
                    <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>@{profile.username}</p>
                  </div>

                  <div style={{ padding: "20px", background: "rgba(248, 250, 252, 0.5)", borderRadius: "15px" }}>
                    <h3 style={{ marginBottom: "10px", color: "var(--dark)" }}>📧 Email</h3>
                    <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                      {profile.show_email ? profile.email : "Email privata"}
                    </p>
                  </div>

                  <div style={{ padding: "20px", background: "rgba(248, 250, 252, 0.5)", borderRadius: "15px" }}>
                    <h3 style={{ marginBottom: "10px", color: "var(--dark)" }}>📝 Biografia</h3>
                    <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                      {profile.bio || "Nessuna biografia disponibile."}
                    </p>
                  </div>

                  <div style={{ padding: "20px", background: "rgba(248, 250, 252, 0.5)", borderRadius: "15px" }}>
                    <h3 style={{ marginBottom: "10px", color: "var(--dark)" }}>📅 Membro dal</h3>
                    <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                      {new Date(profile.date_joined).toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-content">
          <RecentActivity activities={activities} />
          <MutualConnections mutualFollowers={mutualFollowers} currentUser={currentUsername} />
        </div>
      </div>
    </div>
  )
}
