"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { BASE_URL } from "./main.jsx"

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Caricamento...</p>
  </div>
)

// Error Display Component
const ErrorDisplay = ({ error }) => (
  <div className="error-container">
    <h2>❌ Errore</h2>
    <p>{error}</p>
  </div>
)

// User Avatar Component
const UserAvatar = ({ username, size = "md", onClick }) => {
  const sizes = {
    sm: "30px",
    md: "45px",
    lg: "60px",
  }

  return (
    <div
      className="user-avatar"
      style={{
        width: sizes[size],
        height: sizes[size],
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
      title={onClick ? `Visualizza profilo di @${username}` : ""}
    >
      {username?.charAt(0).toUpperCase() || "U"}
    </div>
  )
}

// File Upload Component
const FileUpload = ({ onFileChange, preview }) => {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileChange(e.dataTransfer.files[0])
      }
    },
    [onFileChange],
  )

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0])
    }
  }

  return (
    <div
      className={`file-upload-container ${dragActive ? "drag-active" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input type="file" id="file-upload" accept="image/*" onChange={handleChange} className="file-input" />

      <label htmlFor="file-upload" className="upload-label">
        {preview ? (
          <div className="image-preview">
            <img src={URL.createObjectURL(preview) || "/placeholder.svg"} alt="Preview" />
            <div className="change-image-btn">🔄 Cambia immagine</div>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
              </svg>
            </div>
            <div className="upload-text">
              <p>
                Trascina un'immagine qui o <span>clicca per selezionare</span>
              </p>
              <small>Formati supportati: JPG, PNG (max 5MB)</small>
            </div>
          </>
        )}
      </label>
    </div>
  )
}

// Follow Button Component
const FollowButton = ({ username, userId, initialIsFollowing, token }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleFollowToggle = async () => {
    if (!token || loading) return
    setLoading(true)

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
      }
    } catch (error) {
      console.error("Errore durante il follow/unfollow", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`follow-btn ${isFollowing ? "following" : ""} ${loading ? "loading" : ""}`}
    >
      {loading ? "⏳" : isFollowing ? "✓ Following" : "+ Follow"}
    </button>
  )
}

// Post Card Component
const PostCard = ({
  post,
  loggedUserId,
  followingStates,
  token,
  handleLike,
  handleCommentSubmit,
  commentText,
  setCommentText,
  isAdmin,
  handleDeletePost,
  navigate,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleUsernameClick = (username) => {
    if (username) {
      navigate(`/user/${username}`)
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <UserAvatar username={post.author?.username} onClick={() => handleUsernameClick(post.author?.username)} />
          <div>
            <h4
              onClick={() => handleUsernameClick(post.author?.username)}
              style={{ cursor: "pointer" }}
              title={`Visualizza profilo di @${post.author?.username}`}
            >
              {post.author?.username || "Utente sconosciuto"}
            </h4>
            <p className="post-time">
              {post.created_at ? new Date(post.created_at).toLocaleString("it-IT") : "Data non disponibile"}
            </p>
          </div>
        </div>
        {post.author?.id !== loggedUserId && (
          <FollowButton
            username={post.author?.username}
            userId={post.author?.id}
            initialIsFollowing={followingStates[post.author?.id] || false}
            token={token}
          />
        )}
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

      <div className="post-actions">
        <button onClick={() => handleLike(post.id)} className="like-btn">
          ❤️ {post.likes_count || 0} Mi piace
        </button>

        <button className="comment-toggle-btn" onClick={() => setShowComments(!showComments)}>
          💬 {post.comments?.length || 0} Commenti
        </button>

        {isAdmin && (
          <button onClick={() => handleDeletePost(post.id)} className="delete-btn">
            🗑️ Elimina
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {(post.comments || []).map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <UserAvatar
                    username={comment.author?.username}
                    size="sm"
                    onClick={() => handleUsernameClick(comment.author?.username)}
                  />
                  <span
                    onClick={() => handleUsernameClick(comment.author?.username)}
                    style={{ cursor: "pointer" }}
                    title={`Visualizza profilo di @${comment.author?.username}`}
                  >
                    {comment.author?.username || "Anonimo"}
                  </span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCommentSubmit(post.id)
            }}
            className="comment-form"
          >
            <input
              type="text"
              placeholder="💭 Scrivi un commento..."
              value={commentText[post.id] || ""}
              onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
              required
            />
            <button type="submit">📤 Invia</button>
          </form>
        </div>
      )}
    </div>
  )
}

// Create Post Form Component
const CreatePostForm = ({ newPostContent, setNewPostContent, newPostImage, setNewPostImage, handleCreatePost }) => {
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (newPostImage) {
      setImagePreview(newPostImage)
    } else {
      setImagePreview(null)
    }
  }, [newPostImage])

  const handleFileChange = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("L'immagine è troppo grande (max 5MB)")
      return
    }
    setNewPostImage(file)
  }

  const removeImage = () => {
    setNewPostImage(null)
    setImagePreview(null)
  }

  return (
    <div className="create-post-form">
      <h3>✨ Crea Nuovo Post</h3>
      <form onSubmit={handleCreatePost}>
        <textarea
          placeholder="💭 A cosa stai pensando?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          required
        />

        <FileUpload onFileChange={handleFileChange} preview={imagePreview} />

        <div className="form-actions">
          {imagePreview && (
            <button type="button" onClick={removeImage} className="remove-image-btn">
              ❌ Rimuovi immagine
            </button>
          )}
          <button type="submit" className="submit-post-btn">
            🚀 Pubblica Post
          </button>
        </div>
      </form>
    </div>
  )
}

// Navigation Buttons Component
const NavigationButtons = ({ activeView, setActiveView, isAdmin }) => {
  const buttons = [
    { key: "feed", label: "🏠 Feed", gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" },
    ...(isAdmin
      ? [
          { key: "admin-users", label: "👥 Utenti", gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)" },
          { key: "admin-posts", label: "📝 Post", gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)" },
          {
            key: "admin-comments",
            label: "💬 Commenti",
            gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
          },
        ]
      : []),
  ]

  return (
    <div className="navigation-buttons">
      {buttons.map(({ key, label, gradient }) => (
        <button
          key={key}
          onClick={() => setActiveView(key)}
          className={`nav-btn ${activeView === key ? "active" : ""}`}
          style={{ background: activeView === key ? gradient : "" }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// User List Component
const UserList = ({ users, loggedUserId, followingStates, token, isAdmin, handleDeleteUser, navigate }) => {
  const handleUsernameClick = (username) => {
    if (username) {
      navigate(`/user/${username}`)
    }
  }

  return (
    <div className="user-list">
      <h3>👥 {isAdmin ? "Gestione Utenti" : "Utenti Registrati"}</h3>
      <div className="users-container">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <UserAvatar username={user.username} onClick={() => handleUsernameClick(user.username)} />
              <div>
                <span
                  onClick={() => handleUsernameClick(user.username)}
                  style={{ cursor: "pointer" }}
                  title={`Visualizza profilo di @${user.username}`}
                >
                  {user.username}
                </span>
                {isAdmin && <span className="user-email">{user.email}</span>}
                {!isAdmin && (
                  <div className="follow-status">{followingStates[user.id] ? "Ti segue" : "Non ti segue"}</div>
                )}
              </div>
            </div>
            {user.id !== loggedUserId &&
              (isAdmin ? (
                <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">
                  🗑️ Elimina
                </button>
              ) : (
                <FollowButton
                  username={user.username}
                  userId={user.id}
                  initialIsFollowing={followingStates[user.id] || false}
                  token={token}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Main App Component
export default function HomePage() {
  // State management
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImage, setNewPostImage] = useState(null)
  const [commentText, setCommentText] = useState({})
  const [followingStates, setFollowingStates] = useState({})
  const [activeView, setActiveView] = useState("feed")

  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem("access")

  // User info from token
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null
  const loggedUserId = payload?.user_id
  const isAdmin = payload?.is_staff

  // Set initial view based on route
  useEffect(() => {
    if (location.pathname === "/admin" && isAdmin) {
      setActiveView("admin-users")
    } else {
      setActiveView("feed")
    }
  }, [location.pathname, isAdmin])

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/")
      return
    }

    if (location.pathname === "/admin" && !isAdmin) {
      alert("Accesso negato: non sei un amministratore")
      navigate("/home")
      return
    }
  }, [token, navigate, location.pathname, isAdmin])

  // Fetch functions
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/posts/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Errore nel recupero dei post")
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/accounts/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Errore nel recupero utenti")
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])

      const followingState = {}
      data.forEach((user) => {
        followingState[user.id] = user.followers?.includes(loggedUserId) || false
      })
      setFollowingStates(followingState)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchComments = async () => {
    if (!isAdmin) return
    try {
      const response = await fetch(`${BASE_URL}/api/comments/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Errore nel caricamento commenti")
      const data = await response.json()
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Errore nel caricamento commenti:", err)
    }
  }

  // Post creation
  const handleCreatePost = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("content", newPostContent)
    if (newPostImage) {
      formData.append("image", newPostImage)
    }

    try {
      const response = await fetch(`${BASE_URL}/api/posts/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!response.ok) throw new Error("Errore durante la creazione del post")
      setNewPostContent("")
      setNewPostImage(null)
      fetchPosts()
    } catch (err) {
      console.error(err)
      alert("Errore nella pubblicazione")
    }
  }

  // Like functionality
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/likes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postId }),
      })
      if (!response.ok) throw new Error("Errore nel mettere like")
      fetchPosts()
    } catch (error) {
      console.error(error)
      alert("Errore di rete nel mettere like")
    }
  }

  const handleUnlike = async (postId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/likes/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.status === 204) {
        // Like rimosso con successo, nessun body da leggere
        fetchPosts()
        return
      }
      if (!response.ok) {
        // Prova a leggere il messaggio di errore solo se c'è un body
        let data = {}
        try {
          data = await response.json()
        } catch {}
        alert(data.detail || "Errore nel togliere like")
        return
      }
      fetchPosts()
    } catch (error) {
      console.error(error)
      alert("Errore di rete nel togliere like")
    }
  }

  // Comment functionality
  const handleCommentSubmit = async (postId) => {
    const comment = commentText[postId]?.trim()
    if (!comment) return

    try {
      const response = await fetch(`${BASE_URL}/api/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postId, text: comment }),
      })
      if (!response.ok) throw new Error("Errore nel commento")
      setCommentText((prev) => ({ ...prev, [postId]: "" }))
      fetchPosts()
    } catch (error) {
      console.error(error)
      alert("Errore di rete nel commentare")
    }
  }

  // Admin functions
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Vuoi davvero eliminare questo utente?")) return

    try {
      const response = await fetch(`${BASE_URL}/api/accounts/admin-users/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId))
      } else {
        const data = await response.json()
        alert(data.detail || "Errore durante l'eliminazione")
      }
    } catch (err) {
      console.error(err)
      alert("Errore durante la richiesta di eliminazione")
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Vuoi davvero eliminare questo post?")) return

    try {
      const response = await fetch(`${BASE_URL}/api/admin-posts/${postId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== postId))
      } else {
        alert("Errore durante l'eliminazione del post")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Vuoi davvero eliminare questo commento?")) return

    try {
      const response = await fetch(`${BASE_URL}/api/comments/${commentId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
        fetchPosts()
      } else {
        alert("Errore durante l'eliminazione del commento")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    navigate("/")
  }

  // Initialize data
  useEffect(() => {
    if (token) {
      Promise.all([fetchPosts(), fetchUsers(), fetchComments()]).catch((err) => {
        console.error("Error initializing data:", err)
        setError("Errore nel caricamento dei dati")
      })
    }
  }, [token])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="app-container">
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
          
          .app-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          /* Animations */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          /* Loading spinner */
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
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
          
          .loading-container p {
            font-size: 18px;
            font-weight: 500;
            animation: pulse 2s infinite;
          }
          
          /* Error display */
          .error-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          
          .error-container h2 {
            margin-bottom: 15px;
            font-size: 2rem;
          }
          
          .error-container p {
            font-size: 1.2rem;
            max-width: 600px;
          }
          
          /* Header */
          .header {
            background: white;
            padding: 20px 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          
          .header h1 {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
          }
          
          .header p {
            color: var(--gray);
            margin-top: 5px;
            font-size: 0.9rem;
          }
          
          .header-actions {
            display: flex;
            gap: 15px;
            align-items: center;
          }
          
          .profile-btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
          
          .profile-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          
          .logout-btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
          
          .logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          }
          
          /* Main layout */
          .main-content {
            display: flex;
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
            padding: 20px;
            gap: 30px;
          }
          
          .sidebar {
            width: 320px;
            background: white;
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            position: sticky;
            top: 100px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
          }
          
          .content-area {
            flex: 1;
            min-width: 0;
          }
          
          /* Navigation buttons */
          .navigation-buttons {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          
          .nav-btn {
            padding: 12px 24px;
            color: var(--dark);
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            background: rgba(255,255,255,0.9);
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          }
          
          .nav-btn.active {
            color: white;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }
          
          .nav-btn:hover:not(.active) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          }
          
          /* User avatar */
          .user-avatar {
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            flex-shrink: 0;
          }
          
          /* Follow button */
          .follow-btn {
            padding: 8px 16px;
            border-radius: 20px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          }
          
          .follow-btn.following {
            background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
            color: var(--dark);
          }
          
          .follow-btn.loading {
            cursor: not-allowed;
            transform: scale(0.95);
          }
          
          .follow-btn:not(.loading):hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          
          /* User list */
          .user-list h3 {
            margin-bottom: 20px;
            font-size: 1.3rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .users-container {
            max-height: 500px;
            overflow-y: auto;
            padding-right: 10px;
          }
          
          .user-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
          }
          
          .user-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .user-info span:first-child {
            font-weight: 600;
            color: var(--dark);
          }
          
          .user-email {
            color: var(--gray);
            font-size: 0.8rem;
            margin-top: 2px;
            display: block;
          }
          
          .follow-status {
            font-size: 0.7rem;
            color: var(--gray);
            margin-top: 2px;
          }
          
          /* Create post form */
          .create-post-form {
            background: white;
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            margin-bottom: 30px;
          }
          
          .create-post-form h3 {
            margin-bottom: 20px;
            font-size: 1.2rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .create-post-form textarea {
            width: 100%;
            min-height: 120px;
            padding: 15px;
            border: 2px solid var(--light-gray);
            border-radius: 12px;
            margin-bottom: 15px;
            resize: vertical;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          
          .create-post-form textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          .form-actions {
            display: flex;
            gap: 15px;
            align-items: center;
          }
          
          .remove-image-btn {
            padding: 10px 16px;
            background: var(--light-gray);
            color: var(--danger);
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-right: auto;
          }
          
          .remove-image-btn:hover {
            background: #fee2e2;
            transform: translateY(-2px);
          }
          
          .submit-post-btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .submit-post-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          
          /* File Upload Styles */
          .file-upload-container {
            border: 2px dashed var(--light-gray);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            background-color: rgba(248, 250, 252, 0.5);
          }
          
          .file-upload-container.drag-active {
            border-color: var(--primary);
            background-color: rgba(99, 102, 241, 0.05);
          }
          
          .file-input {
            display: none;
          }
          
          .upload-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            min-height: 150px;
          }
          
          .upload-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            margin-bottom: 15px;
          }
          
          .upload-text {
            text-align: center;
          }
          
          .upload-text p {
            color: var(--dark);
            margin-bottom: 5px;
          }
          
          .upload-text p span {
            color: var(--primary);
            font-weight: 600;
            text-decoration: underline;
          }
          
          .upload-text small {
            color: var(--gray);
            font-size: 0.8rem;
          }
          
          .image-preview {
            position: relative;
            width: 100%;
            max-height: 300px;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .image-preview img {
            width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: contain;
          }
          
          .change-image-btn {
            position: absolute;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            backdrop-filter: blur(5px);
          }
          
          /* Post card */
          .post-card {
            background: white;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            margin-bottom: 20px;
            transition: all 0.3s ease;
          }
          
          .post-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
          }
          
          .post-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          
          .user-info {
            display: flex;
            align-items: center;
          }
          
          .user-info h4 {
            margin: 0;
            font-weight: 600;
            color: var(--dark);
          }
          
          .post-time {
            margin: 0;
            font-size: 0.8rem;
            color: var(--gray);
            margin-top: 2px;
          }
          
          .post-content {
            margin-bottom: 15px;
          }
          
          .post-content p {
            font-size: 16px;
            line-height: 1.6;
            color: var(--dark);
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
            font-size: 0.9rem;
            cursor: pointer;
            padding: 0;
            font-weight: 600;
          }
          
          .post-image-container {
            margin-bottom: 15px;
          }
          
          .post-image {
            max-width: 100%;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          
          .post-actions {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .like-btn, .comment-toggle-btn, .delete-btn {
            padding: 10px 16px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .like-btn {
            background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
            color: white;
          }
          
          .like-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
          }
          
          .comment-toggle-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            color: white;
          }
          
          .comment-toggle-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          }
          
          .delete-btn {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            color: white;
          }
          
          .delete-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(100, 116, 139, 0.3);
          }
          
          /* Comments section */
          .comments-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--light-gray);
          }
          
          .comments-list {
            margin-bottom: 15px;
            max-height: 300px;
            overflow-y: auto;
          }
          
          .comment {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 10px;
            border: 1px solid var(--light-gray);
          }
          
          .comment-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            gap: 10px;
          }
          
          .comment-header span {
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .comment p {
            font-size: 0.9rem;
            color: var(--dark);
            line-height: 1.5;
            margin-left: 40px;
          }
          
          .comment-form {
            display: flex;
            gap: 10px;
          }
          
          .comment-form input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid var(--light-gray);
            border-radius: 25px;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .comment-form input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          .comment-form button {
            padding: 12px 20px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .comment-form button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          
          /* Admin views */
          .admin-view {
            background: white;
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          
          .admin-view h2 {
            margin-bottom: 20px;
            font-size: 1.5rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          /* Empty state */
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          
          .empty-state p {
            color: var(--gray);
            font-size: 1rem;
          }
          
          .empty-state p:last-child {
            color: #9ca3af;
            font-size: 0.9rem;
            margin-top: 5px;
          }
          
          /* Responsive */
          @media (max-width: 1024px) {
            .main-content {
              flex-direction: column;
            }
            
            .sidebar {
              width: 100%;
              position: static;
              max-height: none;
            }
          }
          
          @media (max-width: 768px) {
            .header {
              flex-direction: column;
              align-items: flex-start;
              gap: 15px;
            }
            
            .header-actions {
              width: 100%;
              justify-content: space-between;
            }
            
            .post-actions {
              flex-wrap: wrap;
            }
            
            .form-actions {
              flex-direction: column;
            }
          }
        `}
      </style>

      {/* Header */}
      <header className="header">
        <div>
          <h1>🌟 Social Network</h1>
          <p>Benvenuto, {payload?.username || "Utente"}!</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate("/profile")} className="profile-btn">
            👤 Profilo
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar fade-in">
          <UserList
            users={users}
            loggedUserId={loggedUserId}
            followingStates={followingStates}
            token={token}
            isAdmin={isAdmin}
            handleDeleteUser={isAdmin ? handleDeleteUser : null}
            navigate={navigate}
          />
        </aside>

        {/* Main Content */}
        <main className="content-area">
          <NavigationButtons activeView={activeView} setActiveView={setActiveView} isAdmin={isAdmin} />

          {/* Feed View */}
          {activeView === "feed" && (
            <div className="fade-in">
              <CreatePostForm
                newPostContent={newPostContent}
                setNewPostContent={setNewPostContent}
                newPostImage={newPostImage}
                setNewPostImage={setNewPostImage}
                handleCreatePost={handleCreatePost}
              />

              {/* Posts Feed */}
              <div>
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📝</div>
                    <p>Nessun post disponibile.</p>
                    <p>Sii il primo a condividere qualcosa!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      loggedUserId={loggedUserId}
                      followingStates={followingStates}
                      token={token}
                      handleLike={handleLike}
                      handleCommentSubmit={handleCommentSubmit}
                      commentText={commentText}
                      setCommentText={setCommentText}
                      isAdmin={isAdmin}
                      handleDeletePost={handleDeletePost}
                      navigate={navigate}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Admin Users View */}
          {isAdmin && activeView === "admin-users" && (
            <div className="admin-view fade-in">
              <h2
                style={{
                  background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                👥 Gestione Utenti (Solo Admin)
              </h2>
              <div>
                {users.map((user) => (
                  <div key={user.id} className="user-card fade-in">
                    <div className="user-info">
                      <UserAvatar username={user.username} onClick={() => navigate(`/user/${user.username}`)} />
                      <div>
                        <span
                          onClick={() => navigate(`/user/${user.username}`)}
                          style={{ cursor: "pointer" }}
                          title={`Visualizza profilo di @${user.username}`}
                        >
                          {user.username}
                        </span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">
                      🗑️ Elimina
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Posts View */}
          {isAdmin && activeView === "admin-posts" && (
            <div className="admin-view fade-in">
              <h2
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                📝 Gestione Post
              </h2>
              <div>
                {posts.map((post) => (
                  <div key={post.id} className="user-card fade-in">
                    <div>
                      <span
                        style={{ fontWeight: "700", cursor: "pointer" }}
                        onClick={() => navigate(`/user/${post.author?.username}`)}
                        title={`Visualizza profilo di @${post.author?.username}`}
                      >
                        {post.author?.username || "Utente"}
                      </span>
                      <span style={{ color: "var(--gray)" }}>: {post.content?.slice(0, 50)}...</span>
                    </div>
                    <button onClick={() => handleDeletePost(post.id)} className="delete-btn">
                      🗑️ Elimina Post
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Comments View */}
          {isAdmin && activeView === "admin-comments" && (
            <div className="admin-view fade-in">
              <h2
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                💬 Gestione Commenti
              </h2>
              <div>
                {comments.map((comment) => (
                  <div key={comment.id} className="user-card fade-in">
                    <div>
                      <span
                        style={{ fontWeight: "700", cursor: "pointer" }}
                        onClick={() => navigate(`/user/${comment.author?.username}`)}
                        title={`Visualizza profilo di @${comment.author?.username}`}
                      >
                        {comment.author?.username || "Utente"}
                      </span>
                      <span style={{ color: "var(--gray)" }}>: {comment.text}</span>
                    </div>
                    <button onClick={() => handleDeleteComment(comment.id)} className="delete-btn">
                      🗑️ Elimina Commento
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}