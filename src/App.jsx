import { Routes, Route } from 'react-router-dom'
import WcButton from './components/WcButton'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ModeratorRoute from './components/ModeratorRoute'
import { AuthProvider } from './context/AuthContext'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LegalPage from './pages/LegalPage'
import HomePage from './pages/HomePage'
import CommunityPage from './pages/CommunityPage'
import PostPage from './pages/PostPage'
import ModerationPage from './pages/ModerationPage'

function App() {
  return (
    <AuthProvider>
      <WcButton />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/c/:slug"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p/:postId"
            element={
              <ProtectedRoute>
                <PostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderation"
            element={
              <ProtectedRoute>
                <ModeratorRoute>
                  <ModerationPage />
                </ModeratorRoute>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
