# WayneChat

WayneChat is a student-term-project web app: authenticated users browse communities, create posts, reply to threads, and submit simple content reports. The backend is [Supabase](https://supabase.com/) (Postgres, Auth, and Realtime).

## Features implemented

- Email/password authentication (Supabase Auth).
- Community list, per-community post feed, and post detail with replies.
- Create posts and replies; report posts or replies (stored in `reports`).
- **Realtime**: new posts in a community and new replies on a post appear for other signed-in users without a full page refresh (requires Realtime enabled in Supabase; see below).
- **Search / filter**: client-side filter on the home community list (name and description) and on each community’s post list (title and body).
- **Moderation dashboard** (`/moderation`): list of all reports for users whose `profiles.role` is `moderator`. Non-moderators are redirected to `/home`; the Moderation link is hidden for them.

## Setup

1. **Clone** the repository and install dependencies:

   ```bash
   npm install
   ```