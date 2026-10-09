# Production Deployment & Hosting Guide

This document details the production build pipeline, hosting environments, containerization options, and release procedures for **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Deployment Targets](#deployment-targets)
- [Production Build Pipeline](#production-build-pipeline)
- [Option 1: Firebase Hosting (Recommended)](#option-1-firebase-hosting-recommended)
- [Option 2: Google Cloud Run & Docker](#option-2-google-cloud-run--docker)
- [Option 3: Modern Static Edge Hosting (Vercel / Netlify / Cloudflare)](#option-3-modern-static-edge-hosting-vercel--netlify--cloudflare)
- [Domain, SSL & Thermal Printer Setup](#domain-ssl--thermal-printer-setup)
- [Post-Deployment Verification Checklist](#post-deployment-verification-checklist)
- [Rollback Strategy & Data Safeguards](#rollback-strategy--data-safeguards)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Deployment Targets

Because SMARTBIZ CALCULATOR is compiled into an optimized static single-page application (SPA), it can be deployed to any modern web hosting service:

| Hosting Target | Best For | Prerequisites |
|---|---|---|
| **Firebase Hosting** | Integrated cloud backend, Firestore, and Cloud Functions | Google Cloud / Firebase CLI |
| **Google Cloud Run** | Containerized enterprise deployments with Node.js proxy | Dockerfile, GCP Project |
| **Vercel / Netlify** | Rapid continuous deployment via Git branches | GitHub / GitLab repository |
| **Cloudflare Pages** | Global edge distribution with zero-cold-start delivery | Cloudflare Account |

---

## Production Build Pipeline

To compile the application for production:

```bash
# 1. Clean previous builds
npm run clean

# 2. Type-check all TypeScript files
npm run lint

# 3. Generate production bundle
npm run build
```

### Build Artifacts:
The Vite bundler generates minified, tree-shaken assets inside the `/dist` directory:
- `dist/index.html`: Entry HTML document with injected hashes.
- `dist/assets/index-[hash].js`: Minified production JavaScript bundle.
- `dist/assets/index-[hash].css`: Minified Tailwind CSS styles and print media rules.

### Local Verification:
Preview the compiled build before pushing to production:

```bash
npm run preview
```

---

## Option 1: Firebase Hosting (Recommended)

Firebase Hosting provides global CDN caching, SSL certificates, and direct integration with Firebase Authentication and Firestore.

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Configuration (`firebase.json`)
Create `firebase.json` in the project root:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

### 3. Deploy to Firebase
```bash
npm run build
firebase deploy --only hosting
```

---

## Option 2: Google Cloud Run & Docker

For containerized cloud deployments:

### 1. Dockerfile
Create a multi-stage `Dockerfile`:

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Server Stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### 2. Build & Deploy via Google Cloud CLI
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/smartbiz-pos
gcloud run deploy smartbiz-pos \
  --image gcr.io/[PROJECT_ID]/smartbiz-pos \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000
```

---

## Option 3: Modern Static Edge Hosting (Vercel / Netlify / Cloudflare)

### Build Configuration:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `20.x`

### SPA Routing Rule:
Ensure all routes rewrite to `/index.html` to support client-side tab navigation.

---

## Domain, SSL & Thermal Printer Setup

1. **Custom Domain**: Bind your store's custom domain (e.g., `pos.almadinastore.com`) via your DNS provider using `CNAME` or `A` records.
2. **Enforce HTTPS**: Modern browser Web Audio and local storage features require a secure context (`https://`).
3. **Receipt Printer Configuration**:
   - Connect your 58mm or 80mm thermal receipt printer via USB or local network.
   - Install the manufacturer ESC/POS driver.
   - When printing from the browser, set printer margins to **None** and uncheck **Print Headers & Footers**.

---

## Post-Deployment Verification Checklist

After deploying a new release to production, execute the following smoke checks:

- [ ] **SSL Verification**: Confirm padlock indicator is present in the browser URL bar.
- [ ] **SPA Routing**: Navigate between tabs (`Dashboard`, `Calculator`, `POS`, `Inventory`) and refresh the page.
- [ ] **Audio Engine**: Tap a calculator button and verify the Web Audio click is audible.
- [ ] **Storage Persistence**: Create a test product or sale, refresh the browser, and confirm the record persists.
- [ ] **Print Isolation**: Open an invoice, click **Print Receipt**, and verify print preview shows only the receipt slip.
- [ ] **Role Boundary**: Switch to Cashier role and confirm wholesale purchase costs are hidden.

---

## Rollback Strategy & Data Safeguards

1. **Code Rollback**:
   - Firebase Hosting: `firebase hosting:rollback` allows instant one-click reversion to the previous deployment.
   - Cloud Run: Revert traffic to the previous revision via the Cloud Console.
2. **Data Safeguards**:
   - Before deploying major upgrades, advise store owners to download a full JSON backup from **Settings** > **Backup** > **Download Backup**.

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [SETUP.md](SETUP.md) — Local installation and boot.
- [FIREBASE.md](FIREBASE.md) — Cloud Firestore and Auth setup.
- [TESTING.md](TESTING.md) — Quality assurance and verification.
- [SECURITY.md](SECURITY.md) — Production security standards.
