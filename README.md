# ✝️ Church Conference Management App

A complete mobile-first web app for managing church conferences — participant registration, QR attendance, team rankings, and leaderboards.

---

## 📁 Project Structure

```
conference-app/
├── src/
│   ├── components/
│   │   ├── common/        # QRCode, QRScanner, Modal, Toast, Spinner
│   │   └── layout/        # Layout with bottom navigation
│   ├── context/           # AuthContext, ConferenceContext
│   ├── lib/               # firebase.js, firestore.js (all DB calls)
│   ├── pages/
│   │   ├── RegisterPage.jsx       # Public: self-registration + QR generation
│   │   ├── LeaderboardPage.jsx    # Public: team + participant rankings
│   │   ├── ProfilePage.jsx        # Public: individual participant profile
│   │   ├── LoginPage.jsx          # Admin login
│   │   ├── AdminDashboard.jsx     # Admin overview + quick actions
│   │   ├── ScannerPage.jsx        # QR scanner + attendance marking
│   │   ├── TeamsPage.jsx          # Create/edit teams, assign members
│   │   ├── ActivitiesPage.jsx     # Create/edit activities
│   │   ├── ChallengesPage.jsx     # Award team challenge points
│   │   ├── ConferencesPage.jsx    # Create/archive conferences
│   │   └── ParticipantsPage.jsx   # View all participants
│   ├── App.jsx                    # Router
│   └── main.jsx                   # Entry point
├── firestore.rules                # Security rules
├── firebase.json                  # Hosting + Firestore config
├── .env.example                   # Environment variables template
└── package.json
```

---

## 🚀 Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** (start in production mode)
4. Enable **Authentication** → Email/Password
5. Enable **Hosting**

### 2. Create Admin User

In Firebase Console → Authentication → Users → Add User:
- Email: `admin@yourchurch.com`
- Password: (your choice)

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Firebase config values from Firebase Console → Project Settings → Your Apps.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Locally

```bash
npm run dev
```

Open `http://localhost:5173`

---

## 📦 Deployment to Firebase Hosting

### First-time Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize (select Hosting + Firestore, use existing project)
firebase init

# When prompted:
# - Hosting public dir: dist
# - Single-page app: Yes
# - Firestore rules file: firestore.rules
```

### Deploy

```bash
npm run deploy
# or separately:
npm run build
firebase deploy
```

Your app will be live at: `https://your-project.web.app`

---

## 🗄️ Firestore Database Structure

```
conferences/
  {confId}/
    name: "Summer Youth Conference"
    year: "2025"
    archived: false
    createdAt: Timestamp

    participants/
      {userId}/          ← userId = auto-generated (e.g. USR1A2B3C)
        userId: string
        name: string
        phone: string
        teamId: string | null
        teamName: string | null
        points: number
        createdAt: Timestamp

    teams/
      {teamId}/
        name: string
        color: string    ← hex color
        points: number
        createdAt: Timestamp

    activities/
      {activityId}/
        name: string
        day: number      ← 1, 2, 3...
        points: number
        createdAt: Timestamp

    attendance/
      {userId_activityId}/    ← composite key prevents duplicates
        userId: string
        activityId: string
        activityName: string
        points: number
        markedAt: Timestamp

    teamChallenges/
      {challengeId}/
        teamId: string
        challengeName: string
        points: number
        awardedBy: string   ← admin email
        awardedAt: Timestamp
```

---

## 📱 App Pages & URLs

| URL | Access | Description |
|-----|--------|-------------|
| `/` | Public | Registration — enter name & phone, get QR |
| `/leaderboard` | Public | Team & participant rankings |
| `/profile/:userId` | Public | Individual participant profile + QR |
| `/login` | Public | Admin sign in |
| `/admin` | Admin | Dashboard with stats |
| `/admin/scanner` | Admin | QR scanner + mark attendance |
| `/admin/teams` | Admin | Create/manage teams, assign members |
| `/admin/activities` | Admin | Create/manage conference activities |
| `/admin/challenges` | Admin | Award team challenge points |
| `/admin/participants` | Admin | View all participants |
| `/admin/conferences` | Admin | Create/archive conferences |

---

## 🔐 Security Model

- **Public access**: Registration, profile viewing, leaderboard
- **Admin only**: QR scanning, attendance marking, team/activity management, awarding points
- **Firestore rules**: Enforced server-side (see `firestore.rules`)

---

## ⚙️ Key Features

### QR Code System
- Each participant gets a unique ID like `USR1A2B3C4D`
- QR code contains **only** the user ID (no personal data)
- QR code displayed after registration, downloadable as PNG
- Also visible on each participant's profile

### Attendance & Points
- Admin scans QR → participant info loads instantly
- One tap to mark each activity
- Duplicate attendance prevented at DB level (composite key)
- Points update immediately for participant AND their team

### Team Challenges
- Award entire team at once (all members + team total)
- Preset challenges or custom name/points
- Full history log

### Multi-Conference Support
- Create a new conference each year
- Old conferences stay archived for historical data
- Each conference has completely separate data

---

## 🎨 Customization

### Change Default Activities
Edit `seedDefaultActivities()` in `src/lib/firestore.js`

### Change Colors/Theme
Edit `tailwind.config.js` — the `brand` color palette

### Add More Admin Roles
Currently any authenticated Firebase user is an admin. For role-based access, add a `roles` field to Firestore user documents and check in `RequireAuth`.

---

## 📲 PWA / Offline (Optional Enhancement)

Add to `index.html` to make it installable:
```html
<link rel="manifest" href="/manifest.json">
```

Create `public/manifest.json`:
```json
{
  "name": "Church Conference",
  "short_name": "Conference",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#030712",
  "theme_color": "#4a6cf7",
  "icons": [{ "src": "/icon.png", "sizes": "192x192", "type": "image/png" }]
}
```
