# Letter-Tools

A letter-writing tool that uses LLM APIs to generate personal advocacy letters for Iran solidarity, using the Public Narrative framework (Self, Us, Now).

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 16 with App Router
- **UI**: shadcn/ui (Nova style, Emerald theme)
- **Styling**: Tailwind CSS v4
- **Linting**: Biome
- **Validation**: Zod + react-hook-form
- **LLM**: OpenAI GPT-5.2
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
bun install

# Copy env file and add your OpenAI API key
cp .env.example .env.local

# Start dev server (with Turbopack)
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun run lint` | Check with Biome |
| `bun run lint:fix` | Auto-fix lint/format issues |
| `bun run typecheck` | TypeScript type checking |

## Adding UI Components

```bash
bunx --bun shadcn@latest add <component-name>
```

## Deploy on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KhademOHAli1/letter-tool)

### Manual Setup

1. Push to GitHub
2. Import on [Vercel](https://vercel.com/new)
3. Add Environment Variables:
   - `OPENAI_API_KEY` - Required: Your OpenAI API key
   - `LLM_MODEL` - Optional: Model override (default: gpt-5.2)

### Region

Configured for `fra1` (Frankfurt) for lowest latency to German users.

## Security Features

- **Rate Limiting**: 10 requests/minute per IP
- **Input Sanitization**: Protection against XSS and prompt injection
- **Security Headers**: HSTS, X-Frame-Options, CSP
- **No Data Storage**: Letters are generated client-side, no user data is stored

## Cost Estimation (GPT-5.2)

| Usage | Estimated Cost |
|-------|----------------|
| 10 letters | ~$0.05 |
| 100 letters | ~$0.50 |
| 1,000 letters | ~$5.00 |

## Data Sources

- **Wahlkreise**: Bundeswahlleiter (299 districts)
- **PLZ Mapping**: OpenStreetMap + ArcGIS geodata (8,362 PLZs)
- **MdBs**: Bundestag Open Data API (477 MdBs, without AfD)
