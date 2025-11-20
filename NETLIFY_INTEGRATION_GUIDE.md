# Connecting Netlify Frontend to FastAPI Backend

## Current Status

**Deployed Frontend:** https://newfrontend12.netlify.app/
**Backend API:** https://nestjs-auth-api-1.preview.emergentagent.com/api
**Status:** Frontend currently using static/mock data

## Integration Steps

### Option 1: Update Environment Variables on Netlify (Recommended)

1. **Go to Netlify Dashboard:**
   - Login to https://app.netlify.com
   - Select your site: `newfrontend12`

2. **Configure Environment Variables:**
   - Go to: Site settings → Build & deploy → Environment
   - Add the following environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://nestjs-auth-api-1.preview.emergentagent.com
   NEXT_PUBLIC_SUPABASE_ANON_KEY=not-needed-for-fastapi
   NEXT_PUBLIC_API_URL=https://nestjs-auth-api-1.preview.emergentagent.com/api
   ```

3. **Redeploy Site:**
   - Trigger a new deployment to apply environment variables
   - Deploys → Trigger deploy → Deploy site

### Option 2: Update Source Code

If you have access to the source repository, update the API configuration:

**File: `lib/supabase.ts` or `lib/api.ts`**

```typescript
// Replace Supabase client with direct API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nestjs-auth-api-1.preview.emergentagent.com/api';

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    return response.json();
  },
  
  post: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

### Option 3: Quick Local Testing

To test locally before deploying:

1. **Clone the GitHub repository:**
   ```bash
   git clone https://github.com/Abhaydahe/new-frontend.git
   cd new-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file:**
   ```env
   NEXT_PUBLIC_API_URL=https://nestjs-auth-api-1.preview.emergentagent.com/api
   NEXT_PUBLIC_SUPABASE_URL=https://nestjs-auth-api-1.preview.emergentagent.com
   ```

4. **Update API calls in the code:**
   Replace all Supabase calls with direct API calls to our FastAPI backend

5. **Run locally:**
   ```bash
   npm run dev
   ```

## API Endpoints Mapping

### Authentication
- Supabase `signUp` → `POST /api/auth/register`
- Supabase `signIn` → `POST /api/auth/login`
- Supabase `signOut` → Clear local token
- Supabase `getUser` → `GET /api/auth/me`

### Jobs
- Supabase `from('jobs').select()` → `GET /api/jobs`
- Supabase `from('jobs').select().eq('id', id)` → `GET /api/jobs/{id}`
- Supabase `from('jobs').insert()` → `POST /api/jobs`
- Supabase `from('jobs').update()` → `PUT /api/jobs/{id}`
- Supabase `from('jobs').delete()` → `DELETE /api/jobs/{id}`

### Projects
- Supabase `from('projects').select()` → `GET /api/projects`
- Supabase `from('projects').insert()` → `POST /api/projects`

### Applications
- Supabase `from('applications').insert()` → `POST /api/applications`
- Supabase `from('applications').select()` → `GET /api/applications/my`

### Proposals
- Supabase `from('proposals').insert()` → `POST /api/proposals`
- Supabase `from('proposals').select()` → `GET /api/proposals/my`

## Code Changes Required

### 1. Update `lib/supabase.ts`:

```typescript
// Remove Supabase imports
// import { createClient } from '@supabase/supabase-js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

// Store token in localStorage
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const clearToken = () => localStorage.removeItem('auth_token');

export const api = {
  auth: {
    register: async (email: string, password: string, full_name: string, user_type: string) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name, user_type }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.access_token);
      }
      return data;
    },
    
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.access_token);
      }
      return data;
    },
    
    logout: () => {
      clearToken();
    },
    
    getUser: async () => {
      const token = getToken();
      if (!token) return null;
      
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok ? await response.json() : null;
    },
  },
  
  jobs: {
    list: async (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_URL}/jobs?${params}`);
      return response.json();
    },
    
    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/jobs/${id}`);
      return response.json();
    },
    
    create: async (data: any) => {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  
  projects: {
    list: async (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_URL}/projects?${params}`);
      return response.json();
    },
    
    create: async (data: any) => {
      const token = getToken();
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  
  applications: {
    create: async (data: any) => {
      const token = getToken();
      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    
    myApplications: async () => {
      const token = getToken();
      const response = await fetch(`${API_URL}/applications/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },
  },
  
  proposals: {
    create: async (data: any) => {
      const token = getToken();
      const response = await fetch(`${API_URL}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    
    myProposals: async () => {
      const token = getToken();
      const response = await fetch(`${API_URL}/proposals/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },
  },
};
```

### 2. Update Components to Use New API

**Example: Jobs Page**

```typescript
// app/jobs/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/supabase';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.jobs.list();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
}
```

## Testing Integration

Once deployed, test these key flows:

1. **Registration:** Create account with different roles
2. **Login:** Sign in and receive JWT token
3. **View Jobs:** List should load from backend
4. **Post Job:** Submit form and see new job in database
5. **Apply to Job:** Submit application and verify in backend
6. **View Dashboard:** Check role-specific data display

## CORS Configuration

The backend is already configured to accept requests from any origin:

```python
# backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=['*'],  # Allows Netlify domain
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If needed, update to specific Netlify domain:
```python
allow_origins=['https://newfrontend12.netlify.app'],
```

## Quick Summary

**What needs to be done:**

1. ✅ Backend API is ready and working
2. ✅ All endpoints tested and functional
3. ⏳ Update Netlify environment variables
4. ⏳ Replace Supabase calls with FastAPI calls in frontend code
5. ⏳ Redeploy frontend to Netlify

**Backend URL:** `https://nestjs-auth-api-1.preview.emergentagent.com/api`

**Alternative:** Use the React frontend I built at `https://nestjs-auth-api-1.preview.emergentagent.com` which is already fully connected and working!
