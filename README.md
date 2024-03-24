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

## Initial demo - 2023.09.24.

[thestreakapp.com](https://thestreakapp.com/)

![demo_streak](https://github.com/tamasbelinszky/thestreakapp/assets/31423611/d96395fc-24da-41b1-9dc2-110de61eb117)

## Tech log and learnings

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

SST was initialized in the project root using [https://docs.sst.dev/start/nextjs](https://docs.sst.dev/start/nextjs).

Next Auth has been implemented with Github, Google and Email Providers and the DynamoDB adapter. The session object has been extended to include `userId`.

[shadcn](https://ui.shadcn.com/) configuration and components have been added.

[ElectroDB](https://electrodb.dev/en/core-concepts/introduction/) configuration was incorporated.

A new domain was registered on [Cloudflare](https://www.cloudflare.com/) and pointed to the deployed [Cloudfront](https://aws.amazon.com/cloudfront/) distribution URL.

- Attempted to set up a new hosted zone in Route 53, but changing name servers for a newly registered domain on Cloudflare is not possible.
- Setting up a custom domain with SST requires manual ownership validation via AWS Certificate Manager initially."

Implemented [GitHub Actions](https://github.com/features/actions) for a basic CI/CD workflow.

- The Next.js server action cannot handle top-level await, used by SST's Config constructs, requiring secrets and parameters to be passed as environment variables.

Integration with [Posthog](https://posthog.com/) and [Google Tag Manager](https://tagmanager.google.com/) was completed to analyze, test, observe, and deploy new features.

Added daily and weekly schedulers via [Eventbridge Scheduler](https://aws.amazon.com/blogs/compute/introducing-amazon-eventbridge-scheduler/).

Added the ["ai" library](https://www.npmjs.com/package/ai) with [OpenAI](https://platform.openai.com/docs/overview) for initial chat functionality.

Added [Lumigo](https://platform.lumigo.io/project/c_8631a903f9c94/dashboard) for full observability of AWS production workloads.

Chose [Sendgrid Dynamic Email Templates](https://sendgrid.com/en-us/solutions/email-api/dynamic-email-templates) to send event notifications.

Chose [Postmark](https://postmarkapp.com/) for app notifications.
