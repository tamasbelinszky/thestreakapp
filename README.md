## Tech log

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Initialized SST in project root via [https://docs.sst.dev/start/nextjs](https://docs.sst.dev/start/nextjs)

Implemented next auth with Github Provider and DynamoDB adapter. Extended session object with userId.

Added (shadcn)[https://ui.shadcn.com/] config and components.

Added (ElectroDB)[https://electrodb.dev/en/core-concepts/introduction/] config and created the fist entity. Planning to go with single table design.

## Features

- Create Streaks
- View Streaks

## Todos

- Increase streaks
- Restart streaks
- Blog
- Notifications
- Automated validations (ex: posting once a week to linkedin, scrape linkedin and validate)

notes: AWS scheduler, email channel

### Ideas

- chat ai, trained to help with staying on track / achieveing and setting goals. Community could suggest content and reason about it.
- community suggestions -> wall -> posts
- calendar integration (I don't like it :D )
- add react query / trpc?
- add posthog (product analytics)
