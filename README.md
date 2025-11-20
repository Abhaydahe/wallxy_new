# Wallxy - AEC Job Marketplace Platform

A full-stack job marketplace platform for Architecture, Engineering & Construction (AEC) professionals, built with FastAPI backend and React frontend.

## Features

### Authentication
- JWT-based authentication (email/password)
- User registration with role selection (Job Seeker, Freelancer, Employer, Client)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### Job Management
- Browse and search job listings
- Post new jobs (Employers/Clients only)
- View detailed job information
- Apply to jobs with cover letter
- Track job applications
- Filter jobs by category, type, and experience level

### Project Management
- Browse freelance projects
- Post new projects (Employers/Clients only)
- View project details
- Submit proposals (Freelancers only)
- Track proposal status

### User Dashboard
- View profile statistics (rating, completed projects)
- Track applications and proposals
- Personalized dashboard based on user type

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT tokens with python-jose
- **Password Hashing**: bcrypt via passlib
- **Validation**: Pydantic models

### Frontend
- **Framework**: React (Create React App)
- **Routing**: React Router v6
- **UI Components**: Shadcn/UI (Radix UI primitives)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast notifications)

## Project Structure

```
/app/
├── backend/
│   ├── server.py          # FastAPI application with all routes
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React application
│   │   ├── App.css       # Global styles
│   │   └── components/   # Shadcn UI components
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend environment variables
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - List all jobs (with filters)
- `GET /api/jobs/{job_id}` - Get job details
- `POST /api/jobs` - Create new job (protected)
- `PUT /api/jobs/{job_id}` - Update job (protected)
- `DELETE /api/jobs/{job_id}` - Delete job (protected)

### Projects
- `GET /api/projects` - List all projects (with filters)
- `GET /api/projects/{project_id}` - Get project details
- `POST /api/projects` - Create new project (protected)
- `PUT /api/projects/{project_id}` - Update project (protected)
- `DELETE /api/projects/{project_id}` - Delete project (protected)

### Applications
- `POST /api/applications` - Submit job application (protected)
- `GET /api/applications/my` - Get user's applications (protected)
- `GET /api/applications/job/{job_id}` - Get applications for a job (protected)

### Proposals
- `POST /api/proposals` - Submit project proposal (protected)
- `GET /api/proposals/my` - Get user's proposals (protected)
- `GET /api/proposals/project/{project_id}` - Get proposals for a project (protected)

### Users
- `GET /api/users/{user_id}` - Get user profile
- `PUT /api/users/{user_id}` - Update user profile (protected)

### Notifications
- `GET /api/notifications` - Get user notifications (protected)
- `PUT /api/notifications/{notification_id}/read` - Mark notification as read (protected)

## Database Schema

### Users Collection
- id, email, password (hashed), full_name, avatar_url, bio
- skills[], hourly_rate, experience_level, location
- user_type (jobseeker, freelancer, employer, client)
- rating, completed_projects, verification_status
- created_at, updated_at

### Jobs Collection
- id, employer_id, title, company_name, description
- requirements[], category, job_type, experience_level
- salary_min, salary_max, location, skills[]
- status, views, applicants_count
- created_at, updated_at

### Projects Collection
- id, client_id, title, description, category
- budget_type, budget_min, budget_max, duration
- skills[], status, views, proposals_count
- created_at, updated_at

### Applications Collection
- id, job_id, applicant_id
- cover_letter, resume_url, status
- created_at, updated_at

### Proposals Collection
- id, project_id, freelancer_id
- cover_letter, proposed_budget, delivery_time, status
- created_at, updated_at

### Notifications Collection
- id, user_id, title, message, type, link
- is_read, created_at

## Local Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud instance)

### Backend Setup

1. Install Python dependencies:
```bash
cd /app/backend
pip install -r requirements.txt
```

2. Configure environment variables in `/app/backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=wallxy_db
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-change-in-production
```

3. Start the backend server:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend API will be available at `http://localhost:8001`

### Frontend Setup

1. Install Node dependencies:
```bash
cd /app/frontend
yarn install
```

2. Configure environment variables in `/app/frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

3. Start the development server:
```bash
yarn start
```

The frontend will be available at `http://localhost:3000`

## Production Deployment

### Backend
- Ensure `JWT_SECRET_KEY` is set to a strong random value
- Configure CORS_ORIGINS to your frontend domain
- Use a production MongoDB instance
- Run with production ASGI server:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

### Frontend
- Build the production bundle:
```bash
yarn build
```
- Serve the `build/` directory with a web server (nginx, Apache, etc.)

## User Roles

### Job Seeker
- Browse and search jobs
- Apply to jobs
- Track applications
- View dashboard with application status

### Freelancer
- Browse projects
- Submit proposals
- Apply to jobs
- Track proposals and applications

### Employer
- Post jobs
- Post projects
- View applications
- Manage job listings

### Client
- Post projects
- View proposals
- Manage project listings

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt (cost factor 12)
- Protected API endpoints with bearer token verification
- Token expiration (7 days by default)
- CORS configuration for cross-origin requests
- Authorization checks for resource ownership

## Testing

### Manual Testing
Use the provided UI to test all features:
1. Register a new account
2. Login and receive JWT token
3. Browse jobs and projects
4. Post a job/project (if employer/client)
5. Apply to jobs or submit proposals
6. View dashboard

### API Testing with curl

Register a user:
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User","user_type":"jobseeker"}'
```

Login:
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

List jobs:
```bash
curl -X GET http://localhost:8001/api/jobs
```

## Environment Variables Reference

### Backend (.env)
- `MONGO_URL` - MongoDB connection string (required)
- `DB_NAME` - Database name (required)
- `CORS_ORIGINS` - Allowed CORS origins, comma-separated (default: *)
- `JWT_SECRET_KEY` - Secret key for JWT signing (required for production)

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend API URL (required)
- `WDS_SOCKET_PORT` - WebSocket port for hot reload (optional)

## Credits

Built with FastAPI, React, MongoDB, and Shadcn/UI components.

Inspired by the original Next.js frontend design from https://github.com/Abhaydahe/new-frontend
