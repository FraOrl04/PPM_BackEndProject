"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/api/accounts/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      console.log("RESPONSE STATUS:", response.status)
      console.log("DATA:", data)

      if (response.ok) {
        localStorage.setItem("access", data.access)
        localStorage.setItem("refresh", data.refresh)
        navigate("/home")
      } else {
        setError(data.detail || "Credenziali non valide")
      }
    } catch (err) {
      console.error("ERRORE:", err)
      setError("Errore di rete o server non raggiungibile")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/api/accounts/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setIsLogin(true)
          setFormData({ username: "", email: "", password: "" })
        }, 3000)
      } else {
        setError(data.username || data.email || data.password || "Errore nella registrazione")
      }
    } catch (err) {
      console.error(err)
      setError("Errore di rete")
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setSuccess(false)
    setFormData({ username: "", email: "", password: "" })
  }

  // Success screen for registration
  if (success) {
    return (
      <div style={styles.container}>
        <style>
          {`
            @keyframes checkmark {
              0% { transform: scale(0) rotate(0deg); }
              50% { transform: scale(1.2) rotate(180deg); }
              100% { transform: scale(1) rotate(360deg); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .checkmark {
              animation: checkmark 0.8s ease-out;
            }
            .slide-in {
              animation: slideIn 0.6s ease-out;
            }
            .pulse {
              animation: pulse 2s infinite;
            }
          `}
        </style>
        <div style={styles.backgroundDecoration1} className="pulse"></div>
        <div style={styles.backgroundDecoration2}></div>
        <div style={styles.backgroundDecoration3} className="pulse"></div>

        <div style={styles.successContainer} className="slide-in">
          <div style={styles.successIcon} className="checkmark">
            ✅
          </div>
          <h2 style={styles.successTitle}>Registrazione Completata!</h2>
          <p style={styles.successText}>Il tuo account è stato creato con successo.</p>
          <p style={styles.successSubtext}>Verrai reindirizzato al login tra pochi secondi...</p>
          <div style={styles.successSpinner}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Add CSS animations */}
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
            50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
          }
          .slide-in {
            animation: slideIn 0.6s ease-out;
          }
          .slide-in-left {
            animation: slideInLeft 0.6s ease-out;
          }
          .slide-in-right {
            animation: slideInRight 0.6s ease-out;
          }
          .pulse {
            animation: pulse 2s infinite;
          }
          .float {
            animation: float 4s ease-in-out infinite;
          }
          .glow {
            animation: glow 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background decorative elements */}
      <div style={styles.backgroundDecoration1} className="float"></div>
      <div style={styles.backgroundDecoration2} className="glow"></div>
      <div style={styles.backgroundDecoration3} className="float"></div>
      <div style={styles.backgroundDecoration4}></div>

      <div style={styles.formContainer} className="slide-in">
        {/* Header with logo and title */}
        <div style={styles.header}>
          <div style={styles.logo} className="pulse">
            {isLogin ? "🔑" : "✨"}
          </div>
          <h1 style={styles.mainTitle} className={isLogin ? "slide-in-left" : "slide-in-right"}>
            {isLogin ? "Bentornato!" : "Unisciti a Noi!"}
          </h1>
          <p style={styles.subtitle}>
            {isLogin ? "Accedi al tuo Social Network" : "Crea il tuo account e inizia a connetterti"}
          </p>
        </div>

        {/* Toggle buttons */}
        <div style={styles.toggleContainer}>
          <button
            onClick={() => !isLogin && toggleMode()}
            style={{
              ...styles.toggleButton,
              ...(isLogin ? styles.toggleButtonActive : {}),
            }}
            onMouseEnter={(e) => {
              if (!isLogin) {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.3)"
              }
            }}
            onMouseLeave={(e) => {
              if (!isLogin) {
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "none"
              }
            }}
          >
            🔑 Accedi
          </button>
          <button
            onClick={() => isLogin && toggleMode()}
            style={{
              ...styles.toggleButton,
              ...(!isLogin ? styles.toggleButtonActive : {}),
            }}
            onMouseEnter={(e) => {
              if (isLogin) {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.3)"
              }
            }}
            onMouseLeave={(e) => {
              if (isLogin) {
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "none"
              }
            }}
          >
            ✨ Registrati
          </button>
        </div>

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <div style={styles.inputContainer} className="slide-in">
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = isLogin ? "#667eea" : "#10b981"
                  e.target.style.boxShadow = `0 0 0 3px ${isLogin ? "rgba(102, 126, 234, 0.1)" : "rgba(16, 185, 129, 0.1)"}`
                  e.target.style.transform = "translateY(-2px)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb"
                  e.target.style.boxShadow = "none"
                  e.target.style.transform = "translateY(0)"
                }}
              />
            </div>

            {!isLogin && (
              <div style={styles.inputContainer} className="slide-in-right">
                <span style={styles.inputIcon}>📧</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#10b981"
                    e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb"
                    e.target.style.boxShadow = "none"
                    e.target.style.transform = "translateY(0)"
                  }}
                />
              </div>
            )}

            <div style={styles.inputContainer} className="slide-in">
              <span style={styles.inputIcon}>🔒</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = isLogin ? "#667eea" : "#10b981"
                  e.target.style.boxShadow = `0 0 0 3px ${isLogin ? "rgba(102, 126, 234, 0.1)" : "rgba(16, 185, 129, 0.1)"}`
                  e.target.style.transform = "translateY(-2px)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb"
                  e.target.style.boxShadow = "none"
                  e.target.style.transform = "translateY(0)"
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(isLogin ? styles.submitButtonLogin : styles.submitButtonRegister),
              ...(loading ? styles.submitButtonLoading : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-3px)"
                e.target.style.boxShadow = isLogin
                  ? "0 10px 30px rgba(102, 126, 234, 0.6)"
                  : "0 10px 30px rgba(16, 185, 129, 0.6)"
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = isLogin
                  ? "0 6px 20px rgba(102, 126, 234, 0.4)"
                  : "0 6px 20px rgba(16, 185, 129, 0.4)"
              }
            }}
          >
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <span>{isLogin ? "Accesso in corso..." : "Creazione account..."}</span>
              </div>
            ) : (
              <span>{isLogin ? "🚀 Accedi" : "✨ Crea Account"}</span>
            )}
          </button>

          {error && (
            <div style={styles.errorContainer} className="slide-in">
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isLogin ? "Non hai un account?" : "Hai già un account?"}{" "}
            <button onClick={toggleMode} style={styles.footerLink}>
              {isLogin ? "Registrati qui" : "Accedi qui"}
            </button>
          </p>

          <div style={styles.features}>
            {isLogin ? (
              <>
                <div style={styles.feature}>
                  <span>🌟</span>
                  <span>Connessioni illimitate</span>
                </div>
                <div style={styles.feature}>
                  <span>💬</span>
                  <span>Chat in tempo reale</span>
                </div>
                <div style={styles.feature}>
                  <span>📸</span>
                  <span>Condividi momenti</span>
                </div>
              </>
            ) : (
              <>
                <div style={styles.feature}>
                  <span>🎉</span>
                  <span>Gratis per sempre</span>
                </div>
                <div style={styles.feature}>
                  <span>🔒</span>
                  <span>Sicuro e privato</span>
                </div>
                <div style={styles.feature}>
                  <span>⚡</span>
                  <span>Setup istantaneo</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #10b981 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  backgroundDecoration1: {
    position: "absolute",
    top: "10%",
    left: "8%",
    width: "150px",
    height: "150px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    filter: "blur(40px)",
  },
  backgroundDecoration2: {
    position: "absolute",
    bottom: "15%",
    right: "10%",
    width: "200px",
    height: "200px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "50%",
    filter: "blur(60px)",
  },
  backgroundDecoration3: {
    position: "absolute",
    top: "50%",
    left: "5%",
    width: "100px",
    height: "100px",
    background: "rgba(255, 255, 255, 0.12)",
    borderRadius: "50%",
    filter: "blur(30px)",
  },
  backgroundDecoration4: {
    position: "absolute",
    top: "20%",
    right: "20%",
    width: "80px",
    height: "80px",
    background: "rgba(255, 255, 255, 0.06)",
    borderRadius: "50%",
    filter: "blur(25px)",
  },
  formContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "40px",
    borderRadius: "25px",
    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "480px",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  header: {
    textAlign: "center",
    marginBottom: "35px",
  },
  logo: {
    fontSize: "4rem",
    marginBottom: "15px",
  },
  mainTitle: {
    fontSize: "2.2rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #10b981 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    margin: 0,
    fontWeight: "500",
  },
  toggleContainer: {
    display: "flex",
    background: "#f3f4f6",
    borderRadius: "20px",
    padding: "6px",
    marginBottom: "35px",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
  },
  toggleButton: {
    flex: 1,
    padding: "14px 20px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    transition: "all 0.3s ease",
    background: "transparent",
    color: "#6b7280",
  },
  toggleButtonActive: {
    background: "linear-gradient(135deg, #667eea 0%, #10b981 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transform: "translateY(-1px)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "30px",
  },
  inputContainer: {
    position: "relative",
    marginBottom: "20px",
  },
  inputIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "18px 18px 18px 50px",
    border: "2px solid #e5e7eb",
    borderRadius: "15px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    background: "rgba(248, 250, 252, 0.8)",
    boxSizing: "border-box",
    fontWeight: "500",
  },
  submitButton: {
    padding: "18px 30px",
    color: "white",
    border: "none",
    borderRadius: "15px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "700",
    transition: "all 0.3s ease",
    marginBottom: "25px",
  },
  submitButtonLogin: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
  },
  submitButtonRegister: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
  },
  submitButtonLoading: {
    cursor: "not-allowed",
    opacity: 0.8,
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  spinner: {
    width: "22px",
    height: "22px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    borderRadius: "15px",
    marginBottom: "20px",
    border: "1px solid #fca5a5",
  },
  errorIcon: {
    fontSize: "20px",
  },
  errorText: {
    color: "#dc2626",
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    paddingTop: "25px",
    borderTop: "1px solid #e5e7eb",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "15px",
    margin: "0 0 20px 0",
    fontWeight: "500",
  },
  footerLink: {
    background: "none",
    border: "none",
    color: "#667eea",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    textDecoration: "underline",
    transition: "color 0.3s ease",
  },
  features: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px",
  },
  feature: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  // Success page styles
  successContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "50px 40px",
    borderRadius: "25px",
    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    maxWidth: "450px",
  },
  successIcon: {
    fontSize: "5rem",
    marginBottom: "25px",
  },
  successTitle: {
    fontSize: "2.2rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 15px 0",
  },
  successText: {
    color: "#374151",
    fontSize: "18px",
    margin: "0 0 10px 0",
    fontWeight: "600",
  },
  successSubtext: {
    color: "#6b7280",
    fontSize: "15px",
    margin: "0 0 35px 0",
  },
  successSpinner: {
    width: "35px",
    height: "35px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
}
