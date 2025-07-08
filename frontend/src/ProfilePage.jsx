"use client"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BASE_URL } from './main.jsx';
// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Caricamento profilo...</p>
  </div>
)
const { username } = useParams();

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

// Post Card Component for Profile
const ProfilePostCard = ({ post, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="profile-post-card">
      <div className="post-header">
        <div className="post-date">
          {post.created_at ? new Date(post.created_at).toLocaleDateString("it-IT") : "Data non disponibile"}
        </div>
        <button onClick={() => onDelete(post.id)} className="delete-post-btn" title="Elimina post">
          🗑️
        </button>
      </div>

      <div className="post-content">
        <p className={expanded ? "" : "truncate"} onClick={() => setExpanded(!expanded)}>
          {post.content}
        </p>
        {post.content.length > 100 && (
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
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [activeTab, setActiveTab] = useState("info")
  const [updateLoading, setUpdateLoading] = useState(false)

  const navigate = useNavigate()
  const token = localStorage.getItem("access")

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/")
      return
    }
  }, [token, navigate])

  // Fetch user profile
  const fetchProfile = async () => {
  try {
    const url = username
      ? `${BASE_URL}/api/accounts/${username}/`
      : `${BASE_URL}/api/accounts/profile/`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
      if (!response.ok) throw new Error("Errore nel caricamento del profilo")
      const data = await response.json()
      setProfile(data)
      setEditForm((prev) => ({ ...prev, bio: data.bio || "" }))
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/posts/my-posts/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Errore nel caricamento dei post")
      const data = await response.json()
      setUserPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)

    try {
      const updateData = { bio: editForm.bio }

      // Update bio
      const response = await fetch(`${BASE_URL}/api/accounts/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error("Errore nell'aggiornamento del profilo")

      // Update password if provided
      if (editForm.newPassword && editForm.currentPassword) {
        if (editForm.newPassword !== editForm.confirmPassword) {
          throw new Error("Le password non coincidono")
        }

        const passwordResponse = await fetch(`${BASE_URL}/api/accounts/change-password/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: editForm.currentPassword,
            new_password: editForm.newPassword,
          }),
        })

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json()
          throw new Error(errorData.detail || "Errore nel cambio password")
        }
      }

      await fetchProfile()
      setIsEditing(false)
      setEditForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
      alert("Profilo aggiornato con successo!")
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Vuoi davvero eliminare questo post?")) return

    try {
      const response = await fetch(`${BASE_URL}/api/posts/${postId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setUserPosts(userPosts.filter((p) => p.id !== postId))
      } else {
        alert("Errore durante l'eliminazione del post")
      }
    } catch (err) {
      console.error(err)
      alert("Errore durante l'eliminazione del post")
    }
  }

  // Initialize data
  useEffect(() => {
    if (token) {
      Promise.all([fetchProfile(), fetchUserPosts()])
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

  return (
    <div className="profile-container">
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
          
          .profile-container {
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
          
          .edit-profile-btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
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
          
          .edit-profile-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
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
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            overflow: hidden;
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
          
          /* Edit Form */
          .edit-form {
            max-width: 600px;
          }
          
          .form-group {
            margin-bottom: 25px;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--dark);
          }
          
          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid var(--light-gray);
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: rgba(248, 250, 252, 0.5);
          }
          
          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            background: white;
          }
          
          .form-group textarea {
            min-height: 100px;
            resize: vertical;
          }
          
          .password-section {
            background: rgba(248, 250, 252, 0.5);
            padding: 25px;
            border-radius: 15px;
            margin-top: 30px;
            border: 1px solid var(--light-gray);
          }
          
          .password-section h3 {
            margin-bottom: 20px;
            color: var(--dark);
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
          }
          
          .save-btn {
            padding: 15px 30px;
            background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .save-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }
          
          .save-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .cancel-btn {
            padding: 15px 30px;
            background: var(--light-gray);
            color: var(--dark);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .cancel-btn:hover {
            background: #cbd5e1;
            transform: translateY(-2px);
          }
          
          /* Posts Grid */
          .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
          }
          
          .profile-post-card {
            background: rgba(248, 250, 252, 0.8);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid var(--light-gray);
            transition: all 0.3s ease;
          }
          
          .profile-post-card:hover {
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
          
          .delete-post-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.3s ease;
            color: var(--danger);
          }
          
          .delete-post-btn:hover {
            background: rgba(239, 68, 68, 0.1);
            transform: scale(1.1);
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
          
          /* Empty State */
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--gray);
          }
          
          .empty-state div:first-child {
            font-size: 4rem;
            margin-bottom: 20px;
          }
          
          .empty-state p {
            font-size: 1.1rem;
            margin-bottom: 10px;
          }
          
          /* Profile Info Display */
          .profile-info-display > div {
            display: grid;
            gap: 20px;
            max-width: 600px;
          }
          
          .profile-info-display > div > div {
            padding: 20px;
            background: rgba(248, 250, 252, 0.5);
            border-radius: 15px;
          }
          
          .profile-info-display h3 {
            margin-bottom: 10px;
            color: var(--dark);
          }
          
          .profile-info-display p {
            font-size: 1.1rem;
            font-weight: 600;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .profile-container {
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
            👤 Il Mio Profilo
          </h2>
          <button onClick={() => navigate("/home")} className="back-to-home">
            🏠 Torna alla Home
          </button>
        </div>

        {profile && (
          <>
            <div className="profile-info slide-in">
              <UserAvatar username={profile.username} size="xl" />
              <div className="profile-details">
                <h1>@{profile.username}</h1>
                <p>{profile.bio || "Nessuna biografia disponibile."}</p>
                <button onClick={() => setIsEditing(!isEditing)} className="edit-profile-btn">
                  ✏️ {isEditing ? "Annulla Modifica" : "Modifica Profilo"}
                </button>
              </div>
            </div>

            <div className="profile-stats slide-in">
              <StatsCard icon="📝" label="Post" value={userPosts.length} color="var(--primary)" />
              <StatsCard icon="👥" label="Follower" value={profile.followers?.length || 0} color="var(--success)" />
              <StatsCard icon="➕" label="Following" value={profile.following?.length || 0} color="var(--warning)" />
              <StatsCard icon="📧" label="Email" value={profile.email ? "✓" : "✗"} color="var(--info)" />
            </div>
          </>
        )}
      </div>

      <div className="profile-content fade-in">
        <div className="profile-tabs">
          <button className={`tab-button ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
            📋 Informazioni
          </button>
          <button
            className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            📝 I Miei Post ({userPosts.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "info" && (
            <div className="slide-in">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="edit-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      value={profile?.username || ""}
                      disabled
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    />
                    <small style={{ color: "var(--gray)", fontSize: "0.8rem" }}>
                      Il username non può essere modificato
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    />
                    <small style={{ color: "var(--gray)", fontSize: "0.8rem" }}>
                      L'email non può essere modificata
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Biografia</label>
                    <textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Racconta qualcosa di te..."
                      maxLength={500}
                    />
                    <small style={{ color: "var(--gray)", fontSize: "0.8rem" }}>
                      {editForm.bio.length}/500 caratteri
                    </small>
                  </div>

                  <div className="password-section">
                    <h3>🔒 Cambia Password</h3>
                    <div className="form-group">
                      <label htmlFor="currentPassword">Password Attuale</label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={editForm.currentPassword}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Inserisci la password attuale"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">Nuova Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Inserisci la nuova password"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Conferma Nuova Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Conferma la nuova password"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={updateLoading}>
                      {updateLoading ? "⏳ Salvando..." : "💾 Salva Modifiche"}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                      ❌ Annulla
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-display">
                  <div>
                    <div>
                      <h3>👤 Username</h3>
                      <p>@{profile?.username}</p>
                    </div>

                    <div>
                      <h3>📧 Email</h3>
                      <p>{profile?.email}</p>
                    </div>

                    <div>
                      <h3>📝 Biografia</h3>
                      <p style={{ lineHeight: "1.6" }}>{profile?.bio || "Nessuna biografia disponibile."}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="slide-in">
              {userPosts.length === 0 ? (
                <div className="empty-state">
                  <div>📝</div>
                  <p>Non hai ancora pubblicato nessun post.</p>
                  <p>Vai alla home per creare il tuo primo post!</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {userPosts.map((post) => (
                    <ProfilePostCard key={post.id} post={post} onDelete={handleDeletePost} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
