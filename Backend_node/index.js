require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8001; // Same port as Python!

// 1. Setup the App
app.use(cors());
app.use(express.json());

// 2. Connect to Database
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB (Node.js)'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 3. Define Data Models (What our data looks like)
const UserSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  user_type: { type: String, required: true },
  avatar_url: String,
  bio: String,
  skills: [String],
  hourly_rate: Number,
  experience_level: String,
  location: String,
  rating: { type: Number, default: 0.0 },
  completed_projects: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const JobSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  employer_id: { type: String, required: true },
  title: String,
  company_name: String,
  description: String,
  requirements: [String],
  category: String,
  job_type: String,
  experience_level: String,
  salary_min: Number,
  salary_max: Number,
  location: String,
  skills: [String],
  status: { type: String, default: "active" },
  views: { type: Number, default: 0 },
  applicants_count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  client_id: { type: String, required: true },
  title: String,
  description: String,
  category: String,
  budget_type: String,
  budget_min: Number,
  budget_max: Number,
  duration: String,
  skills: [String],
  status: { type: String, default: "active" },
  views: { type: Number, default: 0 },
  proposals_count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ApplicationSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  job_id: String,
  applicant_id: String,
  cover_letter: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const ProposalSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  project_id: String,
  freelancer_id: String,
  cover_letter: String,
  proposed_budget: Number,
  delivery_time: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Job = mongoose.model('Job', JobSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Application = mongoose.model('Application', ApplicationSchema);
const Proposal = mongoose.model('Proposal', ProposalSchema);

// 4. Helper: Check if user is logged in
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ detail: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = verified; 
    next();
  } catch (err) {
    res.status(401).json({ detail: 'Invalid Token' });
  }
};

// ================== ROUTES (The API) ==================

// --- Auth ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, user_type } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ detail: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      email, password: hashedPassword, full_name, user_type 
    });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET_KEY);
    res.json({ access_token: token, user });
  } catch (err) { res.status(500).json({ detail: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ detail: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ detail: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET_KEY);
    res.json({ access_token: token, user });
  } catch (err) { res.status(500).json({ detail: err.message }); }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  const user = await User.findOne({ id: req.user.sub }).select('-password');
  res.json(user);
});

// --- Jobs ---
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await Job.findOne({ id: req.params.id });
  if(job) {
      job.views++;
      await job.save();
  }
  res.json(job);
});

app.post('/api/jobs', authenticate, async (req, res) => {
  const job = await Job.create({ ...req.body, employer_id: req.user.sub });
  res.json(job);
});

// --- Projects ---
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.get('/api/projects/:id', async (req, res) => {
  const project = await Project.findOne({ id: req.params.id });
  if(project) {
      project.views++;
      await project.save();
  }
  res.json(project);
});

app.post('/api/projects', authenticate, async (req, res) => {
  const project = await Project.create({ ...req.body, client_id: req.user.sub });
  res.json(project);
});

// --- Applications ---
app.post('/api/applications', authenticate, async (req, res) => {
  const { job_id, cover_letter } = req.body;
  const app = await Application.create({ job_id, applicant_id: req.user.sub, cover_letter });
  await Job.updateOne({ id: job_id }, { $inc: { applicants_count: 1 } });
  res.json(app);
});

app.get('/api/applications/my', authenticate, async (req, res) => {
  const apps = await Application.find({ applicant_id: req.user.sub });
  res.json(apps);
});

app.get('/api/applications/job/:job_id', authenticate, async (req, res) => {
  const apps = await Application.find({ job_id: req.params.job_id });
  res.json(apps);
});

app.put('/api/applications/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  await Application.updateOne({ id: req.params.id }, { status });
  res.json({ message: "Updated" });
});

// --- Proposals ---
app.post('/api/proposals', authenticate, async (req, res) => {
  const { project_id, cover_letter, proposed_budget, delivery_time } = req.body;
  const prop = await Proposal.create({ 
    project_id, freelancer_id: req.user.sub, cover_letter, proposed_budget, delivery_time 
  });
  await Project.updateOne({ id: project_id }, { $inc: { proposals_count: 1 } });
  res.json(prop);
});

app.get('/api/proposals/my', authenticate, async (req, res) => {
  const props = await Proposal.find({ freelancer_id: req.user.sub });
  res.json(props);
});

app.get('/api/proposals/project/:project_id', authenticate, async (req, res) => {
  const props = await Proposal.find({ project_id: req.params.project_id });
  res.json(props);
});

app.put('/api/proposals/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  await Proposal.updateOne({ id: req.params.id }, { status });
  res.json({ message: "Updated" });
});

// 5. Start the Server
app.listen(PORT, () => console.log(`🚀 Node.js Server running on port ${PORT}`));