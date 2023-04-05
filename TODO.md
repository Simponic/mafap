If people end up using this, more features to add:

+ Update / delete timers, if referenced friend or created by
  - move creation modal to another form component
+ Show history of past times refreshed - more details page. Part of this is
  done already at `/api/timers/:id/refreshes`.

And bad decisions to fix:

+ friend-tabs should queried from a url path, not from this weird passed-down
  on-select bullshit, then we can use `<Link>`s
