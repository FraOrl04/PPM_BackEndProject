import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AuthPage from "./AutenticatePage"
import HomePage  from "./HomePage"
import PrivateRoute from "./PrivateRoute.jsx"
import ProfilePage  from "./ProfilePage.jsx";
import UserProfilePage from "./UserProfilePage.jsx"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:username" element={<UserProfilePage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
// In App.jsx o dove definisci le route
      </Routes>
    </Router>
  )
}
export default App;