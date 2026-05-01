# Team Task Manager

Team Task Manager is a full-stack productivity platform for teams that need to organize projects, assign tasks, and track progress with secure role-based access control for admins and members.

## Features

- JWT authentication with password hashing via `bcryptjs`
- Admin and member role-based access control
- Project creation, membership management, and project detail views
- Task assignment with priority, due dates, inline status updates, and overdue highlighting
- Dashboard with totals for all major task states plus "My Tasks"
- Admin-only team directory with per-user project participation counts
- Responsive dark UI with desktop sidebar and mobile bottom navigation
- Railway-ready monorepo with separate `client/` and `server/` services

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router v6, Axios, React Hook Form, date-fns
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ODM
- Auth: JWT with `jsonwebtoken` and `bcryptjs`
- Deployment: Railway

## Project Structure

```text
/
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   `-- pages/
|   |-- .env
|   |-- package.json
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- server/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- .env
|   |-- package.json
|   `-- server.js
|-- .gitignore
`-- README.md
```

## Local Setup

1. Clone the repository.
2. Install backend dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

4. Configure the backend environment in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123
CLIENT_URL=http://localhost:5173
```

5. Configure the frontend environment in `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

6. Start the backend:

```bash
cd server
npm run dev
```

7. Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

8. Open `http://localhost:5173`.

## Default Admin Creation

- No seed script is required.
- Create the first admin by registering through the UI or `POST /api/auth/register` with `"role": "admin"`.

## Railway Deployment

### Backend Service

1. Create a Railway service from this repository.
2. Set the root directory to `server`.
3. Use the start command `node server.js`.
4. Add environment variables:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` set to the deployed frontend URL

### Frontend Service

1. Create a second Railway service from the same repository.
2. Set the root directory to `client`.
3. Use the build command `npm run build`.
4. Use the start command `npx serve -s dist -l $PORT`.
5. Add `VITE_API_URL` pointing to the deployed backend URL.

## API Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a new user and return token + user |
| POST | `/api/auth/login` | Public | Log in and return token + user |
| GET | `/api/users` | Admin | Fetch all registered users |
| GET | `/api/projects` | Auth | Admin gets all projects, member gets assigned projects |
| POST | `/api/projects` | Admin | Create a project |
| GET | `/api/projects/:id` | Auth | Fetch a single project with members |
| PUT | `/api/projects/:id` | Admin | Update a project |
| DELETE | `/api/projects/:id` | Admin | Delete a project |
| POST | `/api/projects/:id/members` | Admin | Add a member to a project |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove a member from a project |
| GET | `/api/tasks` | Auth | Fetch tasks, with role-aware filtering |
| GET | `/api/tasks/dashboard` | Auth | Fetch dashboard stats and my tasks |
| POST | `/api/tasks` | Admin | Create a task |
| PUT | `/api/tasks/:id` | Auth | Admin updates all fields, member updates status only |
| DELETE | `/api/tasks/:id` | Admin | Delete a task |

## API Response Format

All endpoints return the same response envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Human readable message"
}
```

## Screenshots

- Login page: add a screenshot after deployment or local setup
- Dashboard: capture stats cards and my tasks
- Projects page: capture project cards and create modal
- Project detail page: capture members and task list
- Tasks page: capture filters and inline status updates
- Team page: capture user cards and project counts

## Live URL

- Frontend URL: Railway frontend service URL
- Backend URL: Railway backend service URL

## Repository

- GitHub Repository: your repository URL for this monorepo
