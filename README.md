# Demo

[thestreakapp.com](https://thestreakapp.com/)

![demo_streak](https://github.com/tamasbelinszky/thestreakapp/assets/31423611/d96395fc-24da-41b1-9dc2-110de61eb117)

## Tech log and learnings

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

SST was initialized in the project root using [https://docs.sst.dev/start/nextjs](https://docs.sst.dev/start/nextjs).

Next Auth has been implemented with the Github Provider and the DynamoDB adapter. The session object has been extended to include `userId`.

- Wasn't aware of `NEXT_AUTH_URL`.

[shadcn](https://ui.shadcn.com/) configuration and components have been added.

[ElectroDB](https://electrodb.dev/en/core-concepts/introduction/) configuration was incorporated, and the first entity was created with plans to adopt a single table design.

A new domain was registered on [Cloudflare](https://www.cloudflare.com/) and pointed to the deployed [Cloudfront](https://aws.amazon.com/cloudfront/) distribution URL.

- Tried to set up a new hosted zone in Route 53 but it is not possible to change name servers on a newly registered domain on Cloudflare.
- When we set up a custom domain for a site with SST, we need to validate ownership via AWS Certificate Manager manually for the first time.

GitHub Actions were set up for a basic CI/CD workflow.

- Next.js server action can not handle top level await which is used by SST's Config constructs, this is why we need to pass secrets and parameters to those functions as environment variables.

Integration with [Posthog](https://posthog.com/) and [Google Tag Manager](https://tagmanager.google.com/) was completed to analyze, test, observe, and deploy new features.

## Features

- Create streaks
- View streaks
- Increase streak counts
- Celebrate upon completion
- Analytics tools: GTM, Posthog

## Todos

- Scheduler: Evaluate and reopen streaks for the specified period
- Automated validations (e.g., posting once a week to LinkedIn, scraping LinkedIn or obtaining LinkedIn access token for validation)
- Authentication middleware
- Layouts for both authorized and unauthorized users, including landing pages

### Ideas

- Conversational AI trained to assist with maintaining focus, setting, and achieving goals
- Community suggestions leading to a wall of posts
- Community building through newsletters, Discord, etc.
- Calendar integration
- Notifications using React Email, AWS SES, or SendGrid
- Blog focusing on the science behind setting and achieving goals
- App integrations, e.g., [Push](https://apps.apple.com/us/app/push-workout-build-muscle/id1621689462)
