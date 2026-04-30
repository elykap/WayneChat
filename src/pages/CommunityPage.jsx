import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { submitReport } from '../lib/reports'
import './CommunityPage.css'

function CommunityPage() {
  const { slug } = useParams()
  const { user } = useAuth()

  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [postsRefreshing, setPostsRefreshing] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [postSearchQuery, setPostSearchQuery] = useState('')

  const refreshPosts = useCallback(async (communityId) => {
    if (!communityId) return

    setPostsRefreshing(true)
    setLoadError('')

    const { data: postRows, error: postsErr } = await supabase
      .from('posts')
      .select('id, title, body, created_at, author_id, profiles(display_name)')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })

    if (postsErr) {
      console.error('Posts refresh error:', postsErr)
      setLoadError(postsErr.message || 'Could not refresh posts.')
    } else {
      setPosts(postRows ?? [])
    }
    setPostsRefreshing(false)
  }, [])

  const loadCommunityAndPosts = useCallback(async () => {
    if (!slug) return

    setPostSearchQuery('')
    setLoading(true)
    setLoadError('')

    const { data: comm, error: commErr } = await supabase
      .from('communities')
      .select('id, slug, name, description')
      .eq('slug', slug)
      .maybeSingle()

    if (commErr) {
      console.error('Community load error:', commErr)
      setCommunity(null)
      setPosts([])
      setLoadError(commErr.message || 'Could not load this community.')
      setLoading(false)
      return
    }

    if (!comm) {
      setCommunity(null)
      setPosts([])
      setLoadError('')
      setLoading(false)
      return
    }

    setCommunity(comm)

    const { data: postRows, error: postsErr } = await supabase
      .from('posts')
      .select('id, title, body, created_at, author_id, profiles(display_name)')
      .eq('community_id', comm.id)
      .order('created_at', { ascending: false })

    if (postsErr) {
      console.error('Posts load error:', postsErr)
      setPosts([])
      setLoadError(postsErr.message || 'Could not load posts.')
    } else {
      setPosts(postRows ?? [])
    }

    setLoading(false)
  }, [slug])

  useEffect(() => {
    loadCommunityAndPosts()
  }, [loadCommunityAndPosts])

  useEffect(() => {
    if (!community?.id) return undefined

    const channel = supabase
      .channel(`posts-community-${community.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `community_id=eq.${community.id}`,
        },
        async (payload) => {
          const newId = payload.new?.id
          if (!newId) return

          const { data, error } = await supabase
            .from('posts')
            .select('id, title, body, created_at, author_id, profiles(display_name)')
            .eq('id', newId)
            .maybeSingle()

          if (error) {
            console.error('Realtime post fetch error:', error)
            return
          }
          if (!data) return

          setPosts((prev) => {
            if (prev.some((p) => p.id === data.id)) return prev
            const next = [...prev, data]
            next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            return next
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [community?.id])

  const filteredPosts = useMemo(() => {
    const q = postSearchQuery.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => {
      const title = (p.title ?? '').toLowerCase()
      const body = (p.body ?? '').toLowerCase()
      return title.includes(q) || body.includes(q)
    })
  }, [posts, postSearchQuery])

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!community || !user || submitting || postsRefreshing) return

    setSubmitError('')
    setSubmitting(true)

    const { error } = await supabase.from('posts').insert({
      community_id: community.id,
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
    })

    if (error) {
      console.error('Create post error:', error)
      setSubmitError(error.message || 'Could not create post.')
      setSubmitting(false)
      return
    }

    setTitle('')
    setBody('')
    await refreshPosts(community.id)
    setSubmitting(false)
  }

  async function handleReportPost(postId) {
    if (!user) return
    await submitReport(supabase, {
      userId: user.id,
      targetType: 'post',
      targetPostId: postId,
    })
  }

  const formDisabled = submitting || postsRefreshing

  if (loading) {
    return (
      <div className="community">
        <Link to="/home" className="community__back">
          ← All communities
        </Link>
        <p className="community__loading" role="status" aria-live="polite">
          Loading community and posts…
        </p>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="community">
        <Link to="/home" className="community__back">
          ← All communities
        </Link>
        <div className="community__header">
          <h1 className="community__title">
            {loadError ? 'Could not load community' : 'Community not found'}
          </h1>
          <p className="community__desc">
            {loadError ? (
              loadError
            ) : (
              <>
                There is no community with slug <strong>{slug}</strong>.
              </>
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="community">
      <Link to="/home" className="community__back">
        ← All communities
      </Link>

      <header className="community__header">
        <h1 className="community__title">{community.name}</h1>
        {community.description ? (
          <p className="community__desc">{community.description}</p>
        ) : null}
      </header>

      {loadError ? (
        <p className="community__error" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="community__main">
        <section aria-labelledby="new-post-heading">
          <h2 id="new-post-heading" className="community__section-title">
            New post
          </h2>
          <form className="community__form" onSubmit={handleCreatePost}>
            {submitError ? (
              <p className="community__form-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <label className="community__label" htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              className="community__input"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to talk about?"
              required
              maxLength={200}
              disabled={formDisabled}
            />
            <label className="community__label" htmlFor="post-body">
              Message
            </label>
            <textarea
              id="post-body"
              className="community__textarea"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts…"
              required
              maxLength={8000}
              rows={5}
              disabled={formDisabled}
            />
            <button type="submit" className="community__submit" disabled={formDisabled}>
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </form>
        </section>

        <section aria-labelledby="feed-heading">
          <h2 id="feed-heading" className="community__section-title">
            Recent posts
          </h2>
          <label className="community__label community__label--search" htmlFor="post-search">
            Search posts
          </label>
          <input
            id="post-search"
            type="search"
            className="community__input community__search"
            value={postSearchQuery}
            onChange={(e) => setPostSearchQuery(e.target.value)}
            placeholder="Filter by title or message…"
            autoComplete="off"
            disabled={postsRefreshing}
          />
          {postsRefreshing ? (
            <p className="community__inline-status" role="status" aria-live="polite">
              Updating posts…
            </p>
          ) : null}
          {!loadError && !postsRefreshing && posts.length === 0 ? (
            <div className="community__empty" role="status">
              <p className="community__empty-title">No posts yet</p>
              <p className="community__empty-desc">Start the conversation with a new post above.</p>
            </div>
          ) : null}
          {!loadError && !postsRefreshing && posts.length > 0 && filteredPosts.length === 0 ? (
            <div className="community__empty" role="status">
              <p className="community__empty-title">No posts found</p>
              <p className="community__empty-desc">Try a different search or clear the filter.</p>
            </div>
          ) : null}
          {filteredPosts.length > 0 ? (
            <ul className="community__posts">
              {filteredPosts.map((post) => {
                const displayName = post.profiles?.display_name ?? 'Member'
                const date = post.created_at
                  ? new Date(post.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : ''
                return (
                  <li key={post.id} className="community__post-row">
                    <Link to={`/p/${post.id}`} className="community__post community__post-main community__post-link">
                      <h3 className="community__post-title">{post.title}</h3>
                      <p className="community__post-meta">
                        {displayName}
                        {date ? ` · ${date}` : ''}
                      </p>
                      <p className="community__post-body">{post.body}</p>
                    </Link>
                    <button
                      type="button"
                      className="community__report"
                      onClick={() => handleReportPost(post.id)}
                      disabled={postsRefreshing}
                    >
                      Report
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default CommunityPage
