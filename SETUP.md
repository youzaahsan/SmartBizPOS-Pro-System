# System Setup & Installation Guide

This document provides complete instructions for cloning, configuring, running, and troubleshooting the **SMARTBIZ CALCULATOR** project across development and staging environments.

---

## 📌 Table of Contents

- [Prerequisites](#prerequisites)
- [Step-by-Step Installation](#step-by-step-installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Verifying Initial Seed Data](#verifying-initial-seed-data)
- [Database Reset Procedure](#database-reset-procedure)
- [Common Troubleshooting](#common-troubleshooting)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Prerequisites

Before setting up the project, ensure your workstation meets the following runtime requirements:

### 1. Node.js & Package Manager
- **Node.js**: `v18.0.0` or higher (`v20.x LTS` strongly recommended).
- **Package Manager**:
  - `npm` (`v9.x` or higher), OR
  - `bun` (`v1.x` or higher), OR
  - `yarn` (`v1.22+` or `v3+`).

To verify your Node.js and npm versions:
```bash
node -v
npm -v
```

### 2. Supported Browsers
The application leverages modern Web APIs (Web Audio API, LocalStorage, Print CSS):
- Google Chrome / Chromium (v100+)
- Mozilla Firefox (v100+)
- Apple Safari (v15+)
- Microsoft Edge (v100+)

---

## Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd smartbiz-calculator
```

### Step 2: Install Dependencies
Install all production and development dependencies:

```bash
npm install
```

*Note: If using `bun`:*
```bash
bun install
```

### Step 3: Configure Environment Variables
Copy the `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

---

## Environment Configuration

The application includes an `.env.example` file documenting available environment parameters:

```bash
# GEMINI_API_KEY: Optional server-side or runtime AI key if expanding AI capabilities.
# AI Studio automatically injects this at runtime from user secrets.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The base URL where this applet is hosted.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"
```

In standard local development, the application operates client-side with zero mandatory external API keys required to test the calculator, POS, inventory, reports, or customer ledgers.

---

## Running the Application

### Development Server
Start the local Vite development server:

```bash
npm run dev
```

Output:
```
  VITE v8.3.0  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://<your-ip>:3000/
```

Open `http://localhost:3000` in your browser.

### Type Checking
Ensure all TypeScript types and interfaces compile cleanly:

```bash
npm run lint
```

### Production Build
Generate an optimized production bundle inside the `dist/` directory:

```bash
npm run build
```

### Previewing the Production Build
Preview the generated production build locally:

```bash
npm run preview
```

---

## Verifying Initial Seed Data

On first launch, the `DatabaseEngine` automatically detects if storage has been initialized. If fresh, it populates authentic seed data:

1. **Business Profile**:
   - Store Name: *Al-Madina Smart Superstore*
   - Owner: *Youza Manzoor*
   - Currency: *PKR (Rs.)*
   - Invoice Prefix: *SB-*

2. **Pre-Configured Staff Accounts**:
   - **Admin (Owner)**: `admin@smartbiz.com` (Full access)
   - **Manager**: `manager@smartbiz.com` (Management & reports access)
   - **Cashier**: `cashier@smartbiz.com` (Restricted POS checkout access)

3. **Catalog & Customers**:
   - High-turnover retail items (Sugar, Basmati Rice, Dalda Cooking Oil, Olpers Milk, Flour).
   - Customers with existing Udhar credit balances (e.g., Ali Khan with Rs. 13,500 due).
   - Suppliers with pending payables (e.g., Chaudhry Rauf Sugar Mills).

---

## Database Reset Procedure

If you wish to wipe test transactions and reset the application back to pristine factory demo data:

1. Open the application in your browser.
2. Navigate to **Settings** in the top navigation bar.
3. Select the **Backup & Reset** tab.
4. Click **Reset to Factory Demo Data**.
5. Confirm the warning dialog. The application will clear all keys prefixed with `smartbiz_`, re-seed default records, and reload the page automatically.

Alternatively, via your browser's Developer Tools Console:
```javascript
localStorage.clear();
location.reload();
```

---

## Common Troubleshooting

### 1. Port 3000 Already in Use
By default, `vite.config.ts` configures port 3000:
```bash
# If port 3000 is occupied, specify an alternative port:
npx vite --port 3001
```

### 2. Stale Browser Storage
If data appears inconsistent after making manual code adjustments:
- Open Developer Tools (`F12` or `Ctrl+Shift+I`).
- Go to **Application** > **Storage** > **Local Storage**.
- Clear the storage for `http://localhost:3000` and refresh the page.

### 3. Audio Cues Not Playing
Modern browsers require at least one user gesture (click or keypress) before allowing the Web Audio API to produce sound:
- Simply click anywhere in the application or press a calculator button.
- Ensure audio is enabled in **Settings** > **Enable Audio Feedback**.

### 4. Thermal Printing Margins Misaligned
If physical receipts print with extra browser headers or margins:
- In the browser print dialog (`Ctrl+P`), set **Margins** to **None** or **Minimum**.
- Uncheck **Headers and footers** in the print options.

---

## Cross-Document Navigation

- [README.md](README.md) — System overview and feature list.
- [DEVELOPMENT.md](DEVELOPMENT.md) — Developer guidelines and coding workflows.
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — Directory map and file layout.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — Staff accounts and RBAC setup.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Production hosting and deployment guides.
