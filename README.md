# 🍪 COOKIES — Check Before You Trust.

<div align="center">

![COOKIES Banner](https://img.shields.io/badge/COOKIES-Consumer%20Digital%20Safety-C8860A?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeT0iMjAiIGZvbnQtc2l6ZT0iMjAiPvCfjqo8L3RleHQ+PC9zdmc+)

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**COOKIES is a consumer digital-safety platform that helps ordinary users check suspicious websites, links, messages, job offers, QR codes, and digital content before they click, pay, or respond.**

[Live Demo](#demo) · [Features](#features) · [Quick Start](#quick-start) · [Architecture](#architecture) · [Contributing](#contributing)

</div>

---

## 🎯 What is COOKIES?

In a world full of phishing links, hidden subscription traps, fake job offers, and QR code scams, most people lack the tools to protect themselves. COOKIES makes digital safety as simple as asking:

> **"Is this safe?"**

COOKIES is NOT a cybersecurity dashboard. It feels like a trusted friend who happens to know a lot about digital safety — one who explains things in plain language, in your own language.

---

## ✨ Features

### 🔍 Analysis Tools

| Feature | Description |
|---------|-------------|
| **Website Scanner** | Detect hidden fees, recurring subscriptions, dark patterns, fake urgency |
| **Screenshot Analyzer** | Upload any screenshot for AI-powered analysis |
| **📷 Camera Scan** | Point your camera at suspicious content and get instant analysis |
| **🛡️ Live Guard** | Continuous camera monitoring with throttled frame analysis |
| **🔗 QR Checker** | Decode QR codes and safely preview destinations before opening |
| **💼 JobGuard** | Analyze offer letters, recruitment messages, and job advertisements |
| **💬 Message Checker** | Check suspicious SMS, email, WhatsApp, Instagram, Telegram content |
| **💳 Payment Analyzer** | Detect suspicious payment requests and extraction attempts |
| **🌐 Link Checker** | Analyze URLs for phishing indicators and deceptive patterns |

### 🌍 Multilingual Support

COOKIES speaks your language — switch instantly from the first page:

- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)
- 🇮🇳 Kannada (ಕನ್ನಡ)
- 🇮🇳 Tamil (தமிழ்)
- 🇮🇳 Telugu (తెలుగు)
- 🇮🇳 Bengali (বাংলা)
- 🇮🇳 Marathi (मराठी)
- 🇮🇳 Malayalam (മലയാളം)

### 📊 Personal Safety Hub

- **My Safety Dashboard** — track sites checked, items analyzed, reports submitted
- **Evidence Vault** — securely store screenshots and documents as private evidence
- **Subscription Watchdog** — track recurring payments and get renewal reminders
- **True Cost Calculator** — see the real cost of any purchase (hidden fees, annual cost)
- **Community Reports** — contribute to and benefit from community safety intelligence

### 📚 Education

- Interactive dark pattern cards with real examples
- "Can you spot the trick?" mini-quizzes
- Coverage: hidden fees, fake urgency, hidden subscriptions, phishing, fake jobs, impersonation

---

## 🛡️ Safety Philosophy

COOKIES follows strict principles:

- ✅ **Evidence-based** — only reports what was actually observed
- ✅ **No hallucination** — never invents company info, reputation scores, or fake data
- ✅ **Privacy-first** — your evidence is private by default
- ✅ **Honest uncertainty** — clearly states what couldn't be verified
- ✅ **Consumer-friendly** — no technical jargon, ever

**Status system:**
| Status | Meaning |
|--------|---------|
| 🟢 No major concerns | Nothing suspicious found in the provided evidence |
| 🔵 Information incomplete | Not enough information to assess |
| 🟡 Review before proceeding | Some indicators worth checking |
| 🟠 Multiple concerns | Several concerning patterns detected |
| 🔴 High concern indicators | Strong indicators of potential deception |

> ⚠️ These are NOT absolute guarantees. COOKIES helps you verify — it doesn't replace your judgment.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     COOKIES Platform                         │
├─────────────────────┬───────────────────────────────────────┤
│   Frontend          │   Backend                              │
│   React 18 + Vite   │   Express.js + TypeScript              │
│   TypeScript        │                                        │
│   Tailwind CSS      │   ┌─────────────────────────────┐     │
│   Framer Motion     │   │      Analysis Engine         │     │
│   React Router v6   │   │  Central Orchestrator        │     │
│   Zustand           │   └──────────────┬──────────────┘     │
│   Firebase SDK      │                  │                     │
│                     │   ┌──────────────▼──────────────┐     │
├─────────────────────┤   │     Google AI Services       │     │
│   Firebase          │   │  • Gemini 1.5 Flash          │     │
│   Authentication    │   │  • Cloud Vision OCR          │     │
│   Cloud Firestore   │   │  • Cloud Translation         │     │
│   Firebase Storage  │   └─────────────────────────────┘     │
│   Security Rules    │                                        │
└─────────────────────┴───────────────────────────────────────┘
```

### Key Services

| Service | Purpose |
|---------|---------|
| `GeminiService` | Multimodal AI analysis, structured JSON output |
| `VisionService` | Google Cloud Vision OCR for text extraction |
| `TranslationService` | Google Cloud Translation for dynamic content |
| `AnalysisEngine` | Central orchestrator routing all content types |
| `WebsiteAnalysisService` | Dark pattern detection on websites |
| `JobGuardService` | Fake job / recruitment scam detection |
| `PhishingAnalysisService` | Phishing and impersonation detection |
| `SocialScamService` | Social media scam analysis |
| `PaymentAnalysisService` | Suspicious payment request analysis |
| `QRService` | QR code decoding and destination safety check |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- A Firebase project (see [Firebase Setup](#firebase-setup))
- Google Cloud API key with Vision API enabled
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Jayanti29/Cookies.git
cd Cookies
```

### 2. Backend Setup

```bash
cd backend
cp ../.env.example .env
# Edit .env with your API keys
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
# Create frontend/.env with your Firebase config
npm install
npm run dev
```

The app will be available at `http://localhost:5173` with the backend at `http://localhost:3001`.

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Google Cloud (Vision, Translation)
GOOGLE_CLOUD_API_KEY=your_cloud_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3001
```

> ⚠️ **Never commit real API keys.** See `.env.example` for the template.

---

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Create a **Firestore** database (start in test mode, then apply security rules)
4. Enable **Firebase Storage**
5. Deploy security rules:
   ```bash
   npx firebase-tools deploy --only firestore:rules,storage
   ```

---

## 📱 Screens & Navigation

### Mobile Navigation
```
🏠 Home | 🔍 Check | 📷 Camera | 📢 Reports | 👤 Profile
```

### All Pages
- `/` — Home (hero + 6 action cards + language selector)
- `/check` — Universal Checker (paste link / upload / camera / text)
- `/check/website` — Website Scanner
- `/check/message` — Message Checker
- `/check/job` — JobGuard
- `/check/payment` — Payment Analyzer
- `/check/qr` — QR Checker
- `/camera` — Camera Scanner
- `/camera/live` — Live Guard
- `/results/:id` — Analysis Results
- `/reports` — My Reports
- `/reports/new` — Report Wizard
- `/evidence` — Evidence Vault
- `/dashboard` — My Safety Dashboard
- `/subscriptions` — Subscription Watchdog
- `/true-cost` — True Cost Calculator
- `/learn` — Education & Dark Patterns
- `/community` — Community Reports
- `/profile` — Settings & Profile
- `/auth` — Sign In / Sign Up

---

## 🔒 Security

- **Firebase Authentication** — all private data requires sign-in
- **Firestore Security Rules** — evidence is user-scoped, never publicly accessible
- **Firebase Storage Rules** — evidence files are private by default
- **Server-side API keys** — Gemini/Vision credentials never exposed to frontend
- **Rate limiting** — 20 analysis requests per 15 minutes per IP
- **Input validation** — file size limits, MIME type checks, URL validation
- **No raw content logging** — sensitive submitted content is never logged

---

## 🎨 Design Principles

1. **One Screen = One Decision** — no overwhelming dashboards
2. **Consumer-first language** — no technical jargon
3. **Mobile-first** — designed for phones, scales to desktop
4. **Honest uncertainty** — always says what it doesn't know
5. **Privacy visible** — camera active indicators, clear data notices

### Color Palette
- Background: `#FAFAF8` (warm off-white)
- Text: `#1A1A1A` (deep charcoal)
- Accent: `#C8860A` (cookie golden)
- Safe: `#16A34A` | Info: `#2563EB` | Review: `#CA8A04` | Concern: `#EA580C` | High: `#DC2626`

---

## 🗂️ Project Structure

```
Cookies/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # All 19 route pages
│   │   ├── hooks/            # useCamera, useAuth, useAnalysis
│   │   ├── services/         # API client, Firebase auth
│   │   ├── i18n/             # 8 language translation files
│   │   ├── store/            # Zustand global state
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── backend/                  # Express.js + TypeScript
│   ├── src/
│   │   ├── services/         # All analysis services
│   │   ├── routes/           # API endpoint definitions
│   │   ├── middleware/       # Auth, validation, rate-limit
│   │   └── config/           # Firebase Admin, Gemini init
│   └── package.json
├── firestore.rules           # Firestore security rules
├── storage.rules             # Firebase Storage security rules
├── firestore.indexes.json    # Firestore query indexes
├── firebase.json             # Firebase CLI config
├── .env.example              # Environment variables template
└── README.md                 # This file
```

---

## 📊 API Reference

### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Universal analysis (any type) |
| `POST` | `/api/analyze/website` | Website dark pattern scan |
| `POST` | `/api/analyze/image` | Image/screenshot analysis |
| `POST` | `/api/analyze/message` | Text/message analysis |
| `POST` | `/api/analyze/job` | Job offer analysis |
| `POST` | `/api/analyze/phishing` | Phishing detection |
| `POST` | `/api/analyze/payment` | Payment request analysis |
| `POST` | `/api/analyze/qr` | QR code decode + safety check |
| `POST` | `/api/analyze/url` | URL analysis |

### Community Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reports` | Submit a report |
| `GET` | `/api/reports` | Get your reports |
| `GET` | `/api/reports/community` | Public community reports |
| `POST` | `/api/reports/:id/vote` | Vote on a report |
| `GET` | `/api/community/trending` | Trending threats |

### User Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/evidence` | Upload evidence |
| `GET` | `/api/evidence` | Get your evidence |
| `DELETE` | `/api/evidence/:id` | Delete evidence |
| `POST` | `/api/subscriptions` | Add subscription |
| `GET` | `/api/subscriptions` | Get subscriptions |

---

## 🧪 Demo Mode

Set `DEMO_MODE=true` in backend `.env` to return pre-built demo results (clearly labeled `DEMO DATA`).

Demo scenarios:
1. E-commerce hidden subscription
2. Fake job offer
3. Phishing message
4. Instagram giveaway scam
5. QR code safety check
6. Suspicious payment request

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Google Gemini](https://ai.google.dev/) — AI analysis engine
- [Google Cloud Vision](https://cloud.google.com/vision) — OCR capabilities
- [Firebase](https://firebase.google.com/) — Authentication, database, storage
- [React](https://react.dev/) — Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Lucide](https://lucide.dev/) — Icons

---

<div align="center">

**COOKIES** — *Check Before You Trust.*

Built with ❤️ for digital safety of every internet user.

</div>
