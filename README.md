# Demo

[thestreakapp.com](https://thestreakapp.com/)

![demo_streak](https://github.com/tamasbelinszky/thestreakapp/assets/31423611/d96395fc-24da-41b1-9dc2-110de61eb117)

## Tech log and learnings

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

SST was initialized in the project root using [https://docs.sst.dev/start/nextjs](https://docs.sst.dev/start/nextjs).

Next Auth has been implemented with the Github, Google and Email Providers and the DynamoDB adapter. The session object has been extended to include `userId`.

[shadcn](https://ui.shadcn.com/) configuration and components have been added.

[ElectroDB](https://electrodb.dev/en/core-concepts/introduction/) configuration was incorporated.

A new domain was registered on [Cloudflare](https://www.cloudflare.com/) and pointed to the deployed [Cloudfront](https://aws.amazon.com/cloudfront/) distribution URL.

- Tried to set up a new hosted zone in Route 53 but it is not possible to change name servers on a newly registered domain on Cloudflare.
- When we set up a custom domain for a site with SST, we need to validate ownership via AWS Certificate Manager manually for the first time.

GitHub Actions for a basic CI/CD workflow.

- Next.js server action can not handle top level await which is used by SST's Config constructs, this is why we need to pass secrets and parameters to those functions as environment variables.

Integration with [Posthog](https://posthog.com/) and [Google Tag Manager](https://tagmanager.google.com/) was completed to analyze, test, observe, and deploy new features.

Added daily and weekly schedulers via Eventbridge Scheduler.

Added an "ai" library with OpenAI for initial chat functionality.

Added [Lumigo](https://platform.lumigo.io/project/c_8631a903f9c94/dashboard) for full observability of AWS production workloads

Opted for experimental streaming mode with SST v2.28.0 for the Next.js site, increased timeout to the max 30sec.

## Features

- Create streaks
- View streaks
- Increase streak counters
- Celebrate upon completion
- Scheduler: Evaluate and reopen streaks for the specified period
- Conversational AI trained to assist with maintaining focus, setting, and achieving goals
- Auto-complete streak: an option for users to set streaks that automatically increase per period.
- Long term memory for chat assistants via [Langchain's DynamoDBChatMessageHistory](https://python.langchain.com/docs/integrations/memory/aws_dynamodb#dynamodbchatmessagehistory)
- Email notifications upon streak events
