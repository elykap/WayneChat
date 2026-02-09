import { useState } from 'react'
import { Link } from 'react-router-dom'
import './LoginPage.css'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // Placeholder: no backend yet
  }

  return (
    <div className="login">
      <div className="login__brand">
        <h1 className="login__title">WayneChat</h1>
      </div>
      <main className="login__main">
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <label className="login__label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            className="login__input"
            placeholder="you@school.edu"
            autoComplete="email"
            autoCapitalize="off"
          />
          <label className="login__label" htmlFor="login-password">
            Password
          </label>
          <div className="login__input-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="login__input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login__password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="login__submit">
            Log in
          </button>
          <a href="#" className="login__forgot" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
          <p className="login__switch">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </main>
    </div>
  )
}

export default LoginPage
