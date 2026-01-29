## Packages
firebase | Firebase SDK for Auth and Firestore
recharts | Charting library for project analytics
date-fns | Date formatting and manipulation
framer-motion | Smooth animations and page transitions
clsx | Class name utility (often paired with tailwind-merge)
tailwind-merge | Class name merging utility

## Notes
Firebase Configuration:
- Uses VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.
- Fallback to mock/emulator logic if keys are missing (dev mode).
- Auth is Anonymous-only for simplicity as requested.
- Firestore structure: 
  - `projects/{projectId}`
  - `projects/{projectId}/tasks/{taskId}`
  - `projects/{projectId}/members/{userId}`
  - `users/{userId}` (to track joined projects)
