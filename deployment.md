# Deploy sumit-pal-webapp — Learn-Mode Guide

> This guide takes you from local code to a live site on your own domain. Every phase explains the **why** before the **how**, so you understand the system you're building, not just the commands you're running.

---

## The Architecture You're Building

Before touching a single command, understand what you're creating:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LAPTOP                              │
│  code → git push → GitHub (sumitpal29/sumit-pal-webapp)     │
└───────────────────┬─────────────────────────────────────────┘
                    │ webhook on push to main
                    ▼
┌─────────────────────────────────────────────────────────────┐
│               GOOGLE CLOUD BUILD                            │
│  1. Pulls code from GitHub                                  │
│  2. Runs Dockerfile → produces a container image           │
│  3. Pushes image to Artifact Registry                       │
│  4. Tells Cloud Run: "deploy this new image"                │
└───────────────────┬─────────────────────────────────────────┘
                    │ deploys
                    ▼
┌─────────────────────────────────────────────────────────────┐
│               ARTIFACT REGISTRY                             │
│  (private Docker image storage — your built app lives here) │
└───────────────────┬─────────────────────────────────────────┘
                    │ image pulled on deploy
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  CLOUD RUN                                  │
│  Runs your container. Scales to zero when idle.             │
│  URL: sumit-pal-webapp-xxxx.run.app                         │
│  Custom domain: sumitpal.in ←── DNS mapped here             │
└───────────────────┬─────────────────────────────────────────┘
                    │ request arrives
                    ▼
              🌍 sumitpal.in
```

Every phase below adds one box to this diagram. By the end, pushing to `main` will deploy your site and it'll be live at your domain in under 5 minutes.

---

## Phase 0: Prerequisites Check

🧠 **What you're doing**: Making sure you have the right tools before starting. Skipping this phase is why most deployments fail midway.

### Tools to install

```bash
# 1. Google Cloud CLI (gcloud)
# Mac:
brew install google-cloud-sdk

# Verify:
gcloud version
```

```bash
# 2. Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/
# Verify:
docker --version
```

### Authenticate with Google Cloud

```bash
gcloud auth login
# Opens a browser. Sign in with your Google account.

gcloud auth application-default login
# This second login is for local tools (like Docker) to talk to GCP APIs.
```

🧠 **Why two logins?** The first sets your identity for `gcloud` commands. The second creates credentials that Docker and other local tools use when they call Google's APIs. They're separate because Google Cloud distinguishes between "you as a human" and "your computer as a service client."

---

## Phase 1: Understand What You're Packaging

🧠 **The container mental model**: A container is a box that holds your app and *everything it needs to run* — the exact Node.js version, the right npm packages, the compiled build output. When you ship this box to Cloud Run, it runs identically to how it ran when you built it. No "works on my machine" problems.

Your `Dockerfile` (already in the repo) builds this box in three stages:

```
Stage 1: deps
  └── Install npm packages (node_modules)
      (we do this separately so Docker can cache it — if package.json
       doesn't change, this stage is skipped on every rebuild)

Stage 2: builder
  └── Copy deps + source code → run `yarn build`
      Produces: .next/standalone/ (self-contained server)
                .next/static/     (CSS, JS, images)

Stage 3: runner
  └── Copy ONLY the build output (not node_modules, not source)
      Final image is ~100MB instead of ~800MB
```

🧠 **Why `output: 'standalone'`?** This is what you added to `next.config.mjs`. It tells Next.js to produce a single `server.js` file with all required code bundled in. Without it, your container would need the full `node_modules` directory (hundreds of MB) at runtime. Standalone mode traces your actual import graph and includes only what's used.

### Test your container locally

Before deploying anywhere, make sure the container actually works:

```bash
# Build the image locally
docker build -t sumit-pal-webapp:local .

# Run it
docker run -p 3000:3000 sumit-pal-webapp:local

# Open http://localhost:3000 and verify your site loads
```

✅ **Verify**: All pages work, especially `/blogs/[slug]` and `/experience/[company]` (dynamic routes). If these work locally in Docker, they'll work on Cloud Run.

---

## Phase 2: Google Cloud Project Setup

🧠 **The GCP mental model**: Google Cloud organizes everything under a **Project**. A project is the billing boundary, the permission boundary, and the namespace for all your services. Every Cloud Run service, every Docker image, every build log — all attached to a single project.

### Create a project (if you haven't)

```bash
# Create it
gcloud projects create sumit-pal-webapp-2026 --name="Sumit Pal Webapp"

# Set it as the active project for all future commands
gcloud config set project sumit-pal-webapp-2026
```

### Enable billing

Go to: https://console.cloud.google.com/billing → link a billing account to your project.

🧠 **Will you be charged?** Almost certainly not. Cloud Run has a free tier of 2 million requests/month and 360,000 vCPU-seconds/month. A personal portfolio with ~1,000 visits/month will cost $0. You need billing enabled because GCP won't let you use most services without it, even if you never exceed the free tier.

### Enable the three APIs you need

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

🧠 **Why "enable APIs"?** GCP has hundreds of services. Each one is a separate API that you turn on per-project. This prevents accidental usage and keeps the surface area of your project small.

✅ **Verify**:
```bash
gcloud services list --enabled | grep -E "run|cloudbuild|artifactregistry"
# Should show all three
```

---

## Phase 3: Artifact Registry (Your Image Storage)

🧠 **The registry mental model**: When you run `docker build`, the resulting image lives on your laptop. Cloud Run can't reach your laptop. Artifact Registry is Google Cloud's private Docker registry — like Docker Hub, but private and inside your GCP project. Cloud Run and Cloud Build both have native access to it.

```bash
gcloud artifacts repositories create webapp \
  --repository-format=docker \
  --location=asia-south1 \
  --description="sumit-pal-webapp container images"
```

🧠 **Why `asia-south1` (Mumbai)?** Your users are likely in India. Traffic between Cloud Run and Artifact Registry is free within the same region. Running the registry in the same region as Cloud Run means:
- Faster image pulls on deploy (lower cold start time)
- Zero data transfer cost

If your users are global, `us-central1` is the most common default.

### Give Docker permission to push to this registry

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

This writes credentials to your Docker config so `docker push` can authenticate with Google's registry.

✅ **Verify**:
```bash
gcloud artifacts repositories list
# Should show "webapp" in asia-south1
```

---

## Phase 4: First Manual Deploy

🧠 **Why manual first?** Automation (CI/CD) should always be set up on top of a working manual process. If something fails in CI/CD, you want to know whether it's a CI/CD problem or an app problem. Doing one manual deploy first gives you a known-good baseline.

### Set your environment variables once

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-south1
export IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/webapp/sumit-pal-webapp
```

### Build and push the image

```bash
# Build (uses your local Dockerfile)
docker build -t $IMAGE:latest .

# Push to Artifact Registry
docker push $IMAGE:latest
```

🧠 **What just happened?** Docker built a container image on your laptop using the three-stage Dockerfile, then uploaded it to your Artifact Registry. Cloud Run will pull it from there.

### Deploy to Cloud Run

```bash
gcloud run deploy sumit-pal-webapp \
  --image=$IMAGE:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5 \
  --set-env-vars="NEXT_PUBLIC_SITE_URL=https://sumitpal.in"
```

🧠 **What each flag means**:
- `--allow-unauthenticated` — public website, no API key needed to visit
- `--port=3000` — tells Cloud Run where your server listens (matches `EXPOSE 3000` in Dockerfile)
- `--min-instances=0` — scale to zero when no traffic (free tier, no idle cost)
- `--max-instances=5` — safety cap so a traffic spike can't generate a huge bill
- `--memory=512Mi` — Next.js needs ~300MB; 512 gives headroom

After deploy, you'll get a URL like:
```
https://sumit-pal-webapp-abc123-el.a.run.app
```

✅ **Verify**: Open that URL. Click through every page. If your dynamic routes (`/blogs/slug`, `/experience/company`) work, the app is healthy.

---

## Phase 5: CI/CD — Auto-Deploy on Git Push

🧠 **Why CI/CD?** Right now, deploying requires you to run 3 commands manually. CI/CD means "every time I push to `main`, the system does those 3 commands for me automatically." The `cloudbuild.yaml` file (already in the repo) defines this pipeline.

```
git push → GitHub webhook → Cloud Build → Artifact Registry → Cloud Run
```

🧠 **How Cloud Build works**: It's a managed build runner on GCP. When triggered, it:
1. Checks out your code at that commit
2. Runs each step in `cloudbuild.yaml` in sequence
3. Logs everything to Cloud Logging

### Connect Cloud Build to GitHub

1. Go to [Cloud Build → Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **Connect Repository**
3. Source: **GitHub (Cloud Build GitHub App)** — install the app if prompted
4. Select your repo: `sumitpal29/sumit-pal-webapp-2026`
5. Click **Create a Trigger** with:
   - **Name**: `deploy-on-push-to-main`
   - **Event**: Push to a branch
   - **Branch**: `^main$` (regex — exactly "main")
   - **Build configuration**: `cloudbuild.yaml` (autodetected)

### Grant Cloud Build permission to deploy to Cloud Run

Cloud Build runs as a service account. That account needs permission to push to Artifact Registry and deploy to Cloud Run:

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Allow Cloud Build to deploy to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Allow Cloud Build to use Artifact Registry
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Allow Cloud Run to pull images from Artifact Registry
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.reader"
```

🧠 **Why so many IAM roles?** GCP uses the principle of least privilege — every service account starts with no permissions. You grant exactly what's needed:
- Cloud Build needs to *write* images and *deploy* services
- Cloud Run's runtime account needs to *read* images

### Test the pipeline

```bash
git add cloudbuild.yaml Dockerfile .dockerignore next.config.mjs
git commit -m "chore: add Cloud Run deployment pipeline"
git push origin main
```

Go to [Cloud Build → History](https://console.cloud.google.com/cloud-build/builds). You should see a build start within seconds.

✅ **Verify**: Build completes green. Cloud Run shows a new revision. Your `*.run.app` URL still works.

---

## Phase 6: Custom Domain

🧠 **The DNS mental model**: When someone types `sumitpal.in`, their browser asks the global DNS system "what IP address is this?" DNS is like the phonebook of the internet. You need to add a record that says "sumitpal.in → this Cloud Run service."

Cloud Run has two ways to do this:

| Method | Cost | Complexity | When to use |
|--------|------|------------|-------------|
| **Cloud Run domain mapping** | Free | 5 min | Always (personal sites) |
| Cloud Load Balancer + NEG | ~$18/month | 1-2 hours | Multi-backend, CDN, WAF |

You want Option A.

### Step 1: Verify your domain ownership with Google

🧠 **Why verify?** Google won't let you map a domain to their infrastructure unless you prove you own it. This prevents domain squatting on Google's network.

```bash
gcloud run domain-mappings create \
  --service=sumit-pal-webapp \
  --domain=sumitpal.in \
  --region=$REGION
```

This command will output DNS records you need to add. Something like:

```
Please add the following DNS records to your domain:

NAME         TYPE   DATA
sumitpal.in  A      216.239.32.21
sumitpal.in  A      216.239.34.21
sumitpal.in  A      216.239.36.21
sumitpal.in  A      216.239.38.21
sumitpal.in  AAAA   2001:4860:4802:32::15
sumitpal.in  AAAA   2001:4860:4802:34::15
sumitpal.in  AAAA   2001:4860:4802:36::15
sumitpal.in  AAAA   2001:4860:4802:38::15
```

🧠 **Why multiple A records?** Cloud Run is load-balanced across multiple Google data centers. The multiple IPs provide redundancy — if one goes down, DNS resolves to another.

🧠 **What's AAAA?** IPv6. Modern clients prefer IPv6 when available. Adding both A (IPv4) and AAAA (IPv6) records means all clients work regardless of their network.

### Step 2: Add DNS records at your registrar

Where you bought `sumitpal.in` (GoDaddy, Google Domains, Namecheap, Cloudflare, etc.):

1. Go to the DNS management page for your domain
2. Delete any existing A records pointing to a parking page
3. Add all the A records from the output above
4. Add all the AAAA records from the output above

DNS propagation takes **a few minutes to 48 hours**. In practice for a new domain with no existing records, usually under 15 minutes.

Check propagation:
```bash
dig sumitpal.in A
# Should show the Google IPs above
```

Or use https://dnschecker.org — paste `sumitpal.in` and verify A records propagate globally.

### Step 3: www subdomain

Handle `www.sumitpal.in` → redirect to `sumitpal.in`:

```bash
gcloud run domain-mappings create \
  --service=sumit-pal-webapp \
  --domain=www.sumitpal.in \
  --region=$REGION
```

Add a CNAME record at your registrar:
```
www   CNAME   ghs.googlehosted.com.
```

### Step 4: TLS (HTTPS) — automatic

🧠 **Why HTTPS matters**: Without TLS, traffic between your user's browser and your server is unencrypted. Anyone on the same network can read it. Google penalizes non-HTTPS sites in search rankings. Cloud Run provisions a TLS certificate automatically via Google-managed certificates — you don't configure anything.

Certificate provisioning happens within minutes of DNS propagating. Watch its status:

```bash
gcloud run domain-mappings describe sumitpal.in --region=$REGION
# Look for: certificateStatus: ACTIVE
```

✅ **Verify**: Open `https://sumitpal.in`. The padlock icon should be green. Run:
```bash
curl -I https://sumitpal.in
# HTTP/2 200 — success
```

---

## Phase 7: Environment Variables and Secrets

🧠 **The rule**: Never put secrets in your Docker image. Images are stored in a registry and can be shared, inspected, or leaked. Secrets go in Cloud Run's runtime environment, injected at deploy time.

### Non-sensitive config (env vars)

```bash
gcloud run services update sumit-pal-webapp \
  --region=$REGION \
  --set-env-vars="NEXT_PUBLIC_SITE_URL=https://sumitpal.in"
```

### Sensitive values (Secret Manager)

If you ever add a GitHub token, API key, or database password:

```bash
# Store the secret
echo -n "your-secret-value" | \
  gcloud secrets create GITHUB_TOKEN --data-file=-

# Grant Cloud Run's identity access to read it
gcloud secrets add-iam-policy-binding GITHUB_TOKEN \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Mount it in Cloud Run
gcloud run services update sumit-pal-webapp \
  --region=$REGION \
  --set-secrets="GITHUB_TOKEN=GITHUB_TOKEN:latest"
```

🧠 **Why Secret Manager?** Env vars in Cloud Run are visible in the console to anyone with project access. Secret Manager adds access control, audit logging, and versioning. For a GitHub token that only reads public repos (your CMS content repo is public), an env var is fine. For anything with write access, use Secret Manager.

---

## Phase 8: Monitoring and Observability

### View logs in real time

```bash
gcloud run services logs read sumit-pal-webapp \
  --region=$REGION \
  --limit=50
```

Or in the console: Cloud Run → sumit-pal-webapp → Logs tab.

### Useful operational commands

```bash
# List all revisions (one per deploy)
gcloud run revisions list --service=sumit-pal-webapp --region=$REGION

# Roll back to a previous revision
gcloud run services update-traffic sumit-pal-webapp \
  --region=$REGION \
  --to-revisions=sumit-pal-webapp-00002-abc=100

# Describe the service (current image, env vars, scaling config)
gcloud run services describe sumit-pal-webapp --region=$REGION
```

### Cold starts

🧠 **What's a cold start?** Cloud Run scales to zero — when no requests come in for ~15 minutes, your container shuts down. The next request has to start a new container (~1-2 seconds) before it can respond. This is imperceptible for a portfolio site where the first visitor in a while waits 1-2 extra seconds.

If cold starts bother you, set `--min-instances=1` (costs ~$5/month for 1 always-on instance, or stays free if traffic keeps the instance warm).

---

## Full Pipeline Diagram

```
Developer (you)
     │
     │  git push origin main
     ▼
┌─────────────┐
│   GitHub    │  Webhook triggered on push
│  main branch│─────────────────────────────────────┐
└─────────────┘                                     │
                                                    ▼
                                        ┌─────────────────────┐
                                        │    Cloud Build      │
                                        │                     │
                                        │  Step 1: docker     │
                                        │    build -t img:SHA │
                                        │                     │
                                        │  Step 2: docker     │
                                        │    push img:SHA     │
                                        │                     │
                                        │  Step 3: gcloud run │
                                        │    deploy --image   │
                                        │    img:SHA          │
                                        └──────┬──────────────┘
                                               │
                              ┌────────────────┴───────────────┐
                              │                                 │
                              ▼                                 ▼
                  ┌─────────────────────┐         ┌──────────────────────┐
                  │  Artifact Registry  │         │      Cloud Run        │
                  │  webapp/            │◄────────│  pulls image on       │
                  │  sumit-pal-webapp:  │         │  new revision deploy   │
                  │    SHA              │         │                        │
                  │    latest           │         │  min: 0 instances      │
                  └─────────────────────┘         │  max: 5 instances      │
                                                  │  port: 3000            │
                                                  └──────────┬─────────────┘
                                                             │
                                                             │ HTTPS
                                                             ▼
                                                     ┌──────────────┐
                                                     │  sumitpal.in  │
                                                     │  (DNS A rec.) │
                                                     │  TLS: auto    │
                                                     └──────────────┘
```

---

## Cost Summary

| Service | Free Tier | Your Usage | Monthly Cost |
|---------|-----------|------------|--------------|
| Cloud Run | 2M req, 360K vCPU-sec | ~50K req, low CPU | **$0** |
| Artifact Registry | 0.5 GB | ~0.5 GB images | **$0** |
| Cloud Build | 120 min/day | ~5 min/deploy | **$0** |
| Domain mapping | Free | — | **$0** |
| Secret Manager | 6 secrets free | 0-1 secrets | **$0** |
| **Total** | | | **$0/month** |

The only scenario where you'd pay: adding a Cloud Load Balancer (~$18/month) for CDN or WAF, or setting `--min-instances=1` (~$5/month) to eliminate cold starts.

---

## Quick Reference

```bash
# Variables (set these in your shell session)
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-south1
export SERVICE=sumit-pal-webapp
export IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/webapp/$SERVICE

# Manual deploy (if CI/CD fails)
docker build -t $IMAGE:latest . && docker push $IMAGE:latest
gcloud run deploy $SERVICE --image=$IMAGE:latest --region=$REGION --platform=managed

# View logs
gcloud run services logs read $SERVICE --region=$REGION --limit=50

# Roll back
gcloud run services update-traffic $SERVICE --region=$REGION \
  --to-revisions=REVISION_NAME=100

# Check domain mapping status
gcloud run domain-mappings describe sumitpal.in --region=$REGION

# Check DNS propagation
dig sumitpal.in A
```
