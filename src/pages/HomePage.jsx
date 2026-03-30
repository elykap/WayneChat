import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  const loadCommunities = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('communities')
      .select('id, slug, name, description')
      .order('name', { ascending: true })

    if (fetchError) {
      console.error('Communities load error:', fetchError)
      setCommunities([])
      setError(fetchError.message || 'Could not load communities. Please try again.')
    } else {
      setCommunities(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCommunities()
  }, [loadCommunities])

  async function handleRetry() {
    setRetrying(true)
    await loadCommunities()
    setRetrying(false)
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <h1 className="home__title">Communities</h1>
          <p className="home__subtitle">
            Signed in as {user?.email}
          </p>
        </div>
        <button type="button" className="home__logout" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="home__main">
        {loading ? (
          <p className="home__loading" role="status" aria-live="polite">
            Loading communities…
          </p>
        ) : null}

        {error ? (
          <div className="home__error-wrap">
            <p className="home__error" role="alert">
              {error}
            </p>
            <button
              type="button"
              className="home__retry"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? 'Retrying…' : 'Try again'}
            </button>
          </div>
        ) : null}

        {!loading && !error && communities.length === 0 ? (
          <div className="home__empty" role="status">
            <p className="home__empty-title">No communities found</p>
            <p className="home__empty-desc">
              If this is unexpected, run the seed SQL in Supabase or check your connection.
            </p>
          </div>
        ) : null}

        {!loading && communities.length > 0 ? (
          <ul className="home__list">
            {communities.map((c) => (
              <li key={c.id}>
                <Link to={`/c/${c.slug}`} className="home__card">
                  <h2 className="home__card-name">{c.name}</h2>
                  {c.description ? (
                    <p className="home__card-desc">{c.description}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  )
}

export default HomePage
