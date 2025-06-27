"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLocation } from "react-router-dom"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: "",
    profile_picture: null,
    website: ""
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [posts, setPosts] = useState([])

  const { username } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem("access")

  // User info from token
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null
  const loggedUserId = payload?.user_id
  const isCurrentUser = username === payload?.username

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/accounts/${username}/`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) throw new Error("Profilo non trovato")
        const data = await response.json()
        setProfile(data)
        setFormData({
          bio: data.bio || "",
          website: data.website || "",
          profile_picture: null
        })

        // Fetch user's posts
        const postsResponse = await fetch(`http://localhost:8000/api/posts/?author=${data.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          setPosts(postsData)
        }

      } catch (err) {
        console.error(err)
        setError(err.message)
        navigate("/home")
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchProfile()
    else navigate("/")
  }, [username, token, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, profile_picture: e.target.files[0] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("bio", formData.bio)
      formDataToSend.append("website", formData.website)
      if (formData.profile_picture) {
        formDataToSend.append("profile_picture", formData.profile_picture)
      }

      const response = await fetch(`http://localhost:8000/api/accounts/${username}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (!response.ok) throw new Error("Errore durante l'aggiornamento")

      const updatedData = await response.json()
      setProfile(updatedData)
      setIsEditing(false)
      // Refresh the page to show updated data
      window.location.reload()

    } catch (err) {
      console.error(err)
      setError("Errore durante il salvataggio")
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Caricamento profilo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ Errore</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="profile-page-container">
      <style>
        {`
          .profile-page-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .profile-header {
            display: flex;
            gap: 40px;
            align-items: center;
            margin-bottom: 40px;
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          
          .profile-avatar {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid #f1f5f9;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          
          .profile-info {
            flex: 1;
          }
          
          .profile-name {
            font-size: 2rem;
            margin: 0 0 10px 0;
            color: #1e293b;
          }
          
          .profile-username {
            font-size: 1.2rem;
            color: #64748b;
            margin: 0 0 20px 0;
          }
          
          .profile-bio {
            font-size: 1rem;
            line-height: 1.6;
            color: #334155;
            margin-bottom: 15px;
          }
          
          .profile-website a {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
          }
          
          .profile-website a:hover {
            text-decoration: underline;
          }
          
          .profile-stats {
            display: flex;
            gap: 30px;
            margin-top: 20px;
          }
          
          .stat-item {
            text-align: center;
          }
          
          .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            color: #6366f1;
          }
          
          .stat-label {
            font-size: 0.9rem;
            color: #64748b;
          }
          
          .profile-actions {
            margin-top: 20px;
            display: flex;
            gap: 15px;
          }
          
          .edit-btn, .save-btn, .cancel-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .edit-btn, .save-btn {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
          }
          
          .cancel-btn {
            background: #e2e8f0;
            color: #64748b;
          }
          
          .edit-btn:hover, .save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          
          .cancel-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          }
          
          .profile-posts {
            margin-top: 40px;
          }
          
          .profile-posts h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #1e293b;
          }
          
          .edit-form {
            width: 100%;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #334155;
          }
          
          .form-group textarea, .form-group input[type="text"], .form-group input[type="url"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          
          .form-group textarea {
            min-height: 120px;
            resize: vertical;
          }
          
          .form-group textarea:focus, .form-group input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          .file-upload {
            margin-top: 20px;
          }
          
          .file-upload-label {
            display: inline-block;
            padding: 10px 20px;
            background: #f1f5f9;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .file-upload-label:hover {
            background: #e2e8f0;
          }
          
          .empty-posts {
            text-align: center;
            padding: 40px 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          
          .empty-posts p {
            color: #64748b;
            font-size: 1.1rem;
          }
          
          @media (max-width: 768px) {
            .profile-header {
              flex-direction: column;
              text-align: center;
              gap: 20px;
            }
            
            .profile-stats {
              justify-content: center;
            }
            
            .profile-actions {
              justify-content: center;
            }
          }
        `}
      </style>

      {profile && (
        <>
          <div className="profile-header">
            <div>
              {isEditing ? (
                <div className="file-upload">
                  <label htmlFor="profile-picture-upload" className="file-upload-label">
                    {formData.profile_picture ? "Cambia immagine" : "Carica immagine"}
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {formData.profile_picture ? (
                    <img
                      src={URL.createObjectURL(formData.profile_picture)}
                      alt="Preview"
                      className="profile-avatar"
                    />
                  ) : (
                    <img
                      src={profile.profile_picture || "/default-avatar.png"}
                      alt={profile.username}
                      className="profile-avatar"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={profile.profile_picture || "/default-avatar.png"}
                  alt={profile.username}
                  className="profile-avatar"
                />
              )}
            </div>

            <div className="profile-info">
              {isEditing ? (
                <form className="edit-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Sito Web</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="profile-actions">
                    <button type="submit" className="save-btn">
                      💾 Salva modifiche
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      ❌ Annulla
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="profile-name">{profile.first_name || profile.username}</h1>
                  <h2 className="profile-username">@{profile.username}</h2>

                  {profile.bio && <p className="profile-bio">{profile.bio}</p>}

                  {profile.website && (
                    <p className="profile-website">
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </p>
                  )}

                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-number">{profile.posts_count || 0}</div>
                      <div className="stat-label">Post</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{profile.followers_count || 0}</div>
                      <div className="stat-label">Follower</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{profile.following_count || 0}</div>
                      <div className="stat-label">Seguiti</div>
                    </div>
                  </div>

                  {isCurrentUser && (
                    <div className="profile-actions">
                      <button
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        ✏️ Modifica profilo
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="profile-posts">
            <h2>Post di @{profile.username}</h2>

            {posts.length > 0 ? (
              <div className="posts-grid">
                {posts.map(post => (
                  <div key={post.id} className="post-card">
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="post-image"
                        onClick={() => navigate(`/post/${post.id}`)}
                      />
                    )}
                    <div className="post-content">
                      <p>{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-posts">
                <p>Nessun post ancora pubblicato.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}