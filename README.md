# SOPHIA

Sophia is a single-entry personal operating system that runs through one launch path:

1. Loading screen
2. Authentication
3. First-time onboarding questionnaire
4. Main application shell
5. Home, Body, Mind, Discipline, and Progress tabs
6. AI coach, Growth system, Notifications, and Profile views

## System Flow

```text
APP LAUNCH
  -> LoadingScreen
  -> AuthPage
  -> OnboardingFlow (first login only)
  -> HomeDashboard
  -> BottomNav routes:
     /home
     /body
     /mind
     /discipline
     /progress
  -> Floating AI route:
     /ai
  -> Supporting routes:
     /profile
     /growth
     /notifications
```

## Technologies Used

### Frontend

- React 18 for the application UI
- Vite 5 for development and production builds
- React Router 6 for app navigation
- Redux Toolkit for auth, onboarding, settings, and persisted client state
- CSS Modules plus component-level styles for presentation
- Firebase support is optional and can be enabled with environment variables
- Service Worker registration is included for notification support

### Backend

- Node.js 18+
- Express 4 REST API
- JWT authentication
- SQLite via better-sqlite3 as the primary data store
- Optional MongoDB and Redis connectors
- Helmet, CORS, rate limiting, compression, and morgan middleware

### Deployment

- Vercel configuration for frontend deployment
- Local Windows launch scripts for integrated development

## Repository Layout

```text
Sophialangingpage/
  backend/                 Express API and database access
  sophia_mobile_web/       Main React application
  sophia_portfolio/        Optional Django project
  api/                     Additional server entrypoint files
  Documents/               Presentation materials
  run_sophia.ps1           PowerShell launcher for frontend + backend
  START_SOPHIA_ALL.cmd     Windows batch launcher
```

## Main Frontend Files

```text
sophia_mobile_web/src/
  App.jsx                          Main router and guarded app shell
  main.jsx                         React bootstrap
  pages/AuthPage.jsx               Login and registration screen
  components/LoadingScreen.jsx     Splash screen
  components/OnboardingFlow.jsx    Questionnaire flow
  components/HomeDashboard.jsx     Main dashboard
  components/BodySection.jsx       Body domain tabs
  components/MindSection.jsx       Mind domain tabs
  components/DisciplineSection.jsx Discipline domain tabs
  components/ProgressSection.jsx   Cross-domain analytics
  components/AICoach.jsx           Floating coach experience
  components/GrowthSystem.jsx      XP, levels, achievements, programs
  components/ProfilePage.jsx       Sophia profile view
  components/BottomNav.jsx         Main navigation bar
  services/api.js                  Backend and Firebase service layer
  store/                           Redux state and persistence
```

## Running The Integrated System

### Option 1: PowerShell launcher

```powershell
cd "C:\Users\USER\OneDrive\Documents\Sophialangingpage"
.\run_sophia.ps1
```

Optional Django site:

```powershell
.\run_sophia.ps1 -IncludeDjango
```

### Option 2: Batch launcher

```bat
cd /d "C:\Users\USER\OneDrive\Documents\Sophialangingpage"
START_SOPHIA_ALL.cmd
```

Optional Django site:

```bat
START_SOPHIA_ALL.cmd --with-django
```

### Option 3: Manual startup

```powershell
cd "C:\Users\USER\OneDrive\Documents\Sophialangingpage\backend"
npm start
```

```powershell
cd "C:\Users\USER\OneDrive\Documents\Sophialangingpage\sophia_mobile_web"
npm run dev
```

Open `http://localhost:5173`.

## Current Data Model And Persistence

- Authentication uses the backend API and persists the token in Redux local state.
- Onboarding completion is stored in localStorage so the user only sees the questionnaire once on the current device.
- Section-level trackers currently persist to localStorage.
- Firebase remains optional. If enabled, the service layer can sync selected user data there.
- The backend API is already wired for authentication and domain endpoints, but not every UI component has been converted from local-only storage to backend persistence yet.

## What Was Integrated In This Pass

- Replaced demo auth startup with the real auth page
- Normalized frontend handling of backend auth responses
- Corrected persisted token lookup so authenticated sessions reload properly
- Connected onboarding completion to the main router guard
- Simplified the protected app shell around the requested Sophia tabs
- Replaced broken Windows launch scripts with working backend + frontend starters
- Updated root documentation to describe the actual Sophia stack and flow

## Validation Commands

```powershell
cd "C:\Users\USER\OneDrive\Documents\Sophialangingpage\sophia_mobile_web"
npm run build
```

```powershell
cd "C:\Users\USER\OneDrive\Documents\Sophialangingpage\backend"
npm start
```

## Remaining Gaps

- Several Body, Mind, Discipline, and Progress widgets still use mock or local-only data.
- Social login buttons are placeholders in the current auth UI.
- The Django project is separate and optional; it is not part of the main Sophia runtime path.
- Full backend persistence for every tracker would require converting each section component away from direct localStorage hooks.
```

## 🔥 Firebase Integration (Optional)

To enable Firestore for auth and user data (habits/journal/study/tasks), add Firebase settings to `sophia_mobile_web/.env` and set:

- `VITE_USE_FIREBASE=true`
- `VITE_FIREBASE_API_KEY` etc.

Then run:

```bash
cd sophia_mobile_web
npm run dev
```

Behavior:
- `api.register`, `api.login`, `api.logout`, `api.forgotPassword` use Firebase Auth
- data endpoints (habits/journal/study/tasks) use Firestore subcollections under `users/{uid}`
- fallback to `backend` when `VITE_USE_FIREBASE=false`

POST   /api/auth/logout            # Logout
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/forgot-password   # Password reset
```

### User Endpoints
```
GET    /api/users/me               # Get profile
PUT    /api/users/me               # Update profile
```

### Habits Endpoints
```
GET    /api/habits                 # Get all habits
POST   /api/habits                 # Create habit
PUT    /api/habits/{id}            # Update habit
DELETE /api/habits/{id}            # Delete habit
POST   /api/habits/{id}/complete   # Mark complete
GET    /api/habits/stats           # Get statistics
```

### Similar Coverage For:
- `/api/journal/*` - Journal entries
- `/api/study/*` - Study sessions
- `/api/tasks/*` - Task management
- `/api/analytics/*` - Dashboard & stats
- `/api/assistant/*` - AI assistant
- `/api/ml/*` - ML models
- `/api/notion/*` - Notion sync
- `/api/portfolio/*` - Projects
- `/api/payments/*` - M-Pesa payments

---

## 🛠️ Development

### Adding a New Feature

1. **Create API endpoint** in `backend/routes/`
2. **Add method to API service** in `sophia_mobile_web/src/services/api.js`
3. **Create page component** in `sophia_mobile_web/src/pages/`
4. **Add to navigation** in `Sofia_mobile_web/src/components/BottomNav.jsx`
5. **Test end-to-end** using `TESTING_CHECKLIST.md`

### Example: Adding Habits Page
```javascript
// 1. Call API
import api from '@/services/api.js';

useEffect(() => {
  const habits = await api.getHabits();
}, []);

// 2. Display data
return habits.map(h => <HabitCard key={h.id} {...h} />);

// 3. Add to routing
// In App.jsx
case 'habits':
  return <HabitsPage />;
```

---

## 📈 Performance

- **Frontend**: ~200KB gzipped (React 18 + deps)
- **API Response**: <500ms (typical)
- **Database Query**: <100ms (SQLite)
- **Page Load**: <2 seconds (Vite dev server)
- **Build Time**: ~5 seconds (npm run build)

---

## 🔄 Data Models

### User
```javascript
{
  id: UUID,
  email: String,
  fullName: String,
  password_hash: String,
  avatar: String,
  bio: String,
  timezone: String,
  level: Int,
  experience: Int,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Habit
```javascript
{
  id: UUID,
  userId: UUID,
  name: String,
  description: String,
  frequency: 'daily' | 'weekly' | 'monthly',
  target_count: Int,
  current_streak: Int,
  best_streak: Int,
  completed_today: Boolean,
  created_at: DateTime,
  last_completed: DateTime
}
```

### Similar Models
- JournalEntry (with mood, tags, content)
- StudySession (with duration, subject, notes)
- Task (with priority, tags, due_date)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `QUICK_START_GUIDE.md` | **Start here** - How to run servers |
| `SOPHIA_INTEGRATION_GUIDE.md` | Complete architecture overview |
| `TESTING_CHECKLIST.md` | 200+ test cases |
| `INTEGRATION_COMPLETE.md` | What's been done |
| `DEPLOYMENT_GUIDE.md` | Production setup |
| `PROJECT_SEPARATION.md` | Project structure |

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port 3001 isn't in use
netstat -ano | findstr :3001

# If in use, kill process
taskkill /PID <PID> /F
```

### Frontend won't build
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### API returns 401
- Token expired → Login again
- Check Authorization header in requests
- Verify backend is running

### State not persisting
- Check localStorage enabled
- Check browser cache settings
- Try incognito/private mode

---

## 🚀 Deployment

### Build for Production
```bash
# Frontend
cd sophia_mobile_web
npm run build
npm run preview  # test build locally

# Backend
npm start  # with NODE_ENV=production
```

### Environment Variables
```bash
# Backend (.env)
PORT=3001
JWT_SECRET=<generate-strong-secret>
NODE_ENV=production
DATABASE_URL=sqlite:///sophia.db

# Frontend (.env)
VITE_API_URL=https://api.sophia.com
VITE_APP_NAME=Sophia
```

### Docker (Optional)
```dockerfile
FROM node:18
WORKDIR /app
COPY backend/ .
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 📞 Support

### Getting Help
1. Check `TESTING_CHECKLIST.md` for known issues
2. Check browser console (F12) for errors
3. Check Network tab for API errors
4. Check backend logs for server errors
5. Read code comments and documentation

### Common Commands
```bash
# Start all services
START_SOPHIA_ALL.cmd

# Backend only
cd backend && npm start

# Frontend only
cd sophia_mobile_web && npm run dev

# Build frontend
cd sophia_mobile_web && npm run build

# Run tests
npm test

# Check for security vulnerabilities
npm audit
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Redux** - State management
- **Tailwind CSS** - Styling
- **React Router** - Routing

### Backend  
- **Node.js** - Runtime
- **Express.js** - Framework
- **SQLite** - Database
- **JWT** - Authentication
- **Helmet** - Security
- **bcryptjs** - Password hashing

### Optional
- **MongoDB** - NoSQL database
- **Redis** - Caching
- **Mongoose** - ODM
- **Passport** - OAuth

---

## 🎯 Roadmap

| Phase | Status | Timeline |
|-------|--------|----------|
| MVP (Core Features) | ✅ Complete | ✓ Done |
| Data Integration | 🔄 In Progress | 1-2 weeks |
| Advanced Features | 📅 Planned | 3-4 weeks |
| Mobile App | 📅 Planned | 2-3 months |
| Community | 📅 Planned | TBD |

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Node.js Best Practices](https://nodejs.org/en/docs/)
- [Express Tutorial](https://expressjs.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)

---

## 🙏 Acknowledgments

Built with ❤️ for personal development and productivity.

---

## 📞 Contact

For questions, suggestions, or issues:
- Check documentation first
- See TESTING_CHECKLIST.md
- Review code comments
- Check API documentation

---

**Ready to transform your personal development journey with Sophia! 🚀**

---

## Next Steps

1. **Start the servers** (3 min)
   ```bash
   cd backend && npm start
   cd sophia_mobile_web && npm run dev
   ```

2. **Test authentication** (5 min)
   - Register new account
   - Login successfully
   - Navigate pages
   - Logout

3. **Complete testing** (30 min)
   - Follow `TESTING_CHECKLIST.md`
   - Test each feature
   - Verify all works

4. **Start implementing** (ongoing)
   - Create new pages
   - Wire up data
   - Add features
   - Build your app!

---

**Happy coding! ✨**
