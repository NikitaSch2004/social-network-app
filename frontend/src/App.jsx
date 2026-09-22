import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import FollowingPage from './pages/FollowingPage'
import MyPostsPage from './pages/MyPostsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { clearAuth, getCurrentUsername } from './api'

function App() {
  const [currentUser, setCurrentUser] = useState(
    getCurrentUsername() ? { username: getCurrentUsername() } : null
  )

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    clearAuth()
    setCurrentUser(null)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar user={currentUser} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage currentUser={currentUser} />} />
            <Route path="/following" element={<FollowingPage currentUser={currentUser} />} />
            <Route path="/my-posts" element={<MyPostsPage currentUser={currentUser} />} />
            <Route path="/profile/:username" element={<ProfilePage currentUser={currentUser} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
