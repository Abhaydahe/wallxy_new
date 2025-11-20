from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ Models ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    user_type: str  # employer, freelancer, jobseeker, client

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    hourly_rate: Optional[float] = None
    experience_level: Optional[str] = None
    location: Optional[str] = None
    user_type: str
    rating: float = 0.0
    completed_projects: int = 0
    verification_status: str = "unverified"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employer_id: str
    title: str
    company_name: str
    description: str
    requirements: List[str] = Field(default_factory=list)
    category: str
    job_type: str
    experience_level: str
    salary_min: float
    salary_max: float
    location: str
    skills: List[str] = Field(default_factory=list)
    status: str = "active"
    views: int = 0
    applicants_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobCreate(BaseModel):
    title: str
    company_name: str
    description: str
    requirements: List[str]
    category: str
    job_type: str
    experience_level: str
    salary_min: float
    salary_max: float
    location: str
    skills: List[str]

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    title: str
    description: str
    category: str
    budget_type: str
    budget_min: float
    budget_max: float
    duration: str
    skills: List[str] = Field(default_factory=list)
    status: str = "active"
    views: int = 0
    proposals_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    title: str
    description: str
    category: str
    budget_type: str
    budget_min: float
    budget_max: float
    duration: str
    skills: List[str]

class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    applicant_id: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

class Proposal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    freelancer_id: str
    cover_letter: str
    proposed_budget: float
    delivery_time: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProposalCreate(BaseModel):
    project_id: str
    cover_letter: str
    proposed_budget: float
    delivery_time: str

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ Helper Functions ============

def serialize_doc(doc):
    """Serialize MongoDB document for JSON response"""
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, datetime):
                doc[key] = value.isoformat()
    return doc

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if user_doc is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    serialize_doc(user_doc)
    return User(**user_doc)

# ============ Auth Routes ============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        user_type=user_data.user_type
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Remove password from response
    user_doc.pop('password', None)
    user_doc.pop('_id', None)
    serialize_doc(user_doc)
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============ User/Profile Routes ============

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    serialize_doc(user)
    return User(**user)

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: dict, current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    user_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"id": user_id}, {"$set": user_data})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    serialize_doc(updated_user)
    return User(**updated_user)

# ============ Job Routes ============

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(category: Optional[str] = None, job_type: Optional[str] = None, 
                   experience_level: Optional[str] = None, limit: int = 50):
    query = {"status": "active"}
    if category:
        query["category"] = category
    if job_type:
        query["job_type"] = job_type
    if experience_level:
        query["experience_level"] = experience_level
    
    jobs = await db.jobs.find(query, {"_id": 0}).to_list(limit)
    for job in jobs:
        serialize_doc(job)
    return jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Increment views
    await db.jobs.update_one({"id": job_id}, {"$inc": {"views": 1}})
    job['views'] = job.get('views', 0) + 1
    
    serialize_doc(job)
    return Job(**job)

@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: User = Depends(get_current_user)):
    if current_user.user_type not in ['employer', 'client']:
        raise HTTPException(status_code=403, detail="Only employers and clients can post jobs")
    
    job = Job(
        employer_id=current_user.id,
        **job_data.model_dump()
    )
    
    job_dict = job.model_dump()
    job_dict['created_at'] = job_dict['created_at'].isoformat()
    job_dict['updated_at'] = job_dict['updated_at'].isoformat()
    
    await db.jobs.insert_one(job_dict)
    return job

@api_router.put("/jobs/{job_id}", response_model=Job)
async def update_job(job_id: str, job_data: dict, current_user: User = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job['employer_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    
    job_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.jobs.update_one({"id": job_id}, {"$set": job_data})
    
    updated_job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    serialize_doc(updated_job)
    return Job(**updated_job)

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, current_user: User = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job['employer_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")
    
    await db.jobs.delete_one({"id": job_id})
    return {"message": "Job deleted successfully"}

# ============ Project Routes ============

@api_router.get("/projects", response_model=List[Project])
async def get_projects(category: Optional[str] = None, budget_type: Optional[str] = None, limit: int = 50):
    query = {"status": "active"}
    if category:
        query["category"] = category
    if budget_type:
        query["budget_type"] = budget_type
    
    projects = await db.projects.find(query, {"_id": 0}).to_list(limit)
    for project in projects:
        serialize_doc(project)
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.projects.update_one({"id": project_id}, {"$inc": {"views": 1}})
    project['views'] = project.get('views', 0) + 1
    
    serialize_doc(project)
    return Project(**project)

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user: User = Depends(get_current_user)):
    if current_user.user_type not in ['employer', 'client']:
        raise HTTPException(status_code=403, detail="Only employers and clients can post projects")
    
    project = Project(
        client_id=current_user.id,
        **project_data.model_dump()
    )
    
    project_dict = project.model_dump()
    project_dict['created_at'] = project_dict['created_at'].isoformat()
    project_dict['updated_at'] = project_dict['updated_at'].isoformat()
    
    await db.projects.insert_one(project_dict)
    return project

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: dict, current_user: User = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project['client_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    project_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"id": project_id}, {"$set": project_data})
    
    updated_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    serialize_doc(updated_project)
    return Project(**updated_project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project['client_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    await db.projects.delete_one({"id": project_id})
    return {"message": "Project deleted successfully"}

# ============ Job Application Routes ============

@api_router.post("/applications", response_model=JobApplication)
async def create_application(app_data: JobApplicationCreate, current_user: User = Depends(get_current_user)):
    if current_user.user_type not in ['jobseeker', 'freelancer']:
        raise HTTPException(status_code=403, detail="Only job seekers and freelancers can apply")
    
    # Check if already applied
    existing = await db.applications.find_one({"job_id": app_data.job_id, "applicant_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    application = JobApplication(
        applicant_id=current_user.id,
        **app_data.model_dump()
    )
    
    app_dict = application.model_dump()
    app_dict['created_at'] = app_dict['created_at'].isoformat()
    app_dict['updated_at'] = app_dict['updated_at'].isoformat()
    
    await db.applications.insert_one(app_dict)
    
    # Increment applicants count
    await db.jobs.update_one({"id": app_data.job_id}, {"$inc": {"applicants_count": 1}})
    
    return application

@api_router.get("/applications/my", response_model=List[JobApplication])
async def get_my_applications(current_user: User = Depends(get_current_user)):
    applications = await db.applications.find({"applicant_id": current_user.id}, {"_id": 0}).to_list(100)
    for app in applications:
        serialize_doc(app)
    return applications

@api_router.get("/applications/job/{job_id}", response_model=List[JobApplication])
async def get_job_applications(job_id: str, current_user: User = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job['employer_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view applications")
    
    applications = await db.applications.find({"job_id": job_id}, {"_id": 0}).to_list(100)
    for app in applications:
        serialize_doc(app)
    return applications

# ============ Proposal Routes ============

@api_router.post("/proposals", response_model=Proposal)
async def create_proposal(prop_data: ProposalCreate, current_user: User = Depends(get_current_user)):
    if current_user.user_type != 'freelancer':
        raise HTTPException(status_code=403, detail="Only freelancers can submit proposals")
    
    # Check if already proposed
    existing = await db.proposals.find_one({"project_id": prop_data.project_id, "freelancer_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted proposal for this project")
    
    proposal = Proposal(
        freelancer_id=current_user.id,
        **prop_data.model_dump()
    )
    
    prop_dict = proposal.model_dump()
    prop_dict['created_at'] = prop_dict['created_at'].isoformat()
    prop_dict['updated_at'] = prop_dict['updated_at'].isoformat()
    
    await db.proposals.insert_one(prop_dict)
    
    # Increment proposals count
    await db.projects.update_one({"id": prop_data.project_id}, {"$inc": {"proposals_count": 1}})
    
    return proposal

@api_router.get("/proposals/my", response_model=List[Proposal])
async def get_my_proposals(current_user: User = Depends(get_current_user)):
    proposals = await db.proposals.find({"freelancer_id": current_user.id}, {"_id": 0}).to_list(100)
    for prop in proposals:
        serialize_doc(prop)
    return proposals

@api_router.get("/proposals/project/{project_id}", response_model=List[Proposal])
async def get_project_proposals(project_id: str, current_user: User = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project['client_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view proposals")
    
    proposals = await db.proposals.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    for prop in proposals:
        serialize_doc(prop)
    return proposals

# ============ Notification Routes ============

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    for notif in notifications:
        serialize_doc(notif)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
