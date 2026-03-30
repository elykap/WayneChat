insert into public.communities (slug, name, description)
values
  (
    'general',
    'General',
    'Campus-wide chat and introductions'
  ),
  (
    'academics',
    'Academics',
    'Classes, advising, study tips'
  ),
  (
    'campus-life',
    'Campus Life',
    'Clubs, food, getting around campus'
  ),
  (
    'housing',
    'Housing',
    'Dorms, roommates, off-campus housing'
  ),
  (
    'events',
    'Events',
    'What is happening on and near campus'
  ),
  (
    'help',
    'Help & QA',
    'Ask questions about WayneChat or campus resources'
  )
on conflict (slug) do nothing;
