# Portfolio Website — Build Plan

> Brief for a Claude Code session. Read this whole file before starting, then build the whole site end to end, working through the phases in order. Don't pause for review between phases; see "Working rules" at the bottom.

## Goal

A personal portfolio site with two kinds of content:

- **Projects**: things I'm working on or have finished
- **Blog posts**: write-ups on various topics, which can link to projects

Requirements:

- **Low/no cost.** Free tiers only. The only optional cost is a custom domain.
- **No code changes to add content.** I add projects and posts through a web admin UI. Saving commits to the repo and triggers a redeploy.
- **Interactive and fun.** Strong animations and moving elements, while the overall look stays clean.

## Stack (decided)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Astro** (latest) + TypeScript | Islands architecture: ship JS only where needed |
| CMS | **Keystatic** (`@keystatic/core`, `@keystatic/astro`) | Git-based. Content stored as Markdoc/MDX + YAML in the repo. Admin UI at `/keystatic` |
| CMS storage | `local` mode in dev, `github` mode in production | Prod editing via GitHub. Keystatic Cloud (free ≤3 users) or a self-configured GitHub App |
| UI islands | React (`@astrojs/react`) | Needed by the Keystatic admin and for interactive components |
| Animation | **GSAP** + ScrollTrigger + SplitText, **Lenis** smooth scroll, Astro View Transitions | GSAP is fully free including all plugins |
| 3D (optional, phase 4) | Three.js / React Three Fiber | Homepage hero only, lazy-loaded |
| Styling | Tailwind CSS with design tokens as CSS variables | Light and dark themes |
| Hosting | **Vercel Hobby** (fallback: Netlify or Cloudflare Pages) | Needs SSR for the Keystatic admin route, so GitHub Pages is **not** suitable |
| Analytics | Vercel Web Analytics (free tier) or Cloudflare Web Analytics | Add in phase 5 |

**Check current docs before installing.** Keystatic's Astro integration and Astro's output/adapter config change between versions. Follow the latest Astro + Keystatic guide for the correct `output` / adapter setup with `@astrojs/vercel`.

## Content model (Keystatic schemas)

### Collection: `projects` → `src/content/projects/`
- `title` (slug field)
- `status`: select: `in-progress` | `completed` | `archived`
- `summary`: text, 1–2 sentences, used on cards
- `tags`: array of text (tech stack)
- `cover`: image (store under `src/assets/projects/` so Astro's `<Image />` optimises it)
- `links`: object { `github`, `demo`, `other` } (optional URLs)
- `featured`: checkbox (shown on homepage)
- `startDate`, `endDate` (optional)
- `order`: integer (optional manual sort)
- `content`: rich text body (Markdoc or MDX)

### Collection: `posts` → `src/content/posts/`
- `title` (slug field)
- `publishedDate`: date
- `draft`: checkbox (drafts excluded from production build)
- `excerpt`: text
- `tags`: array of text
- `cover`: image (optional)
- `relatedProjects`: **multi-relationship** → `projects`
- `content`: rich text body

### Singletons
- `about`: bio, headshot, CV link, skills list, social links
- `settings`: site title, tagline, nav links, footer text

Mirror every schema in Astro Content Collections (`src/content.config.ts`) with Zod, and keep the two in sync.

**Derived behaviour:** project detail pages automatically list posts whose `relatedProjects` include that project. No manual back-linking.

## Pages / routes

- `/`: hero (signature animation), featured projects, latest 3 posts, short about blurb
- `/projects`: grid with tag/status filter (client-side island)
- `/projects/[slug]`: project detail + "Posts about this project"
- `/blog`: post list, filterable by tag
- `/blog/[slug]`: post with reading time, ToC, related projects
- `/about`
- `/rss.xml`
- `/keystatic`: CMS admin (also redirect `/admin` → `/keystatic`)
- `404`

Everything except the admin should be prerendered/static.

## Design & motion principles

- **One signature moment, restrained elsewhere.** The hero gets the big effect, for example an animated/3D scene, split-text reveal, or cursor-reactive background. Other pages use a consistent, small motion vocabulary: fade/slide reveals on scroll, staggered card entrances, smooth page transitions.
- Interactive touches: magnetic buttons, tilt or hover-reveal on project cards, animated nav underline, custom cursor (desktop only).
- Clean base: generous whitespace, 1–2 typefaces, a limited palette with one accent colour, strong type hierarchy.
- **Respect `prefers-reduced-motion`.** Disable or simplify all non-essential motion. The site must be fully usable without JS animation.
- Performance budget: Lighthouse ≥ 90 on all categories for `/` and a blog post on mobile. Lazy-load heavy animation/3D code only on pages that use it.
- Mobile-first and responsive. No horizontal scroll at 360px.

## Phases

### Phase 1: Foundations
- [ ] Scaffold Astro (TypeScript strict), add React, Tailwind, Keystatic, Vercel adapter
- [ ] Minimal Keystatic config with one test collection, local mode
- [ ] Confirm creating a post in `/keystatic` locally writes a file and the page renders
- [ ] Init git, push to a new GitHub repo, deploy to Vercel
- [ ] Switch production to GitHub storage mode; document the setup steps in `README.md` (env vars, GitHub App / Keystatic Cloud)
- **Done when:** I can create a post from the deployed `/keystatic`, it commits to GitHub, and it appears live after the redeploy.

### Phase 2: Content model & pages
- [ ] Implement all schemas above (Keystatic + Content Collections)
- [ ] Build all routes with plain, unstyled-but-tidy layouts
- [ ] Related-projects linking both ways
- [ ] Draft filtering, tag filtering, RSS, reading time
- [ ] Seed with 2 sample projects + 2 sample posts (clearly placeholder)
- **Done when:** every route renders from CMS content with no hard-coded content.

### Phase 3: Design system
- [ ] Design tokens (colour, type scale, spacing, radii) as CSS variables; light/dark theme toggle
- [ ] Core components: Nav, Footer, Button, Tag, ProjectCard, PostCard, SectionHeading, Prose (for rich text)
- [ ] Apply to all pages
- **Done when:** the site looks finished and clean *with no animation at all*.

### Phase 4: Motion
- [ ] Global: Lenis smooth scroll wired to GSAP ScrollTrigger, Astro View Transitions between pages
- [ ] Build every component in **Motion components (decided)** below. The hero is decided, so don't propose alternatives.
- [ ] Reduced-motion fallbacks for every component; clean up GSAP/WebGL on View Transition navigation (no leaks, duplicate triggers or orphaned animation loops)
- **Done when:** animations feel smooth at 60fps on a mid-range phone and Lighthouse is still ≥ 90.

## Motion components (decided)

Each is a self-contained component in `src/components/motion/`. Each must have a static fallback under `prefers-reduced-motion` or when JS fails.

### Hero
- **`LiquidShaderHero`**: full-bleed WebGL fragment shader behind the homepage hero text. Layered sine-distortion "liquid" with cosine-palette colour cycling. A soft highlight follows the cursor with eased lag (lerp ~0.06). Use raw WebGL (one fullscreen quad, no Three.js). Tint the palette to the site's accent colour via uniforms. Pause the render loop when off-screen (IntersectionObserver) or the tab is hidden. Cap device pixel ratio at 1.5–2. Fallback: static CSS gradient in the same colours. Hero text must stay readable (contrast overlay if needed).

### Scroll (GSAP ScrollTrigger)
- **`WordFill`**: intro line on the homepage. Words go from ~15% to 100% opacity, scrubbed to scroll position.
- **`RevealStagger`**: data-attribute driven (`data-reveal`, optional `data-reveal-delay`). Children fade and slide up ~30px with a stagger as they enter the viewport. Use it for featured project cards and anywhere else by default.
- **`PinnedHorizontalStrip`**: homepage "Selected work" section. The section pins and its project cards scroll sideways as the user scrolls down. Cards come from `featured` projects in the CMS. On mobile, fall back to a native horizontal swipe row.
- **`ScaleUpCover`**: project page cover image scales from ~0.6 to 1 and its corner radius shrinks as it scrolls into view.
- **`CountUpStats`**: optional stats block on project pages, numbers ease up from 0 once in view. Add an optional `stats` field to the `projects` schema (array of { label, value }).
- **`ReadingProgress`**: thin accent-coloured bar fixed to the top of blog posts, tracking scroll progress.

### Cards
- **`TiltCard`**: ProjectCard wrapper with 3D tilt following the cursor (±10–20° on rotateX/rotateY, `perspective` on the parent). Inner layers (cover/icon, title) use `translateZ` for depth/parallax. Eases back to flat on mouse leave. Desktop/pointer: fine only; no tilt on touch.

### Buttons and links
- **`MagneticButton`**: main calls to action ("View my work", "Get in touch"). The button drifts toward the cursor (~35% x, ~50% y) and springs back on leave.
- **`ArrowLink`**: project/blog links. The trailing arrow icon nudges right on hover.
- **`TextRollLink`**: nav links. The label rolls up and an identical copy rolls in from below.
- **`SubmitButton`** (contact form): label → spinner → check mark on success, then resets. Width locked during the transition so the layout doesn't jump.
- Easter egg (one only, optional): confetti burst on a hidden interaction.

### Diagrams
- **`PipelineDiagram`**: self-drawing SVG diagram for project pages and posts. Sequence when it scrolls into view: nodes pop in one by one (scale 0.7→1 with slight overshoot), each connector draws after its source node (stroke-dashoffset from `getTotalLength()` to 0), then animated dashed "data packets" flow along all connectors on a loop. Must be **replayable**: cancel any running animations and reset state before replaying. Use the Web Animations API or a GSAP timeline, not CSS class toggles. Add a Keystatic content component so I can insert one in a post or project from the CMS by entering nodes (label + colour) in order, with no code. Lay it out horizontally on desktop and vertically on mobile.

### Phase 5: Polish & launch
- [ ] SEO: meta tags, canonical URLs, sitemap, Open Graph images (auto-generated per post/project if feasible)
- [ ] Analytics (free tier)
- [ ] Accessibility pass: keyboard nav, focus states, alt text required in CMS image fields, colour contrast
- [ ] Lighthouse audit and fixes
- [ ] Custom domain (optional) and README "How to add content" section

## Working rules for Claude Code

- Work through all phases end to end without stopping for review. I'll review the finished site as a whole.
- At the end of each phase, verify it against its "Done when" criteria (run the build and dev server, check pages render, run Lighthouse where specified). Fix anything failing before moving on.
- Where a decision isn't covered here, make a sensible choice, note it in `DECISIONS.md` with a one-line reason, and keep going.
- When everything is done, write a summary in `REVIEW.md`: what was built, how to run it locally, the steps I need to do myself (e.g. GitHub App / Keystatic Cloud setup, Vercel env vars, domain), known issues, and what to look at first.
- Don't hard-code content that should live in the CMS.
- Keep dependencies minimal. If you need something not listed above, add it and record why in `DECISIONS.md`.
- Commit in small, logical steps with clear messages.
- If a doc or version mismatch blocks something (especially Keystatic + Astro adapter config), use the approach the current official docs recommend rather than hacking around it, and record it in `DECISIONS.md`.
- Only stop and ask me if you're truly blocked, for example when a step needs my accounts or credentials. Otherwise, stub that piece, note it in `REVIEW.md`, and carry on.
