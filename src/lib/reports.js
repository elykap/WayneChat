export const DEFAULT_REPORT_REASON = 'Inappropriate or concerning content'

/**
 * Prompts for an optional reason, then inserts a report row.
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
export async function submitReport(client, { userId, targetType, targetPostId, targetReplyId }) {
  const input = window.prompt('Brief reason (optional; leave blank for a default):', '')
  if (input === null) {
    return { ok: false, cancelled: true }
  }

  const reason = input.trim() || DEFAULT_REPORT_REASON

  const payload = {
    reporter_id: userId,
    target_type: targetType,
    reason,
    target_post_id: null,
    target_reply_id: null,
  }

  if (targetType === 'post') {
    payload.target_post_id = targetPostId
  } else {
    payload.target_reply_id = targetReplyId
  }

  const { error } = await client.from('reports').insert(payload)

  if (error) {
    console.error('Report insert error:', error)
    window.alert(`Could not submit report: ${error.message}`)
    return { ok: false, error }
  }

  window.alert('Report submitted. Thank you.')
  return { ok: true }
}
