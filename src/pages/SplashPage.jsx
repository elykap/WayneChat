import { Link } from 'react-router-dom'
import './SplashPage.css'

function SplashPage() {
  return (
    <div className="splash">
      <main className="splash__main">
        <h1 className="splash__title">WayneChat</h1>
        <p className="splash__tagline">
          Anonymous chat for verified WSU students and faculty
        </p>
        <div className="splash__actions">
          <Link to="/login" className="splash__cta">
            Log in
          </Link>
          <Link to="/signup" className="splash__link">
            Create account
          </Link>
        </div>
      </main>
      <footer className="splash__footer">
        Verify with your school email to get started
      </footer>
    </div>
  )
}

export default SplashPage
