import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './SignupPage.css'

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail.endsWith('@wayne.edu')) {
      setError('Please use a valid @wayne.edu email address.')
      return
    }

    setSubmitting(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          display_name: name.trim(),
        },
      },
    })
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    navigate('/login', {
      state: { message: 'Account created successfully. Please log in.' },
    })
  }

  return (
    <div className="signup">
      <div className="signup__brand">
        <h1 className="signup__title">WayneChat</h1>
      </div>
      <main className="signup__main">
        <form className="signup__form" onSubmit={handleSubmit} noValidate>
          {error ? <p className="signup__switch">{error}</p> : null}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          <button type="submit" className="signup__submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
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
