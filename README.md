# User Management Module

A full-featured user management system built with React, TypeScript, and TanStack Query, featuring advanced state management, optimistic updates, and undo functionality.

## 🚀 Live Demo

**Deployed Application:** [https://mock-api-skj.netlify.app/](https://mock-api-skj.netlify.app/)

## ✨ Features Implemented

### Core Features
- ✅ **Full CRUD Operations** - Create, read, update, and delete users with proper validation
- ✅ **Optimistic UI Updates** - Instant feedback with automatic rollback on API failures
- ✅ **Concurrent Mutation Handling** - Race condition detection with 404 error handling
- ✅ **Undo Bulk Delete** - 5-second undo window with sessionStorage persistence across page refreshes
- ✅ **Search & Filtering** - Filter by name, email, role, status, and creation date
- ✅ **Sorting** - Sort by name, email, or creation date (ascending/descending)
- ✅ **Dark/Light Theme** - Theme toggle with system preference support
- ✅ **Toast Notifications** - User feedback for all actions using Sonner

### Bonus Features
- ✅ **Avatar Upload** - File upload integration with Cloudinary
- ✅ **Responsive Design** - Mobile and tablet compatible

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |
| State Management | TanStack React Query v5 |
| Form Handling | React Hook Form + Zod |
| Routing | React Router DOM |
| Image Upload | Cloudinary |
| Notifications | Sonner |

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/SiewJun/mock-api.git
cd mock-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
**Note:** These environment variables are provided for assessment evaluation purposes. 
```env
VITE_API_BASE_URL=https://68ff8c08e02b16d1753e6ed3.mockapi.io/maia/api/v1
VITE_CLOUDINARY_CLOUD_NAME=drcqpeecs
VITE_CLOUDINARY_UPLOAD_PRESET=user_avatars_preset
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🎯 Key Highlights

### Advanced State Management
- Query invalidation and cache management
- Optimistic updates with proper rollback
- Loading and error state handling throughout the app

### Concurrent Mutation Handling
- Detects when a user is deleted while being edited
- Shows clear error messages and prevents data loss
- Handles race conditions gracefully

### Undo Functionality
- Bulk delete operations are reversible for 5 seconds
- Persists undo state in sessionStorage to survive page refreshes
- Real-time countdown timer in toast notification

### Form Validation
- Client-side validation with Zod schemas
- Server-side error handling
- File upload validation (type, size)

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── features/users/     # User feature module
│   ├── api/           # API calls and React Query hooks
│   ├── components/    # User-specific components
│   └── schemas/       # Zod validation schemas
├── lib/               # Utility libraries (axios, cloudinary)
├── pages/             # Route pages
└── providers/         # Context providers
```

## 🔗 API Reference

**Base URL:** `https://68ff8c08e02b16d1753e6ed3.mockapi.io/maia/api/v1`

| Action | Method | Endpoint |
|--------|--------|----------|
| Get All Users | GET | `/user` |
| Get Single User | GET | `/user/:id` |
| Create User | POST | `/user` |
| Update User | PUT | `/user/:id` |
| Delete User | DELETE | `/user/:id` |

## 👨‍💻 Author

**Siew Jun**  
GitHub: [@SiewJun](https://github.com/SiewJun)
