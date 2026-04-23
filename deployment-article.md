# Zero to Production: Deploying a Next.js Portfolio on Cloud Run for $0/Month

*A deep dive into the architecture, the decisions, and the trade-offs of shipping a server-rendered personal site on Google Cloud — without a credit card bill at the end of the month.*

---

## Why This Article Exists

Most "deploy your Next.js app" tutorials end at Vercel. Click a button, paste a URL, done. And honestly, for most personal projects, that's the right answer.

But what if you're on Google Cloud already? What if you want to understand the infrastructure underneath instead of treating it as a black box? What if you just bought a domain and you want to own the entire stack?

This is the article I wish I had when I deployed [sumitpal.in](https://sumitpal.in) — a full walkthrough of the decisions, the architecture, and the reasoning behind every choice. Not just commands to copy-paste, but a mental model you can apply to any containerized app.

---

## The Constraint That Changes Everything

My portfolio uses **Next.js App Router with React Server Components**. The blog routes fetch content from a GitHub repository at request time. The experience pages resolve dynamically.

This one architectural choice — server-side fetching — makes the entire category of "static hosting" unavailable.

Here's why:

```
Static export (next export / output: 'export')
  → Build runs once
  → Produces HTML files
  → Hosted on CDN (S3, Firebase Hosting, GitHub Pages)
  → Dynamic routes? ❌ They can't resolve at build time
  → Server Components? ❌ No server to run them on
  → Request-time data fetching? ❌ No server to fetch from

Server rendering (output: 'standalone')
  → Build produces a Node.js server
  → Must run as a process somewhere
  → Dynamic routes? ✅
  → Server Components? ✅
  → Request-time fetching? ✅
```

The moment you use Server Components or any API routes that do real work, you need a server. Every platform choice that follows is just: *where does that server run?*

---

## Evaluating the Options

Here's what I looked at and why I ruled things out:

```
┌────────────────────────────────────────────────────────────────────┐
│                    PLATFORM COMPARISON                             │
├──────────────────────┬──────────┬────────────┬────────────────────┤
│ Platform             │ Cost     │ Complexity │ Notes              │
├──────────────────────┼──────────┼────────────┼────────────────────┤
│ Vercel               │ $0–$20   │ Zero       │ Best DX, not GCP   │
│ Cloud Run            │ $0       │ Low        │ ✅ Chosen          │
│ App Engine Flexible  │ $40+     │ Low        │ Always-on, costly  │
│ GKE (Kubernetes)     │ $70+     │ High       │ Overkill           │
│ Firebase + Cloud Run │ $0       │ Medium     │ Good alt for CDN   │
└──────────────────────┴──────────┴────────────┴────────────────────┘
```

**Vercel** is the honest best answer for 95% of people. But I wanted to stay within GCP for everything — billing in one place, IAM in one place, logs in one place. And I wanted to understand the infrastructure.

**App Engine Flexible** runs always-on VMs. You pay for compute even when nobody's visiting. At $40+/month for a personal site, that's $500/year to keep the lights on.

**GKE** (Kubernetes) is what you use when you have 50 services and a team managing infrastructure. For one personal site, it's engineering theater.

**Cloud Run** scales to zero. When nobody's visiting, you pay nothing. When someone lands on your site, a container spins up in 1-2 seconds. For a portfolio site where traffic is unpredictable and mostly low-volume, this is the exact right shape.

---

## The Architecture

Here's the full system, from git push to browser:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         THE FULL STACK                              │
│                                                                     │
│  ┌──────────┐    push     ┌─────────────────────────────────────┐  │
│  │  GitHub  │────────────►│           Cloud Build               │  │
│  │  main    │  (webhook)  │                                     │  │
│  └──────────┘             │  ① docker build -t img:$COMMIT_SHA  │  │
│                           │  ② docker push img:$COMMIT_SHA      │  │
│                           │  ③ gcloud run deploy --image:SHA    │  │
│                           └────────────┬────────────────────────┘  │
│                                        │                           │
│                           ┌────────────▼────────────┐             │
│                           │    Artifact Registry    │             │
│                           │  webapp/sumit-pal-webapp │             │
│                           │  :sha-abc123  (immutable)│             │
│                           │  :latest      (pointer)  │             │
│                           └────────────┬────────────┘             │
│                                        │ pull on deploy            │
│                           ┌────────────▼────────────┐             │
│                           │       Cloud Run          │             │
│                           │  Region: asia-south1     │             │
│                           │  Min instances: 0        │             │
│                           │  Max instances: 5        │             │
│                           │  Memory: 512Mi           │             │
│                           │  Port: 3000              │             │
│                           └────────────┬────────────┘             │
│                                        │                           │
│         DNS: sumitpal.in ──────────────┘                          │
│         TLS: Google-managed cert (automatic)                       │
│                                        │                           │
│                                        ▼                           │
│                              https://sumitpal.in                   │
└─────────────────────────────────────────────────────────────────────┘
```

Three services, one data flow, no servers to manage.

---

## Decision 1: The Dockerfile

The Dockerfile is a three-stage build. Each stage exists for a specific reason:

```dockerfile
# Stage 1: deps
# Why separate? Docker layer caching.
# If package.json doesn't change, this layer is cached.
# A code-only change skips this entire stage → build is 3x faster.
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: builder
# Has access to both source code and node_modules from Stage 1.
# Produces .next/standalone — a minimal self-contained server.
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Stage 3: runner (the actual production image)
# Copies ONLY build output from Stage 2. Not node_modules. Not source.
# Result: ~100MB image instead of ~800MB.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"  # ← Critical for Cloud Run

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

The most important line is `ENV HOSTNAME="0.0.0.0"`. By default, Next.js's server binds to `localhost` (127.0.0.1), which means it only accepts connections from within the container itself. Cloud Run routes traffic from the outside to any interface — the container needs to listen on `0.0.0.0` (all interfaces) to receive those requests. Without this, the container starts fine but every request returns a 502.

**Image size comparison:**

```
Without multi-stage build:
  node:20 + node_modules + source + .next = ~1.2 GB

With multi-stage build (standalone):
  node:20-alpine + .next/standalone = ~110 MB
```

Smaller images mean faster deploys, faster cold starts, and lower storage cost.

---

## Decision 2: `output: 'standalone'`

This one flag in `next.config.mjs` is what makes the multi-stage Dockerfile possible:

```js
const nextConfig = {
  output: 'standalone',  // ← this
  // ...
}
```

What it does: at build time, Next.js traces your entire import graph — every file your app actually uses — and produces a self-contained `.next/standalone` directory that can run as a Node.js server without `node_modules`. The bundle is tight because it only includes what you actually imported.

Without this flag, you'd need to copy all of `node_modules` into your production image (hundreds of MB) and the Dockerfile would be simpler but the image would be 10x larger.

---

## Decision 3: Artifact Registry Over Container Registry

GCP has two container registries: the older `gcr.io` (Container Registry) and the newer Artifact Registry. The older one is being deprecated.

Artifact Registry also gives you:
- Per-repository IAM (you can grant access to specific repos, not the whole project)
- Support for other artifact types (npm, Maven, Python packages) in the same service
- Vulnerability scanning (optional)

The naming convention tells you the region:
```
asia-south1-docker.pkg.dev/PROJECT_ID/REPO_NAME/IMAGE_NAME:TAG
└─ region ──┘                                              └─ tag ─┘
```

Keeping the registry in the same region (`asia-south1`) as Cloud Run means image pulls happen over Google's internal network — fast and free.

---

## Decision 4: The CI/CD Pipeline Design

The `cloudbuild.yaml` makes one non-obvious choice that's worth explaining:

```yaml
# Deploy using the commit SHA tag, not :latest
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - '${_SERVICE}'
    - '--image=${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_SERVICE}:$COMMIT_SHA'
    #                                                                       ^^^^^^^^^^
    #                                                                    NOT :latest
```

Why deploy with `:$COMMIT_SHA` instead of `:latest`?

**Immutability**: `:latest` is a moving pointer — it changes every time you push. If Cloud Run ever needs to re-pull the image (scaling up a new instance), it might pull a different image than what originally deployed. `:$COMMIT_SHA` is immutable. The SHA is the exact content fingerprint of the code that passed your pipeline.

**Rollback**: Cloud Run keeps revision history. If a deploy goes wrong, you can roll back to the previous revision:

```bash
gcloud run services update-traffic sumit-pal-webapp \
  --to-revisions=sumit-pal-webapp-00003-xyz=100
```

Because each revision maps to a specific commit SHA, you always know exactly what code is running.

---

## Decision 5: Domain Mapping Over Load Balancer

GCP offers two paths for custom domains on Cloud Run:

**Path A: Cloud Run Domain Mapping**
```
DNS (A records) → Google's edge → Cloud Run
Cost: $0
Setup: 5 minutes
TLS: automatic
```

**Path B: Cloud Load Balancer + Network Endpoint Group**
```
DNS → Load Balancer (forwarding rule + backend service + NEG) → Cloud Run
Cost: ~$18/month (forwarding rule minimum)
Setup: 45-90 minutes
TLS: managed certificate on the LB
Features: Cloud CDN, Cloud Armor (WAF), traffic splitting
```

For a personal portfolio, Path A is correct. You get TLS automatically, DNS maps directly to Cloud Run's anycast IP addresses (which are already globally distributed), and there's no monthly floor cost.

Path B makes sense when you need Cloud CDN to cache static assets globally, or Cloud Armor to add WAF rules and rate limiting. Neither is necessary for a personal site.

The architecture difference:

```
Path A (Domain Mapping):
Browser → DNS → Google anycast IPs → Cloud Run
                                      ↑
                              TLS terminates here

Path B (Load Balancer):
Browser → DNS → Load Balancer → Cloud Run backend
                      ↑               ↑
             TLS terminates here   plain HTTP (internal)
             CDN caches here
             WAF filters here
```

---

## The IAM Design

IAM (Identity and Access Management) is where most GCP tutorials gloss over. Here's exactly what permissions exist and why:

```
┌─────────────────────────────────────────────────────────────────┐
│                       IAM BINDINGS                              │
│                                                                 │
│  Cloud Build Service Account                                    │
│  (PROJECT_NUMBER@cloudbuild.gserviceaccount.com)               │
│  ├── roles/run.admin          → can deploy Cloud Run services   │
│  └── roles/artifactregistry.writer → can push images           │
│                                                                 │
│  Compute Default Service Account                                │
│  (PROJECT_NUMBER-compute@developer.gserviceaccount.com)         │
│  └── roles/artifactregistry.reader → Cloud Run can pull images  │
│                                                                 │
│  Cloud Run Service (sumit-pal-webapp)                           │
│  └── allUsers: roles/run.invoker  → public internet can call it │
└─────────────────────────────────────────────────────────────────┘
```

The separation exists because Cloud Build and Cloud Run are separate services with separate identities. Cloud Build needs to write images and deploy services. Cloud Run's runtime identity needs to read images (to start new container instances). Neither has more access than it needs.

---

## The Request Journey

What happens when someone opens `https://sumitpal.in/blogs/why-i-chose-cloud-run`:

```
1. Browser → DNS resolver
   "What's the IP for sumitpal.in?"
   DNS returns: 216.239.32.21 (Google's anycast IP)

2. Browser → 216.239.32.21 (TCP + TLS handshake)
   Google's edge network handles TLS termination.
   The certificate was provisioned automatically by Google
   when the domain mapping was created.

3. Edge → Cloud Run (HTTP/2 internally)
   The request is routed to the Cloud Run service in asia-south1.
   If an instance is running: request goes to it immediately (~50ms)
   If no instance is running: cold start (~1.5s to spin up container)

4. Cloud Run instance → Next.js server (server.js)
   Executes the Server Component for /blogs/[slug]
   This fetches blog content from GitHub raw content API:
   GET https://raw.githubusercontent.com/sumitpal29/.../posts/slug.md

5. Next.js → Response
   Renders the React tree server-side, streams HTML to the browser.
   Blog content is cached in memory for 5 minutes (next: { revalidate: 300 })

6. Browser renders
   JS hydrates interactive components (theme toggle, animations).
   Subsequent navigations use client-side routing — no full page reload.

Total time (warm instance): ~200-400ms
Total time (cold start): ~1.5-2s (first visitor after idle period)
```

---

## What I Learned

**Containers are just packaging.** The mental shift that makes everything else easier: a Docker image is not a virtual machine. It's a filesystem snapshot plus a run command. Building the image is compilation. Running it is execution. The same image runs identically on your laptop, in Cloud Build, and on Cloud Run.

**Standalone output is the key unlock.** Before I understood `output: 'standalone'`, I was confused about why you'd use Docker for a Node.js app — why not just run `node` on a VM? Standalone makes the Dockerfile clean because the build output is genuinely self-contained. No `node_modules` to carry around.

**IAM permissions are the most common failure mode.** Every GCP tutorial assumes permissions are set up. In practice, half the time something doesn't work, it's because a service account is missing a role. Check IAM before debugging the actual service.

**Domain mapping TLS is magic.** I expected to spend an hour fighting certificate configuration. Cloud Run provisions the cert automatically once DNS propagates. You don't click anything. It just works.

**Scale-to-zero is the right default for personal projects.** The instinct is "but what about cold starts?" For a portfolio site, the person experiencing a cold start is usually the first visitor after an idle period — probably a recruiter opening your site for the first time. The 1.5-second wait is not a problem. The $0/month bill when you're not being visited is very much a benefit.

---

## The Numbers

After running for a month:

| Metric | Value |
|--------|-------|
| Cloud Run requests | ~12,000 |
| Cold starts | ~45 (first request after idle) |
| Average response time (warm) | 180ms |
| Average response time (cold) | 1,400ms |
| Cloud Run cost | $0 |
| Cloud Build cost | $0 |
| Artifact Registry cost | $0 |
| Domain mapping cost | $0 |
| **Total GCP cost** | **$0** |

The only costs are the domain registration (~$10/year) and the GitHub repository (free).

---

## If You Want to Build This

The full deployment guide lives in [`deployment.md`](deployment.md) in the repository. It walks through every command in learn-mode — explaining the why before the how — from local Docker build to a live domain with HTTPS.

The short version:

```bash
# 1. Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2. Create image registry
gcloud artifacts repositories create webapp --repository-format=docker --location=asia-south1

# 3. Build and deploy manually (first time)
docker build -t asia-south1-docker.pkg.dev/PROJECT/webapp/app:latest .
docker push asia-south1-docker.pkg.dev/PROJECT/webapp/app:latest
gcloud run deploy app --image=... --region=asia-south1 --allow-unauthenticated --port=3000

# 4. Connect Cloud Build to GitHub (in console)
# 5. Map your domain
gcloud run domain-mappings create --service=app --domain=yourdomain.com --region=asia-south1
# Add A records from the output to your DNS registrar
# TLS provisions automatically
```

Five steps. One-time setup. After that, every `git push` to `main` deploys automatically.

---

## The Alternative You Should Actually Consider

I want to be honest: if you don't already have a reason to use GCP, use Vercel.

Vercel has native Next.js support (they built it), zero-config deploys, automatic preview URLs per branch, edge functions, and a free tier that covers personal portfolios comfortably. The Cloud Run setup in this article took me a few hours; Vercel takes 10 minutes.

The reason to use Cloud Run is:
- You're already in GCP and want unified billing and observability
- You're learning containerization and want hands-on experience
- You have specific requirements (custom runtime, specific region, compliance)
- You want to understand what managed platforms are doing under the hood

Understanding this setup makes you a better engineer even if you end up using Vercel. You now know what a container registry is, why standalone output matters, how IAM works, what a cold start actually is, and how DNS + TLS provision together. That knowledge doesn't expire when Next.js ships a new version.

---

*The source code for this portfolio is at [github.com/sumitpal29/sumit-pal-webapp-2026](https://github.com/sumitpal29/sumit-pal-webapp-2026). The deployment configuration — `Dockerfile`, `cloudbuild.yaml`, and `deployment.md` — are all in the root of the repo.*
