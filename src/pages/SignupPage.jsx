import { useState } from 'react'
import { Link } from 'react-router-dom'
import './SignupPage.css'

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // Placeholder: no backend yet
  }

  return (
    <div className="signup">
      <div className="signup__brand">
        <h1 className="signup__title">WayneChat</h1>
      </div>
      <main className="signup__main">
        <form className="signup__form" onSubmit={handleSubmit} noValidate>
          <label className="signup__label" htmlFor="signup-name">
            Display name
          </label>
          <input
            id="signup-name"
            type="text"
            name="name"
            className="signup__input"
            placeholder="How you’ll appear in chat"
            autoComplete="name"
          />
          <label className="signup__label" htmlFor="signup-email">
            School email
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            className="signup__input"
            placeholder="you@school.edu"
            autoComplete="email"
            autoCapitalize="off"
          />
          <label className="signup__label" htmlFor="signup-password">
            Password
          </label>
          <div className="signup__input-wrap">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="signup__input"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="signup__password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="signup__submit">
            Create account
          </button>
          <p className="signup__switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </div>
  )
}

export default SignupPage
