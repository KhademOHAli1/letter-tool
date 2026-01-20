# Letter-Tools - AI Coding Instructions

## Project Overview
A letter-writing tool that uses LLM APIs to generate personal advocacy letters for Iran solidarity, using the Public Narrative framework (Self, Us, Now). Built with Next.js 16, React 19, shadcn/ui, and optimized for Vercel deployment.

## Tech Stack & Tooling
- **Runtime**: Bun (use `bun` for all package/script commands, never `npm` or `yarn`)
- **Framework**: Next.js 16 with App Router, Turbopack (`bun run dev` uses `--turbopack`)
- **UI**: shadcn/ui (Nova style, Emerald theme) - add components via `bunx --bun shadcn@latest add <component>`
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Linting/Formatting**: Biome (not ESLint) - run `bun run lint:fix` to auto-fix
- **Validation**: Zod schemas with react-hook-form integration
- **Deployment**: Vercel (use Edge-compatible APIs, no Node.js-specific modules)

## Key Directory Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   └── api/generate-letter/  # POST endpoint for LLM letter generation
├── components/
│   └── ui/                 # shadcn/ui components (don't edit directly)
├── lib/
│   ├── prompts/           # LLM system prompts and prompt engineering
│   ├── schemas.ts         # Zod validation schemas
│   ├── types.ts           # TypeScript interfaces
│   ├── env.ts             # Environment variable access (type-safe)
│   └── utils.ts           # shadcn utility functions
```

## Critical Patterns

### LLM Prompt Structure
The letter generation uses a structured prompt in [src/lib/prompts/letter-prompt.ts](src/lib/prompts/letter-prompt.ts):
- `LETTER_SYSTEM_PROMPT`: Defines the AI role, output format, and hard rules
- User inputs are mapped to the Public Narrative framework sections (Self, Us, Now)
- Always enforce the 220-380 word limit and exactly 3 help actions

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

## Future: Database Layer (Planned)
Will add lookup for German parliament members (MdB) and electoral districts (Wahlkreise) by postal code (PLZ). Types are pre-defined in [src/lib/types.ts](src/lib/types.ts):
- `MdB`: Parliament member with email, party, wahlkreisId
- `Wahlkreis`: Electoral district with PLZ ranges

## Content Guidelines
Letters must follow hard rules defined in the system prompt:
- No unverified statistics - use hedging language when uncertain
- No hate speech, collective blame, or dehumanization
- Only legal, non-violent help options
- No party-political framing
- German language output (220-380 words)
