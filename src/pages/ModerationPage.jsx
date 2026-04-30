import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './ModerationPage.css'

function ModerationPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('reports')
      .select(
        'id, reason, target_type, target_post_id, target_reply_id, reporter_id, created_at',
      )
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Reports load error:', fetchError)
      setReports([])
      setError(fetchError.message || 'Could not load reports.')
    } else {
      setReports(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  return (
    <div className="moderation">
      <Link to="/home" className="moderation__back">
        ← Communities
      </Link>

      <header className="moderation__header">
        <h1 className="moderation__title">Moderation</h1>
        <p className="moderation__subtitle">Reports submitted by users (read-only).</p>
        {/* TODO: add reviewed/status on reports and allow marking reviewed when schema supports it */}
      </header>

      <main className="moderation__main">
        {loading ? (
          <p className="moderation__loading" role="status" aria-live="polite">
            Loading reports…
          </p>
        ) : null}

        {error ? (
          <p className="moderation__error" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && reports.length === 0 ? (
          <div className="moderation__empty" role="status">
            <p className="moderation__empty-title">No reports yet</p>
            <p className="moderation__empty-desc">Nothing to show.</p>
          </div>
        ) : null}

        {!loading && reports.length > 0 ? (
          <ul className="moderation__list">
            {reports.map((r) => {
              const created = r.created_at
                ? new Date(r.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : ''
              return (
                <li key={r.id} className="moderation__card">
                  <p className="moderation__reason">{r.reason}</p>
                  <dl className="moderation__meta">
                    <div className="moderation__row">
                      <dt>Target</dt>
                      <dd>
                        {r.target_type}
                        {r.target_post_id ? ` · post ${r.target_post_id}` : ''}
                        {r.target_reply_id ? ` · reply ${r.target_reply_id}` : ''}
                      </dd>
                    </div>
                    <div className="moderation__row">
                      <dt>Reporter</dt>
                      <dd>{r.reporter_id ?? '—'}</dd>
                    </div>
                    <div className="moderation__row">
                      <dt>Submitted</dt>
                      <dd>{created || '—'}</dd>
                    </div>
                  </dl>
                </li>
              )
            })}
          </ul>
        ) : null}
      </main>
    </div>
  )
}

export default ModerationPage
