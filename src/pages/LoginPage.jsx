import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './LoginPage.css'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/home')
  }

  return (
    <div className="login">
      <div className="login__brand">
        <h1 className="login__title">WayneChat</h1>
      </div>
      <main className="login__main">
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          {successMessage ? <p className="login__switch">{successMessage}</p> : null}
          {error ? <p className="login__switch">{error}</p> : null}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          <button type="submit" className="login__submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
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
