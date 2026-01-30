# Campaign Platform Transformation Plan

> **Project Goal:** Transform letter-tools from a single-cause advocacy tool into a multi-campaign platform where organizers can create, manage, and run letter-writing campaigns for various causes.

**Last Updated:** January 30, 2026  
**Estimated Total Effort:** 10-14 weeks  
**Current Scale:** ~1,000 users/day  
**Target Scale:** 1M+ users (build for scale later, design for it now)

---

## Scaling Philosophy

> **"Design for scale, build for now, upgrade when needed."**

### Current Stack (Sufficient for 1K-10K users/day)
| Layer | Technology | Status |
|-------|------------|--------|
| Runtime | Bun | ✅ Keep |
| Framework | Next.js 16 (App Router) | ✅ Keep |
| UI | shadcn/ui + Tailwind v4 | ✅ Keep |
| Database | Supabase (Postgres) | ✅ Keep |
| Auth | Supabase Auth | ➕ Add |
| Caching | Next.js `unstable_cache` | ✅ Built-in |
| Rate Limiting | In-memory (existing) | ✅ Keep |
| LLM | OpenAI API (sync) | ✅ Keep |
| Deployment | Vercel | ✅ Keep |

### Scale-Ready Design Patterns
All code should use **abstraction layers** so components can be swapped later:

```typescript
// ✅ DO: Abstract interface (easy to swap implementation)
// src/lib/cache/index.ts
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// src/lib/cache/memory.ts (NOW)
export class MemoryCache implements CacheProvider { ... }

// src/lib/cache/redis.ts (LATER)
export class RedisCache implements CacheProvider { ... }
```

### Scaling Triggers & Upgrades

| Trigger | Symptom | Upgrade Path |
|---------|---------|--------------|
| **5K users/day** | Rate limit inaccuracy across regions | Swap `MemoryCache` → `RedisCache` (Upstash) |
| **20K users/day** | Stats queries > 2s | Add materialized views, read replica |
| **50K users/day** | DB connection errors | Supabase Pro + PgBouncer pooling |
| **100K users/day** | LLM timeouts, user wait time | Swap sync → async queue (QStash) |
| **500K users/day** | Analytics dashboard slow | Add Tinybird for OLAP |
| **1M+ users/day** | Everything under pressure | Full scale architecture |

---

## Table of Contents

1. [Phase 1: Backend Foundation](#phase-1-backend-foundation)
2. [Phase 2: Backend Campaign System](#phase-2-backend-campaign-system)
3. [Phase 3: Frontend Campaign Infrastructure](#phase-3-frontend-campaign-infrastructure)
4. [Phase 4: Backend Authentication & Authorization](#phase-4-backend-authentication--authorization)
5. [Phase 5: Frontend Admin Interface](#phase-5-frontend-admin-interface)
6. [Phase 6: Frontend Public Campaign Experience](#phase-6-frontend-public-campaign-experience)
7. [Phase 7: Backend Analytics & Tracking](#phase-7-backend-analytics--tracking)
8. [Phase 8: Frontend Analytics Dashboard](#phase-8-frontend-analytics-dashboard)
9. [Phase 9: Sharing & Distribution](#phase-9-sharing--distribution)
10. [Phase 10: Migration & Launch](#phase-10-migration--launch)

---

## Phase 1: Backend Foundation

**Duration:** 1-2 weeks  
**Goal:** Establish the database schema and core types for multi-campaign support.

> **🔧 Scale-Ready Design:**
> - Use proper indexes from day 1 (cheap now, expensive to add later)
> - Design tables with partitioning in mind (add `created_at` to all tables)
> - Use UUIDs for all primary keys (distributed-friendly)
> - Keep RLS policies simple (complex policies = slow queries at scale)

### Epic 1.1: Database Schema Design ✅

#### Task 1.1.1: Create campaigns table migration ✅
- [x] **Subtask:** Design campaigns table schema with all required fields
- [x] **Subtask:** Add JSONB fields for multi-language name/description
- [x] **Subtask:** Create enum type for campaign status (draft, active, paused, completed)
- [x] **Subtask:** Add indexes for slug, status, and country_code
- [x] **Subtask:** Write migration file `005_campaigns.sql`
- [x] **Subtask:** Add RLS policies for public read, authenticated write

#### Task 1.1.2: Create campaign_demands table migration ✅
- [x] **Subtask:** Design campaign_demands table with FK to campaigns
- [x] **Subtask:** Add JSONB fields for title, description, brief_text (multi-lang)
- [x] **Subtask:** Add sort_order, completed, completed_date fields
- [x] **Subtask:** Create indexes for campaign_id and sort_order
- [x] **Subtask:** Write migration file `006_campaign_demands.sql`
- [x] **Subtask:** Add RLS policies matching parent campaign access

#### Task 1.1.3: Create campaign_prompts table migration ✅
- [x] **Subtask:** Design campaign_prompts table with FK to campaigns
- [x] **Subtask:** Add country_code, language, system_prompt fields
- [x] **Subtask:** Add version and is_active fields for prompt versioning
- [x] **Subtask:** Create unique constraint on (campaign_id, country_code, language, is_active)
- [x] **Subtask:** Write migration file `007_campaign_prompts.sql`
- [x] **Subtask:** Add RLS policies for organizer access

#### Task 1.1.4: Update letter_generations table ✅
- [x] **Subtask:** Add campaign_id FK column (nullable for backward compat)
- [x] **Subtask:** Add index on campaign_id
- [x] **Subtask:** Write migration file `008_add_campaign_to_letters.sql`
- [x] **Subtask:** Update RLS policies to scope by campaign

### Epic 1.2: TypeScript Type Definitions ✅

#### Task 1.2.1: Define Campaign types ✅
- [x] **Subtask:** Create `Campaign` interface in `src/lib/types.ts`
- [x] **Subtask:** Create `CampaignStatus` type union
- [x] **Subtask:** Create `CampaignDemand` interface
- [x] **Subtask:** Create `CampaignPrompt` interface
- [x] **Subtask:** Create `CampaignWithDemands` composite type
- [x] **Subtask:** Export all types from types.ts

#### Task 1.2.2: Generate Supabase types
- [ ] **Subtask:** Run `bunx supabase gen types typescript` after migrations (do after applying to Supabase)
- [ ] **Subtask:** Update `src/lib/database.types.ts` with generated types
- [ ] **Subtask:** Verify type compatibility with custom interfaces

#### Task 1.2.3: Create Zod schemas for campaigns ✅
- [x] **Subtask:** Add `campaignSchema` to `src/lib/schemas.ts`
- [x] **Subtask:** Add `campaignDemandSchema` for demand validation
- [x] **Subtask:** Add `campaignPromptSchema` for prompt validation
- [x] **Subtask:** Create `createCampaignSchema` for form validation
- [x] **Subtask:** Create `updateCampaignSchema` for partial updates

---

## Phase 2: Backend Campaign System

**Duration:** 1-2 weeks  
**Goal:** Build the core campaign CRUD operations and dynamic prompt system.

> **🔧 Scale-Ready Design:**
> - Create data access layer with repository pattern (easy to add caching later)
> - Use `unstable_cache` wrapper for all read queries (swap to Redis later)
> - Keep mutations separate from queries (CQRS-lite pattern)
> - Return minimal data from APIs (less bytes = faster at scale)

### Epic 2.1: Campaign Data Access Layer ✅

#### Task 2.1.1: Create campaign queries module ✅
- [x] **Subtask:** Create `src/lib/campaigns/queries.ts`
- [x] **Subtask:** Implement `getCampaignBySlug(slug: string)`
- [x] **Subtask:** Implement `getCampaignById(id: string)`
- [x] **Subtask:** Implement `listActiveCampaigns(countryCode?: string)`
- [x] **Subtask:** Implement `listCampaignsByOrganizer(userId: string)`
- [x] **Subtask:** Add caching layer with `unstable_cache` for public queries

#### Task 2.1.2: Create campaign mutation functions ✅
- [x] **Subtask:** Implement `createCampaign(data: CreateCampaignInput)`
- [x] **Subtask:** Implement `updateCampaign(id: string, data: UpdateCampaignInput)`
- [x] **Subtask:** Implement `deleteCampaign(id: string)` (soft delete)
- [x] **Subtask:** Implement `updateCampaignStatus(id: string, status: CampaignStatus)`
- [x] **Subtask:** Add transaction support for atomic operations

#### Task 2.1.3: Create demand CRUD functions ✅
- [x] **Subtask:** Implement `getCampaignDemands(campaignId: string)`
- [x] **Subtask:** Implement `createDemand(campaignId: string, data: DemandInput)`
- [x] **Subtask:** Implement `updateDemand(id: string, data: DemandInput)`
- [x] **Subtask:** Implement `deleteDemand(id: string)`
- [x] **Subtask:** Implement `reorderDemands(campaignId: string, orderedIds: string[])`
- [x] **Subtask:** Implement `markDemandCompleted(id: string, completed: boolean)`

#### Task 2.1.4: Create prompt management functions ✅
- [x] **Subtask:** Implement `getCampaignPrompt(campaignId, country, language)`
- [x] **Subtask:** Implement `createPrompt(campaignId: string, data: PromptInput)`
- [x] **Subtask:** Implement `updatePrompt(id: string, content: string)`
- [x] **Subtask:** Implement `activatePromptVersion(id: string)`
- [x] **Subtask:** Implement `listPromptVersions(campaignId, country, language)`

### Epic 2.2: Dynamic Prompt System ✅

#### Task 2.2.1: Create prompt builder module ✅
- [x] **Subtask:** Create `src/lib/campaigns/prompt-builder.ts`
- [x] **Subtask:** Define template variable types: `{{cause_context}}`, `{{demands}}`, etc.
- [x] **Subtask:** Implement `buildPrompt(template: string, variables: PromptVariables)`
- [x] **Subtask:** Implement demand formatting for prompt injection
- [x] **Subtask:** Add validation for required template variables
- [x] **Subtask:** Create default prompt templates per country

#### Task 2.2.2: Create prompt template library
- [x] **Subtask:** Extract current prompts into reusable templates
- [x] **Subtask:** Create base template with common structure
- [ ] **Subtask:** Create country-specific template overrides (deferred - use legacy prompts for now)
- [x] **Subtask:** Document template variable reference
- [x] **Subtask:** Create template validation utility

### Epic 2.3: Campaign API Routes ✅

#### Task 2.3.1: Create GET /api/campaigns endpoint ✅
- [x] **Subtask:** Create `src/app/api/campaigns/route.ts`
- [x] **Subtask:** Implement listing with status and country filters
- [ ] **Subtask:** Add pagination support (limit, offset) - deferred
- [x] **Subtask:** Return campaign with demand count
- [x] **Subtask:** Add caching headers for CDN

#### Task 2.3.2: Create GET /api/campaigns/[slug] endpoint ✅
- [x] **Subtask:** Create `src/app/api/campaigns/[slug]/route.ts`
- [x] **Subtask:** Return full campaign with demands
- [x] **Subtask:** Handle 404 for non-existent campaigns
- [x] **Subtask:** Add cache revalidation on update

#### Task 2.3.3: Create POST /api/campaigns endpoint (admin) ✅
- [ ] **Subtask:** Add authentication check (deferred to Phase 4)
- [x] **Subtask:** Validate request body with Zod
- [x] **Subtask:** Generate slug from name if not provided
- [x] **Subtask:** Create campaign with initial demands
- [x] **Subtask:** Return created campaign with 201 status

#### Task 2.3.4: Create PUT /api/campaigns/[slug] endpoint (admin) ✅
- [ ] **Subtask:** Add authentication and ownership check (deferred to Phase 4)
- [x] **Subtask:** Validate partial update body
- [x] **Subtask:** Handle demand updates in transaction
- [x] **Subtask:** Revalidate cache on update

#### Task 2.3.5: Update /api/generate-letter for campaigns ✅
- [x] **Subtask:** Add optional `campaignId` to request schema
- [x] **Subtask:** Fetch campaign prompt dynamically when campaignId provided
- [x] **Subtask:** Fall back to legacy prompts when no campaignId
- [x] **Subtask:** Include campaignId in letter_generations tracking
- [ ] **Subtask:** Validate selected demands belong to campaign (deferred)

---

## Phase 3: Frontend Campaign Infrastructure ✅

**Duration:** 1 week  
**Goal:** Set up routing and shared components for campaign-based navigation.

> **🔧 Scale-Ready Design:**
> - Use React Server Components for data fetching (reduces client bundle)
> - Implement campaign context with lazy loading (only load what's needed)
> - Design components to accept data as props OR from context (testable, cacheable)
> - Use dynamic imports for heavy components (charts, editors)

### Epic 3.1: URL Structure Implementation ✅

#### Task 3.1.1: Create campaign route group ✅
- [x] **Subtask:** Create `src/app/c/[campaign]/` directory structure
- [x] **Subtask:** Create campaign layout with shared context
- [x] **Subtask:** Implement campaign data fetching in layout
- [x] **Subtask:** Create loading.tsx skeleton for campaign pages
- [x] **Subtask:** Create error.tsx for campaign not found

#### Task 3.1.2: Create campaign country routes ✅
- [x] **Subtask:** Create `src/app/c/[campaign]/[country]/page.tsx`
- [x] **Subtask:** Create `src/app/c/[campaign]/[country]/layout.tsx`
- [x] **Subtask:** Create `src/app/c/[campaign]/[country]/editor/page.tsx`
- [ ] **Subtask:** Create `src/app/c/[campaign]/[country]/preview/page.tsx` (deferred - uses legacy route)
- [ ] **Subtask:** Create `src/app/c/[campaign]/[country]/success/page.tsx` (deferred - uses legacy route)
- [ ] **Subtask:** Create `src/app/c/[campaign]/[country]/share/page.tsx` (deferred - uses legacy route)

#### Task 3.1.3: Implement backward compatibility ✅
- [x] **Subtask:** Keep existing `/[country]/` routes functional
- [ ] **Subtask:** Create redirect from `/[country]/` to `/c/iran-2026/[country]/` (optional - deferred)
- [ ] **Subtask:** Add `legacyCampaignSlug` config for default campaign (deferred)
- [x] **Subtask:** Test all existing routes still work

### Epic 3.2: Campaign Context Provider ✅

#### Task 3.2.1: Create CampaignContext ✅
- [x] **Subtask:** Create `src/lib/campaigns/context.tsx`
- [x] **Subtask:** Define CampaignContext with campaign, demands, loading state
- [x] **Subtask:** Create `useCampaign()` hook for consuming context
- [x] **Subtask:** Create `CampaignProvider` component
- [x] **Subtask:** Add type safety for campaign data

#### Task 3.2.2: Integrate context with layouts ✅
- [x] **Subtask:** Wrap campaign routes with CampaignProvider
- [x] **Subtask:** Prefetch campaign data in RSC layout
- [x] **Subtask:** Pass initial data to client provider
- [x] **Subtask:** Handle hydration correctly

### Epic 3.3: Campaign-Aware Components ✅

#### Task 3.3.1: Update LetterForm for campaigns ✅
- [x] **Subtask:** Accept campaign data as prop or from context
- [x] **Subtask:** Render demands dynamically from campaign
- [x] **Subtask:** Update form submission to include campaignId
- [x] **Subtask:** Keep backward compat with legacy FORDERUNGEN

#### Task 3.3.2: Update ImpactStats for campaigns ✅
- [x] **Subtask:** Accept optional campaignId prop
- [x] **Subtask:** Fetch stats scoped to campaign when provided
- [x] **Subtask:** Update labels dynamically from campaign
- [x] **Subtask:** Show campaign-specific goal progress

#### Task 3.3.3: Create CampaignHeader component ✅
- [x] **Subtask:** Create `src/components/campaign-header.tsx`
- [x] **Subtask:** Display campaign name, description
- [x] **Subtask:** Show campaign status badge
- [x] **Subtask:** Show goal progress bar
- [ ] **Subtask:** Add campaign branding/color support (deferred)

---

## Phase 4: Backend Authentication & Authorization ✅

**Duration:** 1-2 weeks  
**Goal:** Implement user authentication and role-based access control.

> **🔧 Scale-Ready Design:**
> - Use Supabase Auth (handles session scaling automatically)
> - Rely on RLS for authorization (pushes work to Postgres, scales with DB)
> - Cache user roles in JWT claims (avoid DB lookup on every request)
> - Design permission checks as pure functions (easy to test, easy to cache)

> **📝 Note:** Only campaign creators need accounts. Regular letter writers remain anonymous.

### Epic 4.1: User Authentication Setup ✅

#### Task 4.1.1: Configure Supabase Auth
- [ ] **Subtask:** Enable email/password auth in Supabase dashboard (manual step)
- [ ] **Subtask:** Configure Google OAuth provider (manual step)
- [ ] **Subtask:** Set up email templates for verification (manual step)
- [ ] **Subtask:** Configure redirect URLs for production (manual step)

#### Task 4.1.2: Create users table extension ✅
- [x] **Subtask:** Create migration `009_user_profiles.sql`
- [x] **Subtask:** Add user_profiles table with role, display_name, avatar
- [x] **Subtask:** Create trigger to create profile on auth.users insert
- [x] **Subtask:** Define role enum: user, organizer, admin (removed anonymous - not needed)
- [x] **Subtask:** Add RLS policies for profile access

#### Task 4.1.3: Create auth utility functions ✅
- [x] **Subtask:** Create `src/lib/auth/server.ts` for server-side auth
- [x] **Subtask:** Implement `getSession()` for route handlers
- [x] **Subtask:** Implement `getUser()` with profile data
- [x] **Subtask:** Implement `requireAuth()` middleware helper
- [x] **Subtask:** Implement `requireRole(role: UserRole)` helper

#### Task 4.1.4: Create client-side auth utilities ✅
- [x] **Subtask:** Create `src/lib/auth/client.ts`
- [x] **Subtask:** Create Supabase browser client singleton
- [x] **Subtask:** Implement `signIn(email, password)`
- [x] **Subtask:** Implement `signUp(email, password, name)`
- [x] **Subtask:** Implement `signOut()`
- [x] **Subtask:** Implement `signInWithGoogle()`

### Epic 4.2: Authorization System ✅

#### Task 4.2.1: Define permission system ✅
- [x] **Subtask:** Create `src/lib/auth/permissions.ts`
- [x] **Subtask:** Define permission types: create_campaign, edit_campaign, delete_campaign, etc.
- [x] **Subtask:** Map roles to permissions
- [x] **Subtask:** Implement `hasPermission(user, permission)`
- [x] **Subtask:** Implement `canAccessCampaign(user, campaignId)`

#### Task 4.2.2: Create campaign ownership tracking ✅
- [x] **Subtask:** Add `created_by` FK to campaigns table (migration 010)
- [ ] **Subtask:** Add `campaign_collaborators` table for shared access (deferred - not needed initially)
- [ ] **Subtask:** Define collaborator roles: owner, editor, viewer (deferred)
- [x] **Subtask:** Implement `isOwnerOfCampaign(userId, campaignId)` in server.ts

#### Task 4.2.3: Update RLS policies ✅
- [x] **Subtask:** Update campaigns RLS for owner/collaborator access
- [x] **Subtask:** Update campaign_demands RLS
- [x] **Subtask:** Update campaign_prompts RLS
- [ ] **Subtask:** Test policies with different user roles (requires deployed migrations)

### Epic 4.3: Auth API Routes ✅

#### Task 4.3.1: Create auth callback route ✅
- [x] **Subtask:** Create `src/app/auth/callback/route.ts`
- [x] **Subtask:** Handle OAuth callback from Supabase
- [x] **Subtask:** Create/update user profile on sign in (via trigger)
- [x] **Subtask:** Redirect to appropriate page after auth

#### Task 4.3.2: Create session management ✅
- [x] **Subtask:** Create `src/middleware.ts` for session refresh
- [x] **Subtask:** Handle session refresh via middleware
- [ ] **Subtask:** Create `src/app/api/auth/session/route.ts` (deferred - using getSession directly)

---

## Phase 5: Frontend Admin Interface ✅

**Duration:** 2-3 weeks  
**Goal:** Build the campaign management dashboard for organizers.

> **🔧 Scale-Ready Design:**
> - Admin is low-traffic, optimize for DX not performance
> - Use optimistic updates for snappy UX (SWR mutate)
> - Paginate all lists from day 1 (never load "all" of anything)
> - Build reusable form components (reduces bundle, improves consistency)

### Epic 5.1: Auth UI Components ✅

#### Task 5.1.1: Create SignIn component ✅
- [x] **Subtask:** Create `src/components/auth/sign-in.tsx`
- [x] **Subtask:** Build form with email/password fields
- [x] **Subtask:** Add "Sign in with Google" button
- [x] **Subtask:** Handle loading and error states
- [x] **Subtask:** Add "Forgot password" link
- [x] **Subtask:** Style with shadcn/ui components

#### Task 5.1.2: Create SignUp component ✅
- [x] **Subtask:** Create `src/components/auth/sign-up.tsx`
- [x] **Subtask:** Build form with name, email, password, confirm password
- [x] **Subtask:** Add email verification flow
- [x] **Subtask:** Validate password strength
- [x] **Subtask:** Handle duplicate email error

#### Task 5.1.3: Create AuthProvider component ✅
- [x] **Subtask:** Create `src/components/auth/auth-provider.tsx`
- [x] **Subtask:** Create AuthContext with user, loading, signIn, signOut
- [x] **Subtask:** Listen to Supabase auth state changes
- [x] **Subtask:** Create `useAuth()` hook

#### Task 5.1.4: Create protected route wrapper ✅
- [x] **Subtask:** Create `src/components/auth/protected-route.tsx`
- [x] **Subtask:** Check auth state and redirect if needed
- [x] **Subtask:** Show loading skeleton while checking
- [x] **Subtask:** Support role-based protection

### Epic 5.2: Admin Layout and Navigation ✅

#### Task 5.2.1: Create admin layout ✅
- [x] **Subtask:** Create `src/app/admin/layout.tsx`
- [x] **Subtask:** Add authentication check
- [x] **Subtask:** Create sidebar navigation
- [x] **Subtask:** Add user menu with sign out
- [x] **Subtask:** Style for desktop and mobile

#### Task 5.2.2: Create admin dashboard page ✅
- [x] **Subtask:** Create `src/app/admin/page.tsx`
- [x] **Subtask:** Show summary of user's campaigns
- [x] **Subtask:** Show recent activity
- [x] **Subtask:** Quick actions: create campaign, view stats
- [x] **Subtask:** Add onboarding for new users

#### Task 5.2.3: Create admin navigation components ✅
- [x] **Subtask:** Create `src/components/admin/sidebar.tsx`
- [x] **Subtask:** Create `src/components/admin/header.tsx`
- [ ] **Subtask:** Create `src/components/admin/user-menu.tsx` (integrated into sidebar)
- [x] **Subtask:** Add active state for current route

### Epic 5.3: Campaign List and Management ✅

#### Task 5.3.1: Create campaigns list page ✅
- [x] **Subtask:** Create `src/app/admin/campaigns/page.tsx`
- [x] **Subtask:** Fetch user's campaigns
- [x] **Subtask:** Display in table or card grid
- [x] **Subtask:** Show status, country, letter count, dates
- [x] **Subtask:** Add filter by status
- [x] **Subtask:** Add search by name
- [x] **Subtask:** Add "Create Campaign" CTA button

#### Task 5.3.2: Create CampaignCard component ✅
- [x] **Subtask:** Create `src/components/admin/campaign-card.tsx`
- [x] **Subtask:** Display campaign info with status badge
- [x] **Subtask:** Show progress toward goal
- [x] **Subtask:** Add quick action buttons: edit, view, pause
- [x] **Subtask:** Add dropdown menu for more actions

#### Task 5.3.3: Create campaign actions ✅
- [ ] **Subtask:** Implement duplicate campaign (deferred)
- [x] **Subtask:** Implement archive/delete campaign
- [x] **Subtask:** Implement pause/resume campaign
- [x] **Subtask:** Add confirmation dialogs for destructive actions

### Epic 5.4: Campaign Creation Wizard ✅

#### Task 5.4.1: Create wizard framework ✅
- [x] **Subtask:** Create `src/app/admin/campaigns/new/page.tsx`
- [x] **Subtask:** Create multi-step wizard container
- [x] **Subtask:** Implement step navigation with validation
- [x] **Subtask:** Persist wizard state in localStorage
- [x] **Subtask:** Add exit confirmation for unsaved changes

#### Task 5.4.2: Create Step 1: Basic Info ✅
- [x] **Subtask:** Create campaign name input (multi-lang)
- [x] **Subtask:** Create description textarea (multi-lang)
- [x] **Subtask:** Create country selector
- [x] **Subtask:** Auto-generate slug from name
- [x] **Subtask:** Allow custom slug override

#### Task 5.4.3: Create Step 2: Campaign Details ✅
- [x] **Subtask:** Create cause context textarea (for LLM)
- [x] **Subtask:** Create date range picker (start/end)
- [x] **Subtask:** Create goal input (target letters)
- [x] **Subtask:** Add help text explaining each field

#### Task 5.4.4: Create Step 3: Demands ✅
- [x] **Subtask:** Create demand list with add/remove
- [x] **Subtask:** Create demand form (title, description, brief_text)
- [ ] **Subtask:** Implement drag-and-drop reordering (deferred - uses manual reorder)
- [ ] **Subtask:** Add "Import from template" option (deferred)
- [x] **Subtask:** Require minimum 1 demand

#### Task 5.4.5: Create Step 4: Prompt Configuration ✅
- [x] **Subtask:** Show prompt template editor
- [x] **Subtask:** Highlight template variables
- [x] **Subtask:** Add "Use default template" button
- [ ] **Subtask:** Create test generation preview (deferred)
- [x] **Subtask:** Validate prompt has required sections

#### Task 5.4.6: Create Step 5: Review and Create ✅
- [x] **Subtask:** Show summary of all inputs
- [x] **Subtask:** Allow editing each section
- [x] **Subtask:** Create campaign on submit
- [x] **Subtask:** Redirect to campaign edit page on success
- [x] **Subtask:** Handle creation errors

### Epic 5.5: Campaign Edit Page ✅

#### Task 5.5.1: Create campaign edit layout ✅
- [x] **Subtask:** Create `src/app/admin/campaigns/[slug]/page.tsx`
- [x] **Subtask:** Fetch campaign with demands and prompts
- [x] **Subtask:** Create tabbed interface: Overview, Demands, Prompts, Settings
- [x] **Subtask:** Add save/publish button bar
- [ ] **Subtask:** Show unsaved changes indicator (deferred)

#### Task 5.5.2: Create Overview tab ✅
- [x] **Subtask:** Editable campaign name and description
- [x] **Subtask:** Status toggle with confirmation
- [x] **Subtask:** Quick stats summary
- [x] **Subtask:** Preview link to public campaign page

#### Task 5.5.3: Create Demands tab ✅
- [x] **Subtask:** Create `src/components/admin/edit/demands-tab.tsx`
- [x] **Subtask:** List demands with inline edit
- [ ] **Subtask:** Drag-and-drop reorder (deferred - uses manual reorder)
- [x] **Subtask:** Mark demands as completed with date
- [x] **Subtask:** Add new demand inline
- [x] **Subtask:** Delete demand with confirmation

#### Task 5.5.4: Create Prompts tab ✅
- [x] **Subtask:** Create `src/components/admin/edit/prompts-tab.tsx`
- [x] **Subtask:** Show prompts by country/language
- [x] **Subtask:** Full-featured prompt editor
- [ ] **Subtask:** Template variable autocomplete (deferred)
- [ ] **Subtask:** Version history sidebar (deferred)
- [ ] **Subtask:** Test generation with sample inputs (deferred)

#### Task 5.5.5: Create Settings tab ✅
- [x] **Subtask:** Goal and date settings
- [x] **Subtask:** Slug editor (with uniqueness check)
- [ ] **Subtask:** Collaborator management (deferred)
- [x] **Subtask:** Danger zone: archive/delete campaign

---

## Phase 6: Frontend Public Campaign Experience ✅

**Duration:** 1-2 weeks  
**Goal:** Build the user-facing campaign pages and discovery.

> **🔧 Scale-Ready Design:**
> - Use ISR (Incremental Static Regeneration) for campaign pages
> - Cache campaign data aggressively (revalidate on publish)
> - Lazy load below-fold content (stats, related campaigns)
> - Pre-generate OG images at build/publish time

### Epic 6.1: Campaign Directory ✅

#### Task 6.1.1: Create campaigns landing page ✅
- [x] **Subtask:** Create `src/app/campaigns/page.tsx`
- [x] **Subtask:** Fetch active campaigns with pagination (client-side filtering for now)
- [x] **Subtask:** Create campaign card grid
- [x] **Subtask:** Add country filter
- [x] **Subtask:** Add search functionality
- [x] **Subtask:** SEO metadata

#### Task 6.1.2: Create CampaignPublicCard component ✅
- [x] **Subtask:** Create `src/components/campaign-public-card.tsx`
- [x] **Subtask:** Show campaign image/branding (uses country flags)
- [x] **Subtask:** Show name, description excerpt
- [x] **Subtask:** Show progress bar (letters / goal)
- [x] **Subtask:** Show country flag
- [x] **Subtask:** Link to campaign page

### Epic 6.2: Campaign Landing Page ✅

#### Task 6.2.1: Create campaign landing page ✅
- [x] **Subtask:** Create `src/app/c/[campaign]/page.tsx`
- [x] **Subtask:** Hero section with campaign info
- [x] **Subtask:** Impact stats section
- [x] **Subtask:** List of demands with status
- [x] **Subtask:** Call-to-action to write letter
- [x] **Subtask:** Country selector for multi-country campaigns

#### Task 6.2.2: Create campaign OG image ✅
- [x] **Subtask:** Update `src/app/api/og/route.tsx`
- [x] **Subtask:** Accept campaign slug parameter
- [x] **Subtask:** Generate dynamic OG image with campaign info
- [x] **Subtask:** Cache generated images (Edge runtime with headers)

#### Task 6.2.3: Create campaign metadata ✅
- [x] **Subtask:** Generate dynamic title and description
- [x] **Subtask:** Add OpenGraph and Twitter meta tags
- [x] **Subtask:** Add JSON-LD structured data
- [x] **Subtask:** Generate sitemap entries for campaigns

### Epic 6.3: Campaign Letter Form ✅

#### Task 6.3.1: Adapt LetterForm for campaign context ✅
- [x] **Subtask:** Update form to use campaign demands (Phase 3)
- [x] **Subtask:** Use campaign-specific prompt via API (Phase 2)
- [x] **Subtask:** Update success page for campaign (uses legacy routes)
- [x] **Subtask:** Track letter with campaign_id (Phase 2)

#### Task 6.3.2: Create campaign-specific translations ✅
- [x] **Subtask:** Add campaign name/description to page (uses getLocalizedText)
- [x] **Subtask:** Use campaign-specific help text if provided
- [x] **Subtask:** Fall back to generic translations

---

## Phase 7: Backend Analytics & Tracking ✅

**Duration:** 1 week  
**Goal:** Enhance tracking and build analytics aggregation endpoints.

> **🔧 Scale-Ready Design:**
> - Use `AnalyticsProvider` interface (swap Postgres → Tinybird later)
> - Create materialized views for common aggregations (refresh every 5 min)
> - Never query raw `letter_generations` for dashboards (use views)
> - Design stats API to return pre-computed data (no real-time aggregation)

### Epic 7.1: Enhanced Letter Tracking ✅

#### Task 7.1.1: Update letter tracking for campaigns ✅
- [x] **Subtask:** Ensure campaign_id is tracked on all new letters (already in Phase 2)
- [x] **Subtask:** Add migration to backfill existing letters to "iran-2026" (012_backfill_campaign_letters.sql)
- [x] **Subtask:** Update tracking to include more metadata (via views)
- [ ] **Subtask:** Add daily aggregation job (optional - deferred, views handle this)

#### Task 7.1.2: Create analytics aggregation views ✅
- [x] **Subtask:** Create SQL view for letters by campaign by day (campaign_letters_by_day)
- [x] **Subtask:** Create SQL view for top demands by campaign (campaign_demand_stats)
- [x] **Subtask:** Create SQL view for geographic distribution (campaign_geographic_stats)
- [x] **Subtask:** Create SQL view for goal progress (campaign_goal_progress)

### Epic 7.2: Analytics API Endpoints ✅

#### Task 7.2.1: Create campaign stats endpoint ✅
- [x] **Subtask:** Create `src/app/api/campaigns/[slug]/stats/route.ts`
- [x] **Subtask:** Return total letters, unique reps, top demands
- [x] **Subtask:** Return goal progress percentage
- [x] **Subtask:** Return time series data for charts
- [x] **Subtask:** Add caching with revalidation

#### Task 7.2.2: Create global stats endpoint ✅
- [x] **Subtask:** Update `src/app/api/stats/route.ts`
- [x] **Subtask:** Support optional campaign filter
- [x] **Subtask:** Add platform-wide totals (platform_stats view)
- [x] **Subtask:** Return breakdown by campaign (campaign_summary view)

### Epic 7.3: Scale-Ready Analytics Infrastructure ✅

#### Task 7.3.1: Create AnalyticsProvider interface ✅
- [x] **Subtask:** Create `src/lib/infrastructure/analytics/types.ts` with interface
- [x] **Subtask:** Create `src/lib/infrastructure/analytics/postgres.ts` implementation
- [x] **Subtask:** Create `src/lib/infrastructure/analytics/index.ts` central export
- [x] **Subtask:** Create `src/lib/infrastructure/index.ts` for all infrastructure

---

## Phase 8: Frontend Analytics Dashboard 🔄

**Duration:** 1 week  
**Goal:** Build visualization for campaign analytics.

> **🔧 Scale-Ready Design:**
> - Load charts lazily (`dynamic(() => import('recharts'), { ssr: false })`)
> - Fetch time-series data in chunks (not entire history at once)
> - Use SWR with long stale time for stats (data doesn't need to be real-time)
> - Consider WebSocket for live activity feed only (not for stats)

### Epic 8.0: Geographic Heat Map Infrastructure ✅

> **📍 Added Feature:** Geographic breakdown by postal code/district/region/country

#### Task 8.0.1: Create postal code tracking ✅
- [x] **Subtask:** Create `013_geographic_heatmap.sql` migration
- [x] **Subtask:** Add `postal_code` column to `letter_generations`
- [x] **Subtask:** Update tracking in `/api/generate-letter` to store postal code
- [x] **Subtask:** Create heat map views at 4 levels (country, region, district, postal)

#### Task 8.0.2: Create heat map API endpoint ✅
- [x] **Subtask:** Create `src/app/api/campaigns/[slug]/heatmap/route.ts`
- [x] **Subtask:** Support level parameter (country, region, district, postal)
- [x] **Subtask:** Support country filter
- [x] **Subtask:** Add caching headers

### Epic 8.1: Public Campaign Stats Page ✅

#### Task 8.1.1: Create campaign stats page ✅
- [x] **Subtask:** Create `src/app/c/[campaign]/stats/page.tsx`
- [x] **Subtask:** Create `src/app/c/[campaign]/stats/campaign-stats-client.tsx`
- [x] **Subtask:** Show headline metrics
- [x] **Subtask:** Add goal progress visualization
- [x] **Subtask:** Show top representatives contacted
- [x] **Subtask:** Show demand popularity chart
- [x] **Subtask:** Add geographic heat map with drill-down

#### Task 8.1.2: Create chart components ✅
- [x] **Subtask:** Install charting library (recharts)
- [x] **Subtask:** Create `src/components/charts/line-chart.tsx`
- [x] **Subtask:** Create `src/components/charts/bar-chart.tsx`
- [x] **Subtask:** Create `src/components/charts/progress-ring.tsx`
- [x] **Subtask:** Create `src/components/charts/geographic-heatmap.tsx`
- [x] **Subtask:** Create `src/components/charts/index.ts` for exports
- [x] **Subtask:** Style charts with Tailwind theme colors

### Epic 8.2: Admin Analytics Dashboard

#### Task 8.2.1: Create admin analytics page
- [ ] **Subtask:** Create `src/app/admin/campaigns/[slug]/analytics/page.tsx`
- [ ] **Subtask:** Show detailed conversion funnel
- [ ] **Subtask:** Time range selector
- [ ] **Subtask:** Export data as CSV
- [ ] **Subtask:** Compare with previous period

#### Task 8.2.2: Create real-time activity feed
- [ ] **Subtask:** Create `src/components/admin/activity-feed.tsx`
- [ ] **Subtask:** Subscribe to new letter events
- [ ] **Subtask:** Show recent letters with metadata
- [ ] **Subtask:** Auto-refresh or use WebSockets

---

## Phase 9: Sharing & Distribution ✅

**Duration:** 1 week  
**Goal:** Enable campaign sharing and embedding.

> **🔧 Scale-Ready Design:**
> - Embed widget should be as small as possible (separate bundle)
> - Pre-generate share images, don't compute on-demand
> - Track shares asynchronously (don't block the share action)
> - Use edge-cached redirects for short URLs

### Epic 9.1: Share Features ✅

#### Task 9.1.1: Create share URLs ✅
- [x] **Subtask:** Add UTM parameter support (addUtmParams helper)
- [x] **Subtask:** Generate shareable URLs with tracking
- [ ] **Subtask:** Track share clicks (deferred - analytics later)

#### Task 9.1.2: Create social share buttons ✅
- [x] **Subtask:** Create `src/components/share-buttons.tsx`
- [x] **Subtask:** Add Twitter share with pre-filled text
- [x] **Subtask:** Add WhatsApp share
- [x] **Subtask:** Add Facebook share
- [x] **Subtask:** Add LinkedIn share
- [x] **Subtask:** Add copy link button
- [x] **Subtask:** Add email share

### Epic 9.2: Embed Widget ✅

#### Task 9.2.1: Create embeddable widget ✅
- [x] **Subtask:** Create `src/app/embed/[campaign]/page.tsx`
- [x] **Subtask:** Create `src/app/embed/[campaign]/embed-letter-form.tsx`
- [x] **Subtask:** Create `src/app/embed/[campaign]/layout.tsx`
- [x] **Subtask:** Minimal UI version of letter form
- [x] **Subtask:** Configurable via query params (theme, hideHeader, hideStats, primaryColor)
- [x] **Subtask:** Cross-origin compatible with postMessage API

#### Task 9.2.2: Create embed code generator ✅
- [x] **Subtask:** Create `src/components/admin/embed-code-generator.tsx`
- [x] **Subtask:** Generate iframe code snippet
- [x] **Subtask:** Generate JavaScript dynamic embed code
- [x] **Subtask:** Live preview in admin
- [x] **Subtask:** Customization options (theme, dimensions, colors)

---

## Phase 10: Migration & Launch

**Duration:** 1 week  
**Goal:** Migrate existing data and prepare for launch.

> **🔧 Scale-Ready Design:**
> - Run migrations during low-traffic hours
> - Use feature flags to gradually roll out (start with 10% of traffic)
> - Set up monitoring BEFORE launch (Vercel Analytics, error tracking)
> - Have a rollback plan that doesn't require re-migration

### Epic 10.1: Data Migration

#### Task 10.1.1: Create iran-2026 campaign
- [ ] **Subtask:** Write seed script to create campaign
- [ ] **Subtask:** Migrate all FORDERUNGEN to campaign_demands
- [ ] **Subtask:** Migrate all prompts to campaign_prompts
- [ ] **Subtask:** Verify all data migrated correctly

#### Task 10.1.2: Backfill existing letters
- [ ] **Subtask:** Write migration to set campaign_id on all letters
- [ ] **Subtask:** Verify letter counts match
- [ ] **Subtask:** Update stats queries to use new schema

#### Task 10.1.3: Update hardcoded references
- [ ] **Subtask:** Find all hardcoded FORDERUNGEN imports
- [ ] **Subtask:** Replace with campaign context
- [ ] **Subtask:** Find all hardcoded prompt imports
- [ ] **Subtask:** Replace with dynamic fetching
- [ ] **Subtask:** Remove legacy files (keep as backup)

### Epic 10.2: Testing & QA 🔄

#### Task 10.2.0: Set up testing infrastructure ✅
- [x] **Subtask:** Install Vitest with React Testing Library
- [x] **Subtask:** Create vitest.config.ts with path aliases
- [x] **Subtask:** Create tests/setup.ts with global mocks
- [x] **Subtask:** Add test scripts to package.json

#### Task 10.2.1: Write integration tests 🔄
- [x] **Subtask:** Test campaign CRUD operations (mocked)
- [ ] **Subtask:** Test letter generation with campaign
- [x] **Subtask:** Test stats aggregation (mocked)
- [ ] **Subtask:** Test auth flows
- [ ] **Subtask:** Test admin pages

#### Task 10.2.2: Unit tests ✅
- [x] **Subtask:** Schema validation tests (28 tests)
- [x] **Subtask:** Prompt builder tests (30 tests)

#### Task 10.2.3: Performance testing
- [ ] **Subtask:** Load test campaign API endpoints
- [ ] **Subtask:** Test letter generation under load
- [ ] **Subtask:** Verify caching is working
- [ ] **Subtask:** Check Vercel function duration

#### Task 10.2.4: User acceptance testing
- [ ] **Subtask:** Test campaign creation flow end-to-end
- [ ] **Subtask:** Test letter writing flow for campaign
- [ ] **Subtask:** Test on mobile devices
- [ ] **Subtask:** Test with screen readers

### Epic 10.3: Launch Preparation

#### Task 10.3.1: Documentation 🔄
- [x] **Subtask:** Update README with testing commands
- [ ] **Subtask:** Write campaign creator guide
- [ ] **Subtask:** Document API endpoints
- [ ] **Subtask:** Create troubleshooting guide

#### Task 10.3.2: Deployment
- [ ] **Subtask:** Run all migrations on production
- [ ] **Subtask:** Deploy new code to production
- [ ] **Subtask:** Monitor error rates
- [ ] **Subtask:** Verify all features working

#### Task 10.3.3: Rollback plan
- [ ] **Subtask:** Document rollback procedure
- [ ] **Subtask:** Test rollback on staging
- [ ] **Subtask:** Prepare communication plan

---

## Appendix A: Technical Decisions

### Database: Supabase
- Continue using existing Supabase setup
- Leverage RLS for authorization
- Use Edge Functions for complex operations if needed

### Authentication: Supabase Auth
- Email/password + Google OAuth
- Role-based access via user_profiles table

### Caching Strategy
- Use Next.js `unstable_cache` for data fetching
- CDN caching for API responses
- Client-side SWR for real-time data

### File Storage
- Campaign images: Supabase Storage
- Consider CDN for static assets

### Monitoring
- Vercel Analytics for frontend
- Supabase logs for backend
- Consider Sentry for error tracking

---

## Appendix B: Dependencies to Add

```json
{
  "dependencies": {
    "recharts": "^2.x",          // Charts
    "@dnd-kit/core": "^6.x",     // Drag and drop
    "@dnd-kit/sortable": "^7.x", // Sortable lists
    "date-fns": "^3.x"           // Date utilities (if not present)
  }
}
```

---

## Appendix C: Environment Variables

```bash
# Existing
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# New for Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Appendix D: Scale-Ready Abstractions

These abstraction layers should be built from the start to enable easy swapping later:

### D.1: Cache Provider Interface

```typescript
// src/lib/infrastructure/cache/types.ts
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// src/lib/infrastructure/cache/memory.ts (NOW - simple Map-based)
export class MemoryCacheProvider implements CacheProvider {
  private cache = new Map<string, { value: unknown; expires: number }>();
  // ... implementation
}

// src/lib/infrastructure/cache/nextjs.ts (NOW - uses unstable_cache)
export class NextCacheProvider implements CacheProvider {
  // Wraps Next.js unstable_cache for RSC
}

// src/lib/infrastructure/cache/redis.ts (LATER - when > 5K users/day)
// import { Redis } from '@upstash/redis'
// export class RedisCacheProvider implements CacheProvider { ... }
```

### D.2: Rate Limiter Interface

```typescript
// src/lib/infrastructure/rate-limit/types.ts
export interface RateLimiter {
  check(identifier: string): Promise<{ allowed: boolean; remaining: number; reset: number }>;
  reset(identifier: string): Promise<void>;
}

// src/lib/infrastructure/rate-limit/memory.ts (NOW)
export class MemoryRateLimiter implements RateLimiter {
  // Current implementation - works fine for single region
}

// src/lib/infrastructure/rate-limit/upstash.ts (LATER - when multi-region needed)
// import { Ratelimit } from '@upstash/ratelimit'
// export class UpstashRateLimiter implements RateLimiter { ... }
```

### D.3: Job Queue Interface

```typescript
// src/lib/infrastructure/queue/types.ts
export interface JobQueue<T> {
  enqueue(job: T): Promise<string>; // Returns job ID
  getStatus(jobId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'>;
  getResult<R>(jobId: string): Promise<R | null>;
}

// src/lib/infrastructure/queue/sync.ts (NOW - immediate execution)
export class SyncJobQueue<T> implements JobQueue<T> {
  async enqueue(job: T): Promise<string> {
    // Execute immediately, store result
    const result = await this.processor(job);
    return this.storeResult(result);
  }
}

// src/lib/infrastructure/queue/qstash.ts (LATER - when > 100K users/day)
// import { Client } from '@upstash/qstash'
// export class QStashJobQueue<T> implements JobQueue<T> { ... }
```

### D.4: Analytics Provider Interface

```typescript
// src/lib/infrastructure/analytics/types.ts
export interface AnalyticsProvider {
  getCampaignStats(campaignId: string): Promise<CampaignStats>;
  getTimeSeries(campaignId: string, range: DateRange): Promise<TimeSeriesData[]>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
}

// src/lib/infrastructure/analytics/postgres.ts (NOW - direct queries)
export class PostgresAnalyticsProvider implements AnalyticsProvider {
  // Simple queries against letter_generations table
  // Add materialized views when queries get slow
}

// src/lib/infrastructure/analytics/tinybird.ts (LATER - when > 500K users/day)
// export class TinybirdAnalyticsProvider implements AnalyticsProvider { ... }
```

### D.5: Dependency Injection Setup

```typescript
// src/lib/infrastructure/index.ts
import { MemoryCacheProvider } from './cache/memory';
import { MemoryRateLimiter } from './rate-limit/memory';
import { SyncJobQueue } from './queue/sync';
import { PostgresAnalyticsProvider } from './analytics/postgres';

// Central configuration - swap implementations here when scaling
export const infrastructure = {
  cache: new MemoryCacheProvider(),
  rateLimiter: new MemoryRateLimiter({ 
    requests: 10, 
    window: 60 * 1000 // 10 req/min
  }),
  letterQueue: new SyncJobQueue(processLetterGeneration),
  analytics: new PostgresAnalyticsProvider(),
};

// Usage in API routes:
// import { infrastructure } from '@/lib/infrastructure';
// const { allowed } = await infrastructure.rateLimiter.check(ip);
```

---

## Appendix E: Future Scale Architecture

When you reach 1M+ users, the full architecture will look like:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           EDGE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  Vercel Edge Network (Global CDN)                                   │
│  ├── Edge Middleware (geo-routing, basic checks)                    │
│  ├── Edge Config (feature flags, active campaigns)                  │
│  ├── ISR/SSG (static campaign pages, cached 60s)                    │
│  └── Edge Functions (low-latency reads)                             │
├─────────────────────────────────────────────────────────────────────┤
│                         CACHE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Upstash Redis (Global, Edge-compatible)                            │
│  ├── Rate limiting (sliding window, distributed)                    │
│  ├── Session cache                                                  │
│  ├── Campaign data cache (hot campaigns)                            │
│  └── Letter generation dedup                                        │
├─────────────────────────────────────────────────────────────────────┤
│                       APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js 16 on Vercel Functions                                     │
│  ├── Server Components (data fetching)                              │
│  ├── API Routes (mutations)                                         │
│  └── Streaming responses (long operations)                          │
├─────────────────────────────────────────────────────────────────────┤
│                        QUEUE LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Upstash QStash                                                     │
│  ├── Letter generation (async, retryable)                           │
│  ├── Email sending                                                  │
│  └── Analytics event processing                                     │
├─────────────────────────────────────────────────────────────────────┤
│                       DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase Pro (Postgres)                                            │
│  ├── Primary (writes)                                               │
│  ├── Read replicas (analytics, reads)                               │
│  ├── Connection pooling (PgBouncer)                                 │
│  └── Partitioned tables (by month)                                  │
│                                                                     │
│  Tinybird (Analytics OLAP)                                          │
│  ├── Real-time aggregations                                         │
│  ├── Time-series queries                                            │
│  └── Dashboard APIs                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                     OBSERVABILITY LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  Sentry (Errors) + Axiom (Logs) + Checkly (Uptime)                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Future Dependencies (Add When Needed)

```bash
# When > 5K users/day (distributed rate limiting & cache)
bun add @upstash/redis @upstash/ratelimit

# When > 100K users/day (async job queue)
bun add @upstash/qstash

# When > 500K users/day (analytics OLAP)
# Configure Tinybird, no npm package needed

# When errors become critical
bun add @sentry/nextjs
```

### Estimated Costs at Scale

| Scale | Vercel | Supabase | Upstash | OpenAI | Total/mo |
|-------|--------|----------|---------|--------|----------|
| 1K/day | $0 | $0 | $0 | ~$15 | ~$15 |
| 10K/day | $20 | $25 | $0 | ~$150 | ~$200 |
| 100K/day | $150 | $100 | $50 | ~$1,500 | ~$1,800 |
| 1M/day | $500 | $400 | $200 | ~$15,000 | ~$16,000 |

