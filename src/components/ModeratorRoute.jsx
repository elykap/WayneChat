import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ModeratorRoute({ children }) {
  const { user, loading, profile, profileLoading } = useAuth()

  if (loading || profileLoading) {
    return (
      <div className="app-loading-screen">
        <p className="app-status" role="status" aria-live="polite">
          Checking your session…
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'moderator') {
    return <Navigate to="/home" replace />
  }

  return children
}

export default ModeratorRoute
