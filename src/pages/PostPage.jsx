import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { submitReport } from '../lib/reports'
import './PostPage.css'

function PostPage() {
  const { postId } = useParams()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [repliesBusy, setRepliesBusy] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const refreshReplies = useCallback(async () => {
    if (!postId) return

    setRepliesBusy(true)
    setLoadError('')

    const { data: replyRows, error: repliesErr } = await supabase
      .from('replies')
      .select('id, body, created_at, author_id, profiles(display_name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (repliesErr) {
      console.error('Replies refresh error:', repliesErr)
      setLoadError(repliesErr.message || 'Could not refresh replies.')
    } else {
      setReplies(replyRows ?? [])
    }
    setRepliesBusy(false)
  }, [postId])

  const loadPostAndReplies = useCallback(async () => {
    if (!postId) return

    setLoading(true)
    setLoadError('')

    const { data: postRow, error: postErr } = await supabase
      .from('posts')
      .select('id, title, body, created_at, author_id, profiles(display_name), communities(slug, name)')
      .eq('id', postId)
      .maybeSingle()

    if (postErr) {
      console.error('Post load error:', postErr)
      setPost(null)
      setReplies([])
      setLoadError(postErr.message || 'Could not load this post.')
      setLoading(false)
      return
    }

    if (!postRow) {
      setPost(null)
      setReplies([])
      setLoadError('')
      setLoading(false)
      return
    }

    setPost(postRow)

    const { data: replyRows, error: repliesErr } = await supabase
      .from('replies')
      .select('id, body, created_at, author_id, profiles(display_name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (repliesErr) {
      console.error('Replies load error:', repliesErr)
      setReplies([])
      setLoadError(repliesErr.message || 'Could not load replies.')
    } else {
      setReplies(replyRows ?? [])
    }

    setLoading(false)
  }, [postId])

  useEffect(() => {
    loadPostAndReplies()
  }, [loadPostAndReplies])

  useEffect(() => {
    if (!post?.id || !postId) return undefined

    const channel = supabase
      .channel(`replies-post-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'replies',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const newId = payload.new?.id
          if (!newId) return

          const { data, error } = await supabase
            .from('replies')
            .select('id, body, created_at, author_id, profiles(display_name)')
            .eq('id', newId)
            .maybeSingle()

          if (error) {
            console.error('Realtime reply fetch error:', error)
            return
          }
          if (!data) return

          setReplies((prev) => {
            if (prev.some((r) => r.id === data.id)) return prev
            const next = [...prev, data]
            next.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            return next
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [post?.id, postId])

  async function handleReportPost() {
    if (!post?.id || !user || repliesBusy) return
    await submitReport(supabase, {
      userId: user.id,
      targetType: 'post',
      targetPostId: post.id,
    })
  }

  async function handleReportReply(replyId) {
    if (!user || repliesBusy) return
    await submitReport(supabase, {
      userId: user.id,
      targetType: 'reply',
      targetReplyId: replyId,
    })
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!postId || !user || submitting || repliesBusy) return

    setSubmitError('')
    setSubmitting(true)

    const { error } = await supabase.from('replies').insert({
      post_id: postId,
      author_id: user.id,
      body: replyBody.trim(),
    })

    if (error) {
      console.error('Reply create error:', error)
      setSubmitError(error.message || 'Could not send reply.')
      setSubmitting(false)
      return
    }

    setReplyBody('')
    await refreshReplies()
    setSubmitting(false)
  }

  const communitySlug = post?.communities?.slug
  const backToCommunity =
    communitySlug != null ? `/c/${communitySlug}` : '/home'

  const replyFormDisabled = submitting || repliesBusy

  if (loading) {
    return (
      <div className="post">
        <Link to={backToCommunity} className="post__back">
          ← Back to community
        </Link>
        <p className="post__loading" role="status" aria-live="polite">
          Loading post and replies…
        </p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="post">
        <Link to="/home" className="post__back">
          ← All communities
        </Link>
        <div className="post__article">
          <h1 className="post__title">{loadError ? 'Could not load post' : 'Post not found'}</h1>
          <p className="post__meta">
            {loadError
              ? loadError
              : 'This post may have been removed or the link is invalid.'}
          </p>
        </div>
      </div>
    )
  }

  const authorName = post.profiles?.display_name ?? 'Member'
  const postDate = post.created_at
    ? new Date(post.created_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : ''

  return (
    <div className="post">
      <Link to={backToCommunity} className="post__back">
        ← Back to {post.communities?.name ?? 'community'}
      </Link>

      {loadError ? (
        <p className="post__error" role="alert">
          {loadError}
        </p>
      ) : null}

      <article className="post__article">
        <h1 className="post__title">{post.title}</h1>
        <div className="post__meta-row">
          <p className="post__meta">
            {authorName}
            {postDate ? ` · ${postDate}` : ''}
          </p>
          <button
            type="button"
            className="post__report"
            onClick={handleReportPost}
            disabled={repliesBusy}
          >
            Report
          </button>
        </div>
        <p className="post__body">{post.body}</p>
      </article>

      <div className="post__main">
        <section aria-labelledby="reply-heading">
          <h2 id="reply-heading" className="post__section-title">
            Add a reply
          </h2>
          <form className="post__form" onSubmit={handleReply}>
            {submitError ? (
              <p className="post__form-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <label className="post__label" htmlFor="reply-body">
              Your reply
            </label>
            <textarea
              id="reply-body"
              className="post__textarea"
              name="body"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply…"
              required
              maxLength={8000}
              rows={4}
              disabled={replyFormDisabled}
            />
            <button type="submit" className="post__submit" disabled={replyFormDisabled}>
              {submitting ? 'Sending…' : 'Reply'}
            </button>
          </form>
        </section>

        <section aria-labelledby="replies-heading">
          <h2 id="replies-heading" className="post__section-title">
            Replies
          </h2>
          {repliesBusy ? (
            <p className="post__inline-status" role="status" aria-live="polite">
              Updating replies…
            </p>
          ) : null}
          {!loadError && !repliesBusy && replies.length === 0 ? (
            <div className="post__empty" role="status">
              <p className="post__empty-title">No replies yet</p>
              <p className="post__empty-desc">Be the first to respond using the form above.</p>
            </div>
          ) : null}
          {replies.length > 0 ? (
            <ul className="post__replies">
              {replies.map((reply) => {
                const name = reply.profiles?.display_name ?? 'Member'
                const date = reply.created_at
                  ? new Date(reply.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : ''
                return (
                  <li key={reply.id} className="post__reply">
                    <div className="post__reply-head">
                      <p className="post__reply-meta">
                        {name}
                        {date ? ` · ${date}` : ''}
                      </p>
                      <button
                        type="button"
                        className="post__report"
                        onClick={() => handleReportReply(reply.id)}
                        disabled={repliesBusy}
                      >
                        Report
                      </button>
                    </div>
                    <p className="post__reply-body">{reply.body}</p>
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

export default PostPage
