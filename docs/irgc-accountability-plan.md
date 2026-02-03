# IRGC Accountability Database Plan

> **Project Goal:** Create a Facebook-like, community-driven platform documenting IRGC members and their enablers. Built on Git infrastructure for full version history and transparent review of every change.

**Last Updated:** February 1, 2026  
**Estimated Total Effort:** 10-14 weeks  
**Priority:** High (Phase 1-3), Medium (Phase 4-6)

---

## Overview

### Design Philosophy

> **"Wikipedia meets Facebook, powered by Git"**

1. **Facebook-like UX** - Profiles, posts, timeline, reactions, comments. Accessible to everyone, not just legal/political experts.
2. **Git-backed data** - Every piece of data is a file in a Git repo. Full history, blame, diffs for every change.
3. **PR-based reviews** - Submissions create branches → merge requests → community review → merge to main.
4. **Leverage existing tools** - Don't reinvent version control. Build on GitLab/GitHub infrastructure.

### Architecture Decision: Build on GitLab

After analysis, **using GitLab as the data backend** is the right choice:

| Approach | Pros | Cons |
|----------|------|------|
| **Custom DB + custom versioning** | Full control | Reinventing Git, massive effort |
| **Headless CMS (Sanity, Strapi)** | Built-in versioning | Limited PR workflow, vendor lock-in |
| **Wiki (MediaWiki)** | History built-in | Poor UX, not social |
| **GitLab-backed + custom UI** ✅ | Full Git history, MRs, reviews, proven at scale | Need to build social UI layer |

### Why GitLab over GitHub?

- **Self-hostable** - Can run on own infrastructure for data sovereignty
- **Better MR workflow** - More granular permissions, approval rules
- **CI/CD built-in** - Auto-validate data, generate static site
- **Issue tracking** - Can use for disputes, discussions
- **Open source** - GitLab CE is fully open

### What We're Building

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐   │
│   │  Facebook-like  │◀──▶│   Next.js API   │◀──▶│   GitLab     │   │
│   │   Frontend      │    │   (Bridge)      │    │   Backend    │   │
│   └─────────────────┘    └─────────────────┘    └──────────────┘   │
│           │                      │                      │          │
│           │                      │                      ▼          │
│           │                      │              ┌──────────────┐   │
│           │                      │              │  Git Repo    │   │
│           │                      │              │  (Data)      │   │
│           │                      │              └──────────────┘   │
│           │                      │                      │          │
│           ▼                      ▼                      ▼          │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                     Supabase (Metadata)                     │  │
│   │   - User accounts, reactions, comments, notifications      │  │
│   │   - Search index, analytics, caching                       │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Storage Strategy

| Data Type | Storage | Why |
|-----------|---------|-----|
| **Profiles (individuals)** | GitLab repo (JSON/YAML) | Version history, MR reviews |
| **Evidence items** | GitLab repo (JSON + files) | Immutable, auditable |
| **Documents/images** | GitLab LFS or S3 | Large files |
| **Reactions/comments** | Supabase | Real-time, frequent updates |
| **User accounts** | Supabase Auth | OAuth, sessions |
| **Search index** | Supabase + pg_trgm | Fast queries |
| **Notifications** | Supabase | Real-time |

### Git Repository Structure

```
accountability-data/
├── README.md
├── CONTRIBUTING.md
├── schema/
│   ├── individual.schema.json      # JSON Schema for validation
│   ├── evidence.schema.json
│   └── connection.schema.json
├── individuals/
│   ├── qasem-soleimani/
│   │   ├── profile.json            # Name, DOB, photo, summary
│   │   ├── roles.json              # Positions held
│   │   ├── sanctions.json          # Sanction designations
│   │   ├── social-profiles.json    # Social media links
│   │   └── evidence/
│   │       ├── 2020-01-assassination.json
│   │       ├── 2019-sanctions-designation.json
│   │       └── ...
│   ├── hossein-salami/
│   │   ├── profile.json
│   │   └── ...
│   └── ...
├── connections/
│   ├── soleimani-salami.json       # Relationship data
│   └── ...
└── .gitlab-ci.yml                  # Validate on every commit
```

### Key Features (Facebook-style)

| Facebook Feature | Our Equivalent | Implementation |
|------------------|----------------|----------------|
| Profile | Individual page | Git: `individuals/{slug}/profile.json` |
| Posts | Evidence items | Git: `individuals/{slug}/evidence/*.json` |
| Timeline | Activity feed | Query git commits + Supabase |
| Like/React | Reactions | Supabase: `reactions` table |
| Comment | Discussions | Supabase: `comments` table |
| Share | Share to social | Frontend share buttons |
| Friend | Connection | Git: `connections/*.json` |
| Notification | Alerts | Supabase real-time |
| Groups | Organizations | Git: tag/filter by org |

### Legal & Safety Considerations

> ⚠️ **CRITICAL:** This feature handles sensitive data about potentially dangerous individuals.

1. **Only use public information** - No private/hacked data
2. **Source everything** - Every claim must have a verifiable source (URL, document)
3. **No doxxing of victims** - Never expose witnesses or victims
4. **Git = Audit trail** - Every change is signed and traceable
5. **MR = Legal review** - Human approval before any data goes live
6. **Defamation protection** - Use careful language ("alleged", "according to X")
7. **User safety** - Anonymous viewing, optional accounts for contributions

---

## Table of Contents

1. [Phase 1: GitLab Infrastructure](#phase-1-gitlab-infrastructure)
2. [Phase 2: Data Schema & Seed](#phase-2-data-schema--seed)
3. [Phase 3: API Bridge Layer](#phase-3-api-bridge-layer)
4. [Phase 4: Facebook-like Frontend](#phase-4-facebook-like-frontend)
5. [Phase 5: Submission & MR Workflow](#phase-5-submission--mr-workflow)
6. [Phase 6: Social Features](#phase-6-social-features)
7. [Phase 7: Search & Discovery](#phase-7-search--discovery)
8. [Phase 8: Connections & Visualization](#phase-8-connections--visualization)

---

## Phase 1: GitLab Infrastructure

**Duration:** 1-2 weeks  
**Goal:** Set up GitLab instance and data repository structure.

### Epic 1.1: GitLab Setup

#### Task 1.1.1: Choose GitLab hosting
- [ ] **Subtask:** Evaluate options:
  - GitLab.com (free tier, 5GB storage, public repos)
  - GitLab.com Premium (if need private + public)
  - Self-hosted GitLab CE (full control, own servers)
- [ ] **Subtask:** Decision: Start with GitLab.com, migrate to self-hosted if needed
- [ ] **Subtask:** Create GitLab organization: `iran-accountability`
- [ ] **Subtask:** Create data repository: `iran-accountability/data`
- [ ] **Subtask:** Configure branch protection on `main`
- [ ] **Subtask:** Set up MR approval rules (min 2 approvers)

#### Task 1.1.2: Configure GitLab CI/CD
- [ ] **Subtask:** Create `.gitlab-ci.yml` for data validation
- [ ] **Subtask:** Stage 1: Validate JSON against schemas
- [ ] **Subtask:** Stage 2: Check for required fields
- [ ] **Subtask:** Stage 3: Verify source URLs are accessible
- [ ] **Subtask:** Stage 4: Generate static JSON index for API
- [ ] **Subtask:** Stage 5: Deploy to CDN (optional)

#### Task 1.1.3: Set up GitLab API access
- [ ] **Subtask:** Create service account for API access
- [ ] **Subtask:** Generate Personal Access Token with scopes: `api`, `read_repository`
- [ ] **Subtask:** Store token in environment variables
- [ ] **Subtask:** Test API access from Next.js app

### Epic 1.2: Repository Structure

#### Task 1.2.1: Create base repository structure
- [ ] **Subtask:** Initialize repo with README, LICENSE (CC BY-SA 4.0)
- [ ] **Subtask:** Create `CONTRIBUTING.md` with submission guidelines
- [ ] **Subtask:** Create `CODE_OF_CONDUCT.md`
- [ ] **Subtask:** Create directory structure:
  ```
  /schema/          # JSON Schema files
  /individuals/     # One folder per person
  /connections/     # Relationship files
  /organizations/   # Org metadata (IRGC, Basij, etc.)
  /scripts/         # Validation scripts
  ```
- [ ] **Subtask:** Set up `.gitattributes` for LFS (large files)
- [ ] **Subtask:** Create issue templates for submissions

#### Task 1.2.2: Create JSON Schema definitions
- [ ] **Subtask:** Create `schema/individual.schema.json`
  ```json
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["id", "slug", "name", "name_fa"],
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
      "name": { "type": "string" },
      "name_fa": { "type": "string" },
      "aliases": { "type": "array", "items": { "type": "string" } },
      "birth_date": { "type": "string", "format": "date" },
      "birth_date_approx": { "type": "boolean" },
      "birth_place": { "type": "string" },
      "photo_url": { "type": "string", "format": "uri" },
      "photo_source": { "type": "string" },
      "status": { "enum": ["active", "deceased", "unknown"] },
      "status_date": { "type": "string", "format": "date" },
      "summary": { "type": "string" },
      "summary_fa": { "type": "string" },
      "verification_level": { "enum": ["unverified", "community", "expert", "official"] }
    }
  }
  ```
- [ ] **Subtask:** Create `schema/evidence.schema.json`
- [ ] **Subtask:** Create `schema/role.schema.json`
- [ ] **Subtask:** Create `schema/sanction.schema.json`
- [ ] **Subtask:** Create `schema/connection.schema.json`

---

## Phase 2: Data Schema & Seed

**Duration:** 1-2 weeks  
**Goal:** Define data formats and create initial dataset from verified sources.

### Epic 2.1: Individual Profile Format

#### Task 2.1.1: Define profile.json structure
- [ ] **Subtask:** Design profile.json format:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "qasem-soleimani",
    "name": "Qasem Soleimani",
    "name_fa": "قاسم سلیمانی",
    "aliases": ["Qassem Soleimani", "Qassim Suleimani"],
    "birth_date": "1957-03-11",
    "birth_place": "Qanat-e Malek, Iran",
    "death_date": "2020-01-03",
    "photo_url": "/individuals/qasem-soleimani/photo.jpg",
    "photo_source": "https://commons.wikimedia.org/...",
    "status": "deceased",
    "summary": "Commander of IRGC Quds Force from 1998 until his death.",
    "summary_fa": "فرمانده نیروی قدس سپاه از ۱۳۷۷ تا زمان مرگ",
    "verification_level": "official",
    "created_at": "2026-02-01T00:00:00Z",
    "updated_at": "2026-02-01T00:00:00Z"
  }
  ```
- [ ] **Subtask:** Document all fields in CONTRIBUTING.md

#### Task 2.1.2: Define roles.json structure
- [ ] **Subtask:** Design roles.json format:
  ```json
  {
    "roles": [
      {
        "id": "role-001",
        "organization": "IRGC",
        "division": "Quds Force",
        "title": "Commander",
        "title_fa": "فرمانده",
        "rank": "Major General",
        "start_date": "1998-01-01",
        "end_date": "2020-01-03",
        "is_current": false,
        "source_url": "https://...",
        "source_title": "Official announcement"
      }
    ]
  }
  ```

#### Task 2.1.3: Define evidence item format
- [ ] **Subtask:** Design evidence file format:
  ```json
  {
    "id": "ev-2020-001",
    "type": "sanction",
    "title": "OFAC Designation as SDGT",
    "title_fa": "تحریم توسط وزارت خزانه‌داری آمریکا",
    "date": "2011-10-11",
    "description": "Designated under E.O. 13224 for...",
    "sources": [
      {
        "url": "https://www.treasury.gov/...",
        "archived_url": "https://web.archive.org/...",
        "title": "Treasury Designates...",
        "publisher": "U.S. Department of the Treasury",
        "date": "2011-10-11"
      }
    ],
    "metadata": {
      "sanctioning_body": "US/OFAC",
      "designation_id": "SDGT",
      "sanction_types": ["asset_freeze", "travel_ban"],
      "is_active": true
    },
    "created_at": "2026-02-01T00:00:00Z",
    "created_by": "initial-seed"
  }
  ```
- [ ] **Subtask:** Define type-specific metadata schemas

### Epic 2.2: Seed Initial Data

#### Task 2.2.1: Compile OFAC SDN list entries
- [ ] **Subtask:** Download OFAC SDN list (XML)
- [ ] **Subtask:** Parse and extract IRGC-related entries
- [ ] **Subtask:** Convert to our JSON format
- [ ] **Subtask:** Verify with Treasury website
- [ ] **Subtask:** Create individuals with sanction evidence

#### Task 2.2.2: Compile EU sanctions list
- [ ] **Subtask:** Download EU consolidated sanctions list
- [ ] **Subtask:** Extract Iran/IRGC related entries
- [ ] **Subtask:** Cross-reference with OFAC entries
- [ ] **Subtask:** Add as evidence items

#### Task 2.2.3: Add high-profile commanders
- [ ] **Subtask:** Research top 50 IRGC commanders
- [ ] **Subtask:** Create profiles with verified sources
- [ ] **Subtask:** Add roles, sanctions, and evidence
- [ ] **Subtask:** Review and validate all sources
- [ ] **Subtask:** Commit initial dataset

### Epic 2.3: Supabase Metadata Tables

#### Task 2.3.1: Create reactions table
- [ ] **Subtask:** Design reactions table (like Facebook reactions)
  ```sql
  CREATE TABLE accountability_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    individual_slug TEXT NOT NULL,
    evidence_id TEXT,  -- null = reaction to profile
    user_id UUID REFERENCES auth.users,
    reaction_type TEXT NOT NULL,  -- 'support', 'important', 'verified'
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] **Subtask:** Add unique constraint (user can react once per item)
- [ ] **Subtask:** Write migration `020_accountability_reactions.sql`

#### Task 2.3.2: Create comments table
- [ ] **Subtask:** Design comments table
  ```sql
  CREATE TABLE accountability_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    individual_slug TEXT NOT NULL,
    evidence_id TEXT,
    parent_id UUID REFERENCES accountability_comments,
    user_id UUID REFERENCES auth.users,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT false
  );
  ```
- [ ] **Subtask:** Write migration `021_accountability_comments.sql`

#### Task 2.3.3: Create search index table
- [ ] **Subtask:** Design search cache table
  ```sql
  CREATE TABLE accountability_search_index (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_fa TEXT,
    aliases TEXT[],
    organizations TEXT[],
    summary TEXT,
    search_vector TSVECTOR,
    last_synced TIMESTAMPTZ
  );
  ```
- [ ] **Subtask:** Add GIN index on search_vector
- [ ] **Subtask:** Write migration `022_accountability_search.sql`
- [ ] **Subtask:** Create sync function from GitLab

---

## Phase 3: API Bridge Layer

**Duration:** 2 weeks  
**Goal:** Build Next.js API that bridges GitLab repository with Facebook-like frontend.

### Epic 3.1: GitLab API Client

#### Task 3.1.1: Create GitLab client wrapper
- [ ] **Subtask:** Create `src/lib/accountability/gitlab-client.ts`
- [ ] **Subtask:** Initialize with environment variables
  ```typescript
  const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';
  const GITLAB_TOKEN = process.env.GITLAB_ACCOUNTABILITY_TOKEN;
  const GITLAB_PROJECT_ID = process.env.GITLAB_ACCOUNTABILITY_PROJECT;
  ```
- [ ] **Subtask:** Implement `getFile(path: string, ref?: string)`
- [ ] **Subtask:** Implement `listDirectory(path: string)`
- [ ] **Subtask:** Implement `getCommitHistory(path: string, limit: number)`
- [ ] **Subtask:** Implement `createBranch(name: string, ref: string)`
- [ ] **Subtask:** Implement `createMergeRequest(source, target, title, description)`
- [ ] **Subtask:** Add response caching with `unstable_cache`

#### Task 3.1.2: Create data fetching utilities
- [ ] **Subtask:** Create `src/lib/accountability/queries/individuals.ts`
- [ ] **Subtask:** Implement `getIndividualBySlug(slug: string)`
  - Fetch `individuals/{slug}/profile.json`
  - Fetch `individuals/{slug}/roles.json`
  - Return combined data
- [ ] **Subtask:** Implement `listIndividuals(filters?)`
  - List all directories in `individuals/`
  - Fetch profiles in parallel (with limit)
  - Apply filters
- [ ] **Subtask:** Implement `getIndividualEvidence(slug: string)`
  - List files in `individuals/{slug}/evidence/`
  - Parse and return chronologically

#### Task 3.1.3: Create git history utilities
- [ ] **Subtask:** Create `src/lib/accountability/queries/history.ts`
- [ ] **Subtask:** Implement `getProfileHistory(slug: string)`
  - Fetch git log for profile.json
  - Return list of changes with diffs
- [ ] **Subtask:** Implement `getEvidenceHistory(slug: string, evidenceId: string)`
- [ ] **Subtask:** Implement `getContributors(slug: string)`
  - Aggregate commit authors

### Epic 3.2: Public API Endpoints

#### Task 3.2.1: Create individuals API
- [ ] **Subtask:** Create `src/app/api/accountability/individuals/route.ts`
  - GET: List individuals with filters, search, pagination
  - Response includes reaction counts from Supabase
- [ ] **Subtask:** Create `src/app/api/accountability/individuals/[slug]/route.ts`
  - GET: Full profile with roles, recent evidence
  - Include reaction and comment counts
- [ ] **Subtask:** Add caching headers (stale-while-revalidate)

#### Task 3.2.2: Create evidence API
- [ ] **Subtask:** Create `src/app/api/accountability/individuals/[slug]/evidence/route.ts`
  - GET: List evidence items with pagination
  - Include reaction counts
- [ ] **Subtask:** Create `src/app/api/accountability/evidence/[id]/route.ts`
  - GET: Single evidence item with sources
  - Include full git history

#### Task 3.2.3: Create history API
- [ ] **Subtask:** Create `src/app/api/accountability/individuals/[slug]/history/route.ts`
  - GET: Git commit history for profile
  - Show who changed what, when
- [ ] **Subtask:** Create `src/app/api/accountability/individuals/[slug]/evidence/[id]/history/route.ts`
  - GET: History for specific evidence item

#### Task 3.2.4: Create activity feed API
- [ ] **Subtask:** Create `src/app/api/accountability/feed/route.ts`
  - GET: Recent activity across all profiles
  - Combine: new evidence, profile updates, new individuals
  - Paginated, filterable

### Epic 3.3: Social Features API

#### Task 3.3.1: Create reactions API
- [ ] **Subtask:** Create `src/app/api/accountability/reactions/route.ts`
  - POST: Add reaction (requires auth)
  - DELETE: Remove reaction
- [ ] **Subtask:** Create `src/app/api/accountability/individuals/[slug]/reactions/route.ts`
  - GET: Reaction counts and current user's reactions

#### Task 3.3.2: Create comments API
- [ ] **Subtask:** Create `src/app/api/accountability/comments/route.ts`
  - GET: List comments for item
  - POST: Add comment (requires auth)
  - PUT: Edit own comment
  - DELETE: Delete own comment
- [ ] **Subtask:** Add rate limiting
- [ ] **Subtask:** Add content moderation hooks

---

## Phase 4: Facebook-like Frontend

**Duration:** 2-3 weeks  
**Goal:** Build the social-media-style user interface.

### Epic 4.1: Layout & Navigation

#### Task 4.1.1: Create accountability layout
- [ ] **Subtask:** Create `src/app/accountability/layout.tsx`
- [ ] **Subtask:** Design Facebook-like header:
  - Logo + "Accountability Database"
  - Search bar (prominent, center)
  - User menu (right)
- [ ] **Subtask:** Design left sidebar:
  - Home (feed)
  - Browse (directory)
  - Organizations (IRGC, Basij, etc.)
  - Sanctioned
  - Submit
- [ ] **Subtask:** Responsive: sidebar → bottom nav on mobile

#### Task 4.1.2: Create accountability home/feed
- [ ] **Subtask:** Create `src/app/accountability/page.tsx`
- [ ] **Subtask:** Hero section with stats:
  - "X individuals documented"
  - "Y pieces of evidence"
  - "Z active sanctions"
- [ ] **Subtask:** Activity feed (like Facebook News Feed):
  - Recent evidence posts
  - New individuals added
  - Profile updates
- [ ] **Subtask:** "Featured" or "Spotlight" section

### Epic 4.2: Profile Page (Facebook-style)

#### Task 4.2.1: Create profile header
- [ ] **Subtask:** Create `src/app/accountability/[slug]/page.tsx`
- [ ] **Subtask:** Create `src/components/accountability/profile-header.tsx`
- [ ] **Subtask:** Cover photo area (organization banner)
- [ ] **Subtask:** Profile photo (large, left side)
- [ ] **Subtask:** Name in English and Persian
- [ ] **Subtask:** Title/role badge (e.g., "IRGC Commander")
- [ ] **Subtask:** Status indicator (active, deceased, unknown)
- [ ] **Subtask:** Verification badge
- [ ] **Subtask:** Action buttons:
  - "React" (support, important, verified)
  - "Share"
  - "Report correction"
  - "View history"

#### Task 4.2.2: Create profile tabs
- [ ] **Subtask:** Create tab navigation:
  - **Timeline** (default) - Evidence feed
  - **About** - Bio, roles, details
  - **Sanctions** - All sanctions
  - **Connections** - Related people
  - **History** - Git history
- [ ] **Subtask:** URL-based tab state (`/[slug]?tab=about`)

#### Task 4.2.3: Create "About" section
- [ ] **Subtask:** Create `src/components/accountability/profile-about.tsx`
- [ ] **Subtask:** "Overview" card:
  - Birth date/place
  - Status (with date if deceased)
  - Organizations
- [ ] **Subtask:** "Positions" card:
  - Timeline of roles
  - Current position highlighted
  - Source links
- [ ] **Subtask:** "Social Media" card:
  - Platform icons with links
  - Verification status
  - Archive links
- [ ] **Subtask:** "Aliases" card:
  - Known alternate names/spellings

#### Task 4.2.4: Create "Timeline" section (Evidence Feed)
- [ ] **Subtask:** Create `src/components/accountability/evidence-feed.tsx`
- [ ] **Subtask:** Each evidence item as a "post" card:
  ```
  ┌─────────────────────────────────────────┐
  │ 📄 Sanction                   Jan 2020  │
  │ ─────────────────────────────────────── │
  │ OFAC Designation as SDN                 │
  │                                         │
  │ Designated under Executive Order 13224  │
  │ for providing support to...             │
  │                                         │
  │ 📎 Source: treasury.gov | archive.org   │
  │ ─────────────────────────────────────── │
  │ 👍 12   💬 3 comments   📤 Share        │
  └─────────────────────────────────────────┘
  ```
- [ ] **Subtask:** Type icons for each evidence type
- [ ] **Subtask:** Expandable full description
- [ ] **Subtask:** Reactions row
- [ ] **Subtask:** Comments section (collapsible)
- [ ] **Subtask:** Share button with options
- [ ] **Subtask:** "View history" link (git blame)
- [ ] **Subtask:** Infinite scroll with loading

#### Task 4.2.5: Create "Sanctions" section
- [ ] **Subtask:** Create `src/components/accountability/sanctions-list.tsx`
- [ ] **Subtask:** Card per sanctioning body:
  - Country flag
  - Designation type
  - Date and status (active/removed)
  - Link to official listing
  - Link to archived listing

#### Task 4.2.6: Create "History" section (Git-powered)
- [ ] **Subtask:** Create `src/components/accountability/git-history.tsx`
- [ ] **Subtask:** Timeline of changes:
  ```
  ┌─────────────────────────────────────────┐
  │ Feb 1, 2026 - @contributor1             │
  │ "Added new sanction evidence"           │
  │ Changed: evidence/2026-01-sanction.json │
  │ [View diff] [View MR]                   │
  ├─────────────────────────────────────────┤
  │ Jan 15, 2026 - @contributor2            │
  │ "Updated role information"              │
  │ Changed: roles.json                     │
  │ [View diff] [View MR]                   │
  └─────────────────────────────────────────┘
  ```
- [ ] **Subtask:** Link to GitLab commit
- [ ] **Subtask:** Link to merge request
- [ ] **Subtask:** Show diff preview

### Epic 4.3: Directory/Browse Page

#### Task 4.3.1: Create directory page
- [ ] **Subtask:** Create `src/app/accountability/browse/page.tsx`
- [ ] **Subtask:** Grid of profile cards (like Facebook friends list)
- [ ] **Subtask:** Filter sidebar:
  - Organization (IRGC, Basij, MOIS, etc.)
  - Division (Quds Force, Ground Forces, etc.)
  - Rank
  - Sanction status
  - Verification level
- [ ] **Subtask:** Sort options (name, recent activity, most evidence)
- [ ] **Subtask:** URL-based filter state

#### Task 4.3.2: Create profile card component
- [ ] **Subtask:** Create `src/components/accountability/profile-card.tsx`
- [ ] **Subtask:** Photo
- [ ] **Subtask:** Name (EN/FA)
- [ ] **Subtask:** Current role
- [ ] **Subtask:** Sanction badges (flags)
- [ ] **Subtask:** Evidence count
- [ ] **Subtask:** Verification badge
- [ ] **Subtask:** Quick actions (view, share)

### Epic 4.4: Social Interactions

#### Task 4.4.1: Create reactions component
- [ ] **Subtask:** Create `src/components/accountability/reactions.tsx`
- [ ] **Subtask:** Reaction button with dropdown:
  - 👍 Support (I support documenting this)
  - ⚠️ Important (This is significant evidence)
  - ✓ Verified (I've independently verified this)
- [ ] **Subtask:** Show reaction counts
- [ ] **Subtask:** Show who reacted (on hover)
- [ ] **Subtask:** Optimistic updates

#### Task 4.4.2: Create comments component
- [ ] **Subtask:** Create `src/components/accountability/comments.tsx`
- [ ] **Subtask:** Comment input (appears when signed in)
- [ ] **Subtask:** Comment list with:
  - User avatar + name
  - Comment text
  - Timestamp
  - Edit/delete (own comments)
- [ ] **Subtask:** Threaded replies (1 level)
- [ ] **Subtask:** Load more comments
- [ ] **Subtask:** Real-time updates via Supabase

#### Task 4.4.3: Create share component
- [ ] **Subtask:** Create `src/components/accountability/share-dialog.tsx`
- [ ] **Subtask:** Share to: Twitter, Facebook, WhatsApp, Telegram, Email
- [ ] **Subtask:** Copy link button
- [ ] **Subtask:** Embed code (for websites)

---

## Phase 5: Submission & MR Workflow

**Duration:** 2 weeks  
**Goal:** Enable community submissions that create GitLab merge requests.

### Epic 5.1: Submission Forms

#### Task 5.1.1: Create evidence submission form
- [ ] **Subtask:** Create `src/app/accountability/submit/page.tsx`
- [ ] **Subtask:** Create `src/components/accountability/submit/evidence-form.tsx`
- [ ] **Subtask:** Individual search/select (typeahead)
- [ ] **Subtask:** Evidence type selector with icons
- [ ] **Subtask:** Dynamic fields based on type:
  - **Sanction:** Body, designation ID, sanction types
  - **Court case:** Court, case number, status
  - **News article:** Publication, author, headline
  - **Social media:** Platform, username, URL
  - **Witness testimony:** Type, anonymity level
- [ ] **Subtask:** Source URL input with auto-archive to archive.org
- [ ] **Subtask:** Description (markdown)
- [ ] **Subtask:** Date picker
- [ ] **Subtask:** File upload (screenshots, documents)
- [ ] **Subtask:** Preview before submit

#### Task 5.1.2: Create new individual form
- [ ] **Subtask:** Create `src/components/accountability/submit/individual-form.tsx`
- [ ] **Subtask:** Multi-step wizard:
  1. Basic info (name EN/FA, aliases)
  2. Birth/status info
  3. Photo upload with source
  4. Role information
  5. Initial evidence (required)
  6. Justification
- [ ] **Subtask:** Duplicate check before submit
- [ ] **Subtask:** Preview generated profile

#### Task 5.1.3: Create correction form
- [ ] **Subtask:** Create `src/components/accountability/submit/correction-form.tsx`
- [ ] **Subtask:** Select field to correct
- [ ] **Subtask:** Show current value
- [ ] **Subtask:** Input corrected value
- [ ] **Subtask:** Source for correction
- [ ] **Subtask:** Explanation

### Epic 5.2: GitLab Integration for Submissions

#### Task 5.2.1: Create submission API
- [ ] **Subtask:** Create `src/app/api/accountability/submit/route.ts`
- [ ] **Subtask:** Validate submission data
- [ ] **Subtask:** Rate limit (5 submissions/hour per IP)
- [ ] **Subtask:** Create unique branch name: `submit/{type}/{slug}-{timestamp}`
- [ ] **Subtask:** Add/modify files in branch
- [ ] **Subtask:** Create merge request with description
- [ ] **Subtask:** Add labels: `submission`, `needs-review`
- [ ] **Subtask:** Store submission metadata in Supabase
- [ ] **Subtask:** Return MR URL for tracking

#### Task 5.2.2: Create GitLab MR automation
- [ ] **Subtask:** Create MR description template
  ```markdown
  ## Submission Type
  New evidence for {individual}
  
  ## Submitted By
  {user or "anonymous"}
  
  ## Summary
  {user description}
  
  ## Sources
  - {source_url}
  - Archived: {archived_url}
  
  ## Checklist
  - [ ] Sources verified
  - [ ] No private information
  - [ ] Follows guidelines
  
  /label ~submission ~needs-review
  ```
- [ ] **Subtask:** Add CI job to validate submission format
- [ ] **Subtask:** Add CI job to check sources are accessible
- [ ] **Subtask:** Auto-archive URLs to archive.org

#### Task 5.2.3: Create submission tracking
- [ ] **Subtask:** Create `src/app/accountability/submissions/page.tsx` (user's submissions)
- [ ] **Subtask:** Create `src/app/accountability/submissions/[id]/page.tsx`
- [ ] **Subtask:** Show MR status: open, merged, closed
- [ ] **Subtask:** Embed GitLab MR discussion
- [ ] **Subtask:** Email notifications for status changes

### Epic 5.3: Supabase Submission Tracking

#### Task 5.3.1: Create submissions table
- [ ] **Subtask:** Design table for tracking submissions
  ```sql
  CREATE TABLE accountability_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gitlab_mr_iid INTEGER NOT NULL,
    gitlab_mr_url TEXT NOT NULL,
    submission_type TEXT NOT NULL,  -- 'new_individual', 'new_evidence', 'correction'
    individual_slug TEXT,
    status TEXT NOT NULL,  -- 'pending', 'under_review', 'merged', 'closed'
    user_id UUID REFERENCES auth.users,
    submitter_email TEXT,  -- for anonymous
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] **Subtask:** Write migration `023_accountability_submissions.sql`

#### Task 5.3.2: Create MR webhook handler
- [ ] **Subtask:** Create `src/app/api/accountability/webhooks/gitlab/route.ts`
- [ ] **Subtask:** Verify webhook signature
- [ ] **Subtask:** Handle MR state changes
- [ ] **Subtask:** Update Supabase submission status
- [ ] **Subtask:** Trigger cache invalidation on merge
- [ ] **Subtask:** Send notifications

---

## Phase 6: Social Features

**Duration:** 1-2 weeks  
**Goal:** Complete the social layer with notifications and user profiles.

### Epic 6.1: User Profiles

#### Task 6.1.1: Create contributor profiles
- [ ] **Subtask:** Create `src/app/accountability/contributors/[username]/page.tsx`
- [ ] **Subtask:** Show user's contributions:
  - Submissions made
  - Merge requests merged
  - Reactions given
  - Comments made
- [ ] **Subtask:** Contributor badge levels:
  - New contributor
  - Verified contributor (5+ merged)
  - Expert contributor (20+ merged)
  - Moderator
- [ ] **Subtask:** Privacy settings (hide activity)

### Epic 6.2: Notifications

#### Task 6.2.1: Create notifications system
- [ ] **Subtask:** Create notifications table
  ```sql
  CREATE TABLE accountability_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] **Subtask:** Notification types:
  - MR status changed
  - Comment on your content
  - Reply to your comment
  - Reaction to your content
  - New evidence on followed profile
- [ ] **Subtask:** Real-time via Supabase subscriptions

#### Task 6.2.2: Create notifications UI
- [ ] **Subtask:** Create bell icon in header with count
- [ ] **Subtask:** Dropdown list of notifications
- [ ] **Subtask:** Mark as read on click
- [ ] **Subtask:** "Mark all as read"
- [ ] **Subtask:** Notification preferences page

### Epic 6.3: Following

#### Task 6.3.1: Create follow system
- [ ] **Subtask:** Create follows table
  ```sql
  CREATE TABLE accountability_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users,
    individual_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, individual_slug)
  );
  ```
- [ ] **Subtask:** "Follow" button on profiles
- [ ] **Subtask:** Notify on new evidence
- [ ] **Subtask:** "Following" filter in feed

---

## Phase 7: Search & Discovery

**Duration:** 1-2 weeks  
**Goal:** Build powerful search and discovery features.

### Epic 7.1: Full-Text Search

#### Task 7.1.1: Sync GitLab to search index
- [ ] **Subtask:** Create GitLab webhook for push events
- [ ] **Subtask:** On push to main, parse changed files
- [ ] **Subtask:** Update Supabase search_index table
- [ ] **Subtask:** Schedule full re-sync job (daily)

#### Task 7.1.2: Create search API
- [ ] **Subtask:** Create `src/app/api/accountability/search/route.ts`
- [ ] **Subtask:** Search Supabase with pg_trgm for fuzzy match
- [ ] **Subtask:** Support English and Persian search
- [ ] **Subtask:** Return ranked results with highlights

#### Task 7.1.3: Create search UI
- [ ] **Subtask:** Create `src/app/accountability/search/page.tsx`
- [ ] **Subtask:** Search bar with typeahead suggestions
- [ ] **Subtask:** Tabbed results (Individuals, Evidence)
- [ ] **Subtask:** URL-based search state
- [ ] **Subtask:** Recent searches (local storage)

### Epic 7.2: Discovery Features

#### Task 7.2.1: Create activity feed
- [ ] **Subtask:** Create `src/app/accountability/feed/page.tsx`
- [ ] **Subtask:** Show recent git commits as activity
- [ ] **Subtask:** Filter by type (new profile, new evidence)
- [ ] **Subtask:** Infinite scroll

#### Task 7.2.2: Create featured section
- [ ] **Subtask:** Create `featured.json` in GitLab repo
- [ ] **Subtask:** Admin can update via MR
- [ ] **Subtask:** Show on homepage

---

## Phase 8: Connections & Visualization

**Duration:** 2 weeks  
**Goal:** Visualize relationships between individuals and organizations.

### Epic 8.1: Connections Data Model

#### Task 8.1.1: Define connection file format
- [ ] **Subtask:** Create `schema/connection.schema.json`
- [ ] **Subtask:** Connection types: superior, subordinate, colleague, family, business, enabler
- [ ] **Subtask:** Store in `connections/` directory
- [ ] **Subtask:** File naming: `{from-slug}--{to-slug}.json`

#### Task 8.1.2: Create connections API
- [ ] **Subtask:** Create `src/app/api/accountability/individuals/[slug]/connections/route.ts`
- [ ] **Subtask:** List all connections for individual
- [ ] **Subtask:** Return both directions (connections from and to)

### Epic 8.2: Network Visualization

#### Task 8.2.1: Create network graph component
- [ ] **Subtask:** Install `react-force-graph` or `vis-network`
- [ ] **Subtask:** Create `src/components/accountability/network-graph.tsx`
- [ ] **Subtask:** Display individuals as nodes with photos
- [ ] **Subtask:** Display connections as edges with labels
- [ ] **Subtask:** Color-code by organization
- [ ] **Subtask:** Interactive: zoom, pan, click to navigate

#### Task 8.2.2: Create connections page
- [ ] **Subtask:** Create `src/app/accountability/[slug]/connections/page.tsx`
- [ ] **Subtask:** Show ego-network centered on individual
- [ ] **Subtask:** Expand/collapse levels
- [ ] **Subtask:** Filter by connection type
- [ ] **Subtask:** List view alternative

### Epic 8.3: Organization Charts

#### Task 8.3.1: Create org chart view
- [ ] **Subtask:** Create `src/app/accountability/orgs/[org]/page.tsx`
- [ ] **Subtask:** Hierarchical tree view of command structure
- [ ] **Subtask:** Filter by division
- [ ] **Subtask:** Show current vs. historical positions

---

## Appendix A: GitLab Setup Checklist

| Step | Description | Status |
|------|-------------|--------|
| 1 | Create GitLab.com organization | [ ] |
| 2 | Create `accountability-data` repository | [ ] |
| 3 | Set up branch protection on `main` | [ ] |
| 4 | Configure MR approval rules (min 2) | [ ] |
| 5 | Create service account for API access | [ ] |
| 6 | Generate Personal Access Token | [ ] |
| 7 | Set up CI/CD pipeline for validation | [ ] |
| 8 | Configure webhooks for Supabase sync | [ ] |

---

## Appendix B: UI Routes Summary

| Route | Description |
|-------|-------------|
| `/accountability` | Home page with feed |
| `/accountability/browse` | Directory grid |
| `/accountability/search` | Search results |
| `/accountability/[slug]` | Individual profile |
| `/accountability/[slug]/connections` | Network view |
| `/accountability/submit` | Submit evidence/individual |
| `/accountability/submissions` | User's submissions |
| `/accountability/submissions/[id]` | Track submission |
| `/accountability/contributors/[user]` | Contributor profile |
| `/accountability/orgs/[org]` | Organization chart |

---

## Appendix C: Git Repository File Formats

### profile.json
```json
{
  "id": "uuid",
  "slug": "full-name-slug",
  "name": "Full Name",
  "name_fa": "نام کامل",
  "aliases": ["Alias 1", "Alias 2"],
  "birth_date": "1957-03-11",
  "birth_place": "City, Iran",
  "status": "active|deceased|unknown",
  "photo_url": "./photo.jpg",
  "summary": "Brief description",
  "verification_level": "unverified|community|expert|official"
}
```

### roles.json
```json
{
  "roles": [
    {
      "organization": "IRGC",
      "division": "Quds Force",
      "title": "Commander",
      "rank": "Major General",
      "start_date": "1998-01-01",
      "end_date": null,
      "is_current": true,
      "source_url": "https://..."
    }
  ]
}
```

### evidence/{date}-{type}.json
```json
{
  "id": "ev-2020-001",
  "type": "sanction|court_case|news|social_media|testimony",
  "title": "Evidence title",
  "date": "2020-01-03",
  "description": "Detailed description",
  "sources": [
    {
      "url": "https://original.source",
      "archived_url": "https://web.archive.org/...",
      "title": "Source title",
      "publisher": "Publisher name"
    }
  ],
  "metadata": {
    // type-specific fields
  }
}
```

---

## Appendix D: Security & Legal

### Data Protection
- GitLab repo is public (transparency)
- All changes require MR (no direct push to main)
- CI validates data format and sources
- Rate limiting on Next.js API layer

### Legal Protection
- All content from public sources only
- Sources required for every claim
- Use "alleged" and "according to X" language
- Document right of reply process
- DMCA/takedown process documented

### User Safety
- Anonymous viewing (no login required)
- Optional accounts for contributions
- Submitter identity protected
- No tracking of viewers

---

## Appendix E: Alternatives Considered

### Why not just use GitLab/GitHub directly?

| Feature | Raw GitLab | Our Platform |
|---------|-----------|--------------|
| UX | Developer-focused | Facebook-like, accessible |
| Browsing | File explorer | Profile cards, filters |
| Search | Code search | Name/alias fuzzy search |
| Reactions | Emojis on MRs | Like on profiles/evidence |
| Comments | MR discussions | Threaded per-item |
| Notifications | Git activity | Follow individuals |
| Mobile | Okay | Optimized |

**Conclusion:** GitLab is the backend, but we need a custom frontend for non-technical users.

### Why not build on Notion/Airtable/etc?

- No Git-style version history
- Limited API access
- Vendor lock-in
- No self-hosting option
- Cost at scale

---

## Appendix F: Dependencies

```json
{
  "dependencies": {
    "react-force-graph": "^1.x",     // Network visualization
    "@react-pdf/renderer": "^3.x",    // PDF generation
    "jszip": "^3.x",                  // ZIP file creation
    "@octokit/rest": "^20.x"          // GitLab API client (if using GitHub)
  }
}
```

For GitLab API, use the built-in fetch with:
```typescript
const GITLAB_API = process.env.GITLAB_URL + '/api/v4';
const headers = { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN };
```

---

## Appendix G: Future Enhancements (Post-Launch)

- **Email alerts** - Subscribe to updates on individuals
- **Telegram bot** - Search and browse via Telegram
- **Browser extension** - Highlight names on web pages
- **Mobile app** - Native iOS/Android
- **AI summaries** - Auto-generate profile summaries
- **Translation** - Auto-translate evidence to multiple languages
- **Legal export** - Format for specific court systems
