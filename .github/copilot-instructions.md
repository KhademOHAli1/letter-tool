# Letter-Tools - AI Coding Instructions

## Project Overview
A **multi-campaign advocacy platform** that uses LLM APIs to generate personal advocacy letters using the Public Narrative framework (Self, Us, Now). Currently focused on Iran solidarity, evolving into a platform where organizers can create and run their own letter-writing campaigns. Built with Next.js 16, React 19, shadcn/ui, and optimized for Vercel deployment.

**Current Development:** `feature/campaign-platform` branch  
**Plan:** See [docs/campaign-platform-plan.md](../docs/campaign-platform-plan.md)

## Scaling Philosophy
> **"Design for scale, build for now, upgrade when needed."**

- Current scale: ~1,000 users/day (existing stack handles this fine)
- Target scale: 1M+ users (use abstraction layers now, swap implementations later)
- All infrastructure code uses interfaces so components can be swapped (e.g., `CacheProvider`, `RateLimiter`, `JobQueue`)

## Tech Stack & Tooling
- **Runtime**: Bun (use `bun` for all package/script commands, never `npm` or `yarn`)
- **Framework**: Next.js 16 with App Router, Turbopack (`bun run dev` uses `--turbopack`)
- **UI**: shadcn/ui (Nova style, Emerald theme) - add components via `bunx --bun shadcn@latest add <component>`
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Database**: Supabase (Postgres + Auth + RLS)
- **Linting/Formatting**: Biome (not ESLint) - run `bun run lint:fix` to auto-fix
- **Validation**: Zod schemas with react-hook-form integration
- **Deployment**: Vercel (use Edge-compatible APIs, no Node.js-specific modules)

## Key Directory Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/generate-letter/  # POST endpoint for LLM letter generation
│   ├── api/campaigns/      # Campaign CRUD endpoints (planned)
│   ├── c/[campaign]/       # Campaign-specific routes (planned)
│   └── admin/              # Campaign management dashboard (planned)
├── components/
│   ├── ui/                 # shadcn/ui components (don't edit directly)
│   └── admin/              # Admin dashboard components (planned)
├── lib/
│   ├── campaigns/          # Campaign queries, types, prompt builder (planned)
│   ├── infrastructure/     # Scale-ready abstractions (planned)
│   │   ├── cache/          # CacheProvider interface + implementations
│   │   ├── rate-limit/     # RateLimiter interface + implementations
│   │   ├── queue/          # JobQueue interface + implementations
│   │   └── analytics/      # AnalyticsProvider interface + implementations
│   ├── prompts/            # LLM system prompts and prompt engineering
│   ├── schemas.ts          # Zod validation schemas
│   ├── types.ts            # TypeScript interfaces
│   ├── env.ts              # Environment variable access (type-safe)
│   └── utils.ts            # shadcn utility functions
```

## Critical Patterns

### Scale-Ready Abstractions
When building infrastructure code, always use interfaces:
```typescript
// ✅ DO: Use interface + implementation pattern
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
}

// NOW: Simple in-memory implementation
export class MemoryCacheProvider implements CacheProvider { ... }

// LATER: Swap to Redis when needed (no code changes elsewhere)
// export class RedisCacheProvider implements CacheProvider { ... }
```

### Campaign Data Model
Campaigns are the core entity (see [docs/campaign-platform-plan.md](../docs/campaign-platform-plan.md)):
- `campaigns`: Main campaign entity with name, description, status, goals
- `campaign_demands`: Political demands/asks for each campaign
- `campaign_prompts`: LLM prompts per campaign/country/language
- `letter_generations`: Tracks all generated letters (existing, add campaign_id)

### LLM Prompt Structure
The letter generation uses a structured prompt in [src/lib/prompts/letter-prompt.ts](src/lib/prompts/letter-prompt.ts):
- `LETTER_SYSTEM_PROMPT`: Defines the AI role, output format, and hard rules
- User inputs are mapped to the Public Narrative framework sections (Self, Us, Now)
- **Future:** Prompts will be stored in database per campaign, fetched dynamically

### Form Validation
All user inputs use Zod schemas in [src/lib/schemas.ts](src/lib/schemas.ts):
```typescript
// Pattern: Define schema, infer type, use with react-hook-form
const schema = z.object({ ... });
type SchemaType = z.infer<typeof schema>;
```

### Environment Variables
Access env vars only through [src/lib/env.ts](src/lib/env.ts):
- `serverEnv`: Server-only secrets (API keys) - never import in client components
- `clientEnv`: Public vars (prefixed `NEXT_PUBLIC_`)
- Call `validateServerEnv()` in API routes to fail fast on missing vars

### Adding shadcn Components
```bash
bunx --bun shadcn@latest add <component-name>
```
Components go to `src/components/ui/` - customize via Tailwind classes, don't modify the generated files.

## Commands
| Command | Purpose |
|---------|---------|
| `bun run dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun run lint` | Check with Biome |
| `bun run lint:fix` | Auto-fix lint/format issues |
| `bun run typecheck` | TypeScript type checking |

## Git Workflow
- **`main`**: Production branch, always deployable
- **`feature/campaign-platform`**: Current development branch for campaign platform
- Work on feature branch, merge to main when phase is complete and tested

## Multi-Country Support
The platform supports multiple countries with country-specific:
- Representatives data (MdBs, MPs, etc.)
- Postal code → district lookups
- LLM prompts and translations
- Political demands

Countries: DE (Germany), CA (Canada), UK, FR (France), US

## Content Guidelines
Letters must follow hard rules defined in the system prompt:
- No unverified statistics - use hedging language when uncertain
- No hate speech, collective blame, or dehumanization
- Only legal, non-violent help options
- No party-political framing
- Output language matches country (German for DE, English for UK/CA/US, French for FR)
