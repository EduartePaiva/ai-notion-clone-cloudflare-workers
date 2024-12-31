# AI Notion Clone Cloudflare Worker

This is a worked initialized using wrangler, it's a core backend for the Notion Clone project

## Table of Contents

- [How It Works](#how-it-works)
- [Installation](#installation)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Repositories](#project-repositories)
- [License](#license)

## How It Works

This worker listen to a request from a user for the resource of translation or chat to document. Whenever a request is received it first authenticate the Bearer token, then after that it process the requests and return the response.

## Installation

After setting the env variables on an file called .dev.vars you can do

```console
pnpm install
pnpm dev
```

Check Cloudflare documentation know more about how to deploy and use workers.

## Tech Stack

- Hono
- Cloudflare workers
- Open AI
- JWI token validation

## Environment Variables

- OPEN_AI_KEY: check the open api website to get your key
- CORS_ORIGIN: the link where the notion clone is hosted. for dev it would be something like http://localhost:3000
- CLERK_JWT_KEY: The public Key of clerk used for authentication.

## Project repositories

- Cloudflare Worker current repository
- Client/Next.js server: https://github.com/EduartePaiva/ai-notion-clone

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
