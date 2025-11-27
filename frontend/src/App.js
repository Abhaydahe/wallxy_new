import { useState, useEffect, createContext, useContext } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Briefcase, Users, Star, TrendingUp, Search, Sparkles, MapPin, DollarSign, Clock, Bookmark, Bell, MessageSquare, User, Settings, LogOut, FileText, ArrowRight, Plus, Filter, Building2, CheckCircle2, Clock3, Eye, MoreHorizontal, Wallet, Calendar } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// ==========================================
// 1. AUTH CONTEXT
// ==========================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  const register = async (email, password, full_name, user_type) => {
    const response = await axios.post(`${API}/auth/register`, { email, password, full_name, user_type });
    const { access_token, user: userData } = response.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ==========================================
// 2. NAVBAR COMPONENT
// ==========================================
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#00ADB5] rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#222831]">Wallxy</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link to="/jobs">
                <Button variant="ghost" className="text-[#393E46] hover:text-[#00ADB5]">Jobs</Button>
              </Link>
              <Link to="/projects">
                <Button variant="ghost" className="text-[#393E46] hover:text-[#00ADB5]">Projects</Button>
              </Link>
              {user && (
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-[#393E46] hover:text-[#00ADB5]">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-[#00ADB5] text-white">
                        {user.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// ==========================================
// 3. HOME PAGE
// ==========================================
const HomePage = () => {
  const features = [
    { icon: Search, title: 'Smart Job Matching', description: 'AI-powered job recommendations tailored to your skills' },
    { icon: Users, title: 'Top Talent Pool', description: 'Connect with verified professionals in AEC' },
    { icon: Sparkles, title: 'AI Tools', description: 'Automated proposal generation and resume improvement' },
    { icon: TrendingUp, title: 'Career Growth', description: 'Track your progress and discover opportunities' },
  ];

  const stats = [
    { value: '10,000+', label: 'Active Jobs' },
    { value: '50,000+', label: 'Professionals' },
    { value: '5,000+', label: 'Companies' },
    { value: '₹500Cr+', label: 'Projects Value' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative bg-gradient-to-r from-[#00ADB5] to-[#00ADB5]/80 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">Your Gateway to AEC Excellence</h1>
              <p className="text-xl mb-8 text-white/90">Connect with opportunities in Architecture, Engineering & Construction.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/jobs"><Button size="lg" className="bg-white text-[#00ADB5] hover:bg-white/90 h-14 px-8"><Briefcase className="w-5 h-5 mr-2" />Find Jobs</Button></Link>
                <Link to="/projects"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8"><Users className="w-5 h-5 mr-2" />Browse Projects</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-[#00ADB5] mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold text-[#222831] mb-4">Why Choose Wallxy?</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-[#00ADB5] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-[#00ADB5]/10 rounded-2xl flex items-center justify-center mb-4"><feature.icon className="w-7 h-7 text-[#00ADB5]" /></div>
                  <h3 className="text-xl font-semibold text-[#222831] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ==========================================
// 4. AUTH PAGE
// ==========================================
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('jobseeker');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Login Succesfully');
      } else {
        await register(email, password, fullName, userType);
        toast.success('User Succesfully registered');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00ADB5]/10 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-2xl text-center text-[#222831]">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
            )}
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {!isLogin && (
              <div className="space-y-2">
                <Label>I am a</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jobseeker">Job Seeker</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90" disabled={loading}>{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</Button>
            <div className="text-center text-sm"><button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[#00ADB5] hover:underline">{isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}</button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ==========================================
// 5. JOBS PAGE
// ==========================================
const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(response.data);
    } catch (error) { toast.error('Failed to fetch jobs'); } finally { setLoading(false); }
  };

  const formatSalary = (min, max) => (min && max) ? `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L` : 'Negotiable';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-[#222831]">Browse Jobs</h1><p className="text-gray-600 mt-2">Discover opportunities in AEC industry</p></div>
          <Link to="/jobs/post"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Plus className="w-4 h-4 mr-2" />Post a Job</Button></Link>
        </div>
        {loading ? <div className="text-center py-12">Loading jobs...</div> : jobs.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" /><p className="text-gray-600">No jobs available yet</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow border-2 hover:border-[#00ADB5]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-[#222831]"><Link to={`/jobs/${job.id}`} className="hover:text-[#00ADB5] transition-colors">{job.title}</Link></CardTitle>
                      <p className="text-[#393E46] font-medium">{job.company_name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 items-center text-sm text-[#393E46]">
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{job.location}</span></div>
                      <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /><span>{job.job_type}</span></div>
                      <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>{formatSalary(job.salary_min, job.salary_max)}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-[#EEEEEE] text-[#222831]">{job.category}</Badge>
                      {job.skills.slice(0, 3).map((skill, index) => (<Badge key={index} variant="outline" className="border-[#00ADB5] text-[#00ADB5]">{skill}</Badge>))}
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-sm text-gray-500">{job.applicants_count} applicants</span>
                      <Link to={`/jobs/${job.id}`}><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90">Apply Now</Button></Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. POST JOB PAGE
// ==========================================
const PostJobPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', company_name: '', description: '', requirements: '', category: 'Architecture', job_type: 'Full-time', experience_level: 'Mid-level', salary_min: '', salary_max: '', location: '', skills: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to post a job'); navigate('/auth'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/jobs`, {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        salary_min: parseFloat(formData.salary_min),
        salary_max: parseFloat(formData.salary_max),
      });
      toast.success('Succesfully posted job');
      navigate('/jobs');
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to post job'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader><CardTitle className="text-2xl">Post a Job</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Job Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Company Name</Label><Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Requirements (one per line)</Label><Textarea rows={4} value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Architecture">Architecture</SelectItem><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Construction">Construction</SelectItem><SelectItem value="Design">Design</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Job Type</Label><Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Freelance">Freelance</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Salary (₹)</Label><Input type="number" value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Max Salary (₹)</Label><Input type="number" value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Skills (comma separated)</Label><Input value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} required /></div>
            <Button type="submit" className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90" disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ==========================================
// 7. JOB DETAIL PAGE
// ==========================================
const JobDetailPage = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { user } = useAuth();
  const jobId = window.location.pathname.split('/').pop();
  const navigate = useNavigate();

  useEffect(() => { fetchJob(); }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`${API}/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) { toast.error('Failed to fetch job details'); } finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to apply'); navigate('/auth'); return; }
    setApplying(true);
    try {
      await axios.post(`${API}/applications`, { job_id: jobId, cover_letter: coverLetter });
      toast.success('Application submitted successfully!');
      setCoverLetter('');
      fetchJob();
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to submit application'); } finally { setApplying(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-[#222831]">{job.title}</CardTitle>
            <p className="text-xl text-[#393E46] mt-2">{job.company_name}</p>
            <div className="flex flex-wrap gap-3 mt-4"><Badge className="bg-[#00ADB5]">{job.job_type}</Badge><Badge variant="outline">{job.experience_level}</Badge><Badge variant="outline">{job.category}</Badge></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Description</h3><p className="text-gray-700 whitespace-pre-line">{job.description}</p></div>
            <div><h3 className="text-lg font-semibold mb-2">Requirements</h3><ul className="list-disc list-inside space-y-1">{job.requirements.map((req, idx) => (<li key={idx} className="text-gray-700">{req}</li>))}</ul></div>
            <div><h3 className="text-lg font-semibold mb-2">Skills Required</h3><div className="flex flex-wrap gap-2">{job.skills.map((skill, idx) => (<Badge key={idx} variant="outline" className="border-[#00ADB5] text-[#00ADB5]">{skill}</Badge>))}</div></div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div><p className="text-sm text-gray-600">Location</p><p className="font-medium">{job.location}</p></div>
              <div><p className="text-sm text-gray-600">Salary Range</p><p className="font-medium">₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L</p></div>
            </div>
            {user && user.user_type !== 'employer' && user.user_type !== 'client' && (
              <form onSubmit={handleApply} className="space-y-4">
                <div><Label>Cover Letter</Label><Textarea placeholder="Tell the employer why you're a great fit..." rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} required /></div>
                <Button type="submit" className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90" disabled={applying}>{applying ? 'Submitting...' : 'Submit Application'}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// 8. POST PROJECT PAGE (NEW)
// ==========================================
const PostProjectPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Architecture', budget_type: 'Fixed', budget_min: '', budget_max: '', duration: '1-3 months', skills: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to post a project'); navigate('/auth'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/projects`, {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
      });
      toast.success('Successfully posted project');
      navigate('/projects');
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to post project'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader><CardTitle className="text-2xl">Post a Project</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Project Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Architecture">Architecture</SelectItem><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Interior Design">Interior Design</SelectItem><SelectItem value="3D Modeling">3D Modeling</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Duration</Label><Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="< 1 month">&lt; 1 month</SelectItem><SelectItem value="1-3 months">1-3 months</SelectItem><SelectItem value="3-6 months">3-6 months</SelectItem><SelectItem value="> 6 months">&gt; 6 months</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Budget (₹)</Label><Input type="number" value={formData.budget_min} onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Max Budget (₹)</Label><Input type="number" value={formData.budget_max} onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>Skills Required (comma separated)</Label><Input value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} required /></div>
            <Button type="submit" className="w-full bg-[#00ADB5]" disabled={loading}>{loading ? 'Posting...' : 'Post Project'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ==========================================
// 9. PROJECTS PAGE
// ==========================================
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) { toast.error('Failed to fetch projects'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-[#222831]">Browse Projects</h1><p className="text-gray-600 mt-2">Find freelance opportunities</p></div>
          <Link to="/projects/post"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Plus className="w-4 h-4 mr-2" />Post a Project</Button></Link>
        </div>
        {loading ? <div className="text-center py-12">Loading projects...</div> : projects.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" /><p className="text-gray-600">No projects available yet</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow border-2 hover:border-[#00ADB5]">
                <CardHeader><CardTitle className="text-xl text-[#222831]">{project.title}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{project.description.substring(0, 200)}...</p>
                  <div className="flex flex-wrap gap-2 mb-4"><Badge className="bg-[#00ADB5]">{project.category}</Badge><Badge variant="outline">{project.budget_type}</Badge><Badge variant="outline">{project.duration}</Badge></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-500">₹{(project.budget_min / 1000).toFixed(0)}k - ₹{(project.budget_max / 1000).toFixed(0)}k</span><span className="text-sm text-gray-500">{project.proposals_count} proposals</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 10. JOB SEEKER DASHBOARD
// ==========================================
const JobSeekerDashboard = ({ user, applications, jobs }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const stats = [
    { title: "Total Applications", value: applications.length, icon: FileText, color: "text-blue-600" },
    { title: "Interviews", value: applications.filter(a => a.status === 'interview').length, icon: Users, color: "text-purple-600" },
    { title: "Offers", value: applications.filter(a => a.status === 'accepted').length, icon: CheckCircle2, color: "text-green-600" },
    { title: "Profile Views", value: user.views || 12, icon: TrendingUp, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-[#222831]">Dashboard</h1><p className="text-gray-600">Welcome back, {user.full_name}</p></div>
        <Link to="/jobs"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Search className="w-4 h-4 mr-2" />Find Jobs</Button></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">{stat.title}</p><p className="text-3xl font-bold text-[#222831] mt-2">{stat.value}</p></div><div className={`p-3 bg-gray-50 rounded-full ${stat.color}`}><stat.icon className="w-6 h-6" /></div></div></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm"><CardHeader><CardTitle>Recent Applications</CardTitle><CardDescription>Track the status of your job applications</CardDescription></CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12"><FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No applications yet</p><Link to="/jobs" className="text-[#00ADB5] hover:underline text-sm mt-2 inline-block">Browse available jobs</Link></div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const jobDetails = jobs.find(j => j.id === app.job_id);
                    return (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-gray-600" /></div>
                          <div>
                            <p className="font-medium text-[#222831]">
                              {jobDetails ? jobDetails.title : `Job ID: ${app.job_id.substring(0, 8)}...`}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              {jobDetails && <span className="mr-2 text-[#00ADB5]">{jobDetails.company_name} •</span>}
                              <Clock3 className="w-3 h-3" /> Applied {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={`${getStatusColor(app.status)} capitalize`}>{app.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border shadow-sm"><CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
            <CardContent><div className="flex flex-col items-center text-center mb-6"><Avatar className="w-20 h-20 mb-3"><AvatarFallback className="bg-[#00ADB5] text-white text-2xl">{user.full_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar><h3 className="font-bold text-lg">{user.full_name}</h3><p className="text-sm text-gray-500">{user.email}</p><div className="flex items-center gap-2 mt-2"><Badge variant="outline">{user.user_type}</Badge></div></div><Button variant="outline" className="w-full">Edit Profile</Button></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 11. EMPLOYER DASHBOARD
// ==========================================
const EmployerDashboard = ({ user, jobs }) => {
  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce((acc, job) => acc + (job.applicants_count || 0), 0);
  const totalViews = jobs.reduce((acc, job) => acc + (job.views || 0), 0);

  const stats = [
    { title: "Active Jobs", value: totalJobs, icon: Briefcase, color: "text-blue-600" },
    { title: "Total Applicants", value: totalApplicants, icon: Users, color: "text-purple-600" },
    { title: "Total Views", value: totalViews, icon: Eye, color: "text-orange-600" },
    { title: "Hired", value: 0, icon: CheckCircle2, color: "text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-[#222831]">Employer Dashboard</h1><p className="text-gray-600">Manage your job postings and applicants</p></div>
        <Link to="/jobs/post"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Plus className="w-4 h-4 mr-2" />Post a Job</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">{stat.title}</p><p className="text-3xl font-bold text-[#222831] mt-2">{stat.value}</p></div><div className={`p-3 bg-gray-50 rounded-full ${stat.color}`}><stat.icon className="w-6 h-6" /></div></div></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Your Active Jobs</CardTitle><CardDescription>Overview of your job postings performance</CardDescription></CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-12"><Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">You haven't posted any jobs yet</p><Link to="/jobs/post" className="text-[#00ADB5] hover:underline text-sm mt-2 inline-block">Post your first job</Link></div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Briefcase className="w-5 h-5 text-blue-600" /></div>
                        <div>
                          <Link to={`/jobs/${job.id}`} className="font-medium text-[#222831] hover:text-[#00ADB5]">{job.title}</Link>
                          <p className="text-sm text-gray-500 flex items-center gap-1"><Clock3 className="w-3 h-3" /> Posted {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-medium">{job.applicants_count} Applicants</p>
                          <p className="text-xs text-gray-500">{job.views || 0} Views</p>
                        </div>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-20 h-20 mb-3"><AvatarFallback className="bg-[#00ADB5] text-white text-2xl">{user.full_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <h3 className="font-bold text-lg">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-2"><Badge variant="secondary" className="bg-blue-100 text-blue-800">Employer</Badge></div>
              </div>
              <Button variant="outline" className="w-full">Edit Company Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 12. FREELANCER DASHBOARD
// ==========================================
const FreelancerDashboard = ({ user, proposals, projects }) => {
  const activeProposals = proposals.filter(p => p.status === 'pending').length;
  const activeContracts = proposals.filter(p => p.status === 'accepted').length;
  const totalEarnings = proposals.reduce((acc, curr) => curr.status === 'accepted' ? acc + curr.proposed_budget : acc, 0);

  const stats = [
    { title: "Active Proposals", value: activeProposals, icon: FileText, color: "text-blue-600" },
    { title: "Active Contracts", value: activeContracts, icon: CheckCircle2, color: "text-green-600" },
    { title: "Total Earnings", value: `₹${(totalEarnings/1000).toFixed(1)}k`, icon: Wallet, color: "text-purple-600" },
    { title: "Profile Views", value: user.views || 8, icon: Eye, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-[#222831]">Freelancer Dashboard</h1><p className="text-gray-600">Track your proposals and projects</p></div>
        <Link to="/projects"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Search className="w-4 h-4 mr-2" />Find Projects</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">{stat.title}</p><p className="text-3xl font-bold text-[#222831] mt-2">{stat.value}</p></div><div className={`p-3 bg-gray-50 rounded-full ${stat.color}`}><stat.icon className="w-6 h-6" /></div></div></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Recent Proposals</CardTitle><CardDescription>Status of your submitted proposals</CardDescription></CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="text-center py-12"><FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No proposals sent yet</p><Link to="/projects" className="text-[#00ADB5] hover:underline text-sm mt-2 inline-block">Browse available projects</Link></div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => {
                    const projectDetails = projects.find(p => p.id === prop.project_id);
                    return (
                      <div key={prop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
                          <div>
                            <p className="font-medium text-[#222831]">
                              {projectDetails ? projectDetails.title : `Project ID: ${prop.project_id.substring(0, 8)}...`}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock3 className="w-3 h-3" /> Bid: ₹{prop.proposed_budget} • {prop.delivery_time}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize bg-gray-100 text-gray-800">{prop.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Profile Stats</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-20 h-20 mb-3"><AvatarFallback className="bg-[#00ADB5] text-white text-2xl">{user.full_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <h3 className="font-bold text-lg">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-2"><Badge variant="outline">Freelancer</Badge></div>
              </div>
              <Button variant="outline" className="w-full">Update Portfolio</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 13. CLIENT DASHBOARD (NEW)
// ==========================================
const ClientDashboard = ({ user, projects }) => {
  const totalProjects = projects.length;
  const totalProposals = projects.reduce((acc, p) => acc + (p.proposals_count || 0), 0);
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);

  const stats = [
    { title: "Active Projects", value: totalProjects, icon: Briefcase, color: "text-blue-600" },
    { title: "Total Proposals", value: totalProposals, icon: FileText, color: "text-purple-600" },
    { title: "Total Views", value: totalViews, icon: Eye, color: "text-orange-600" },
    { title: "Hired", value: 0, icon: CheckCircle2, color: "text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-[#222831]">Client Dashboard</h1><p className="text-gray-600">Manage your projects and hire freelancers</p></div>
        <Link to="/projects/post"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Plus className="w-4 h-4 mr-2" />Post a Project</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">{stat.title}</p><p className="text-3xl font-bold text-[#222831] mt-2">{stat.value}</p></div><div className={`p-3 bg-gray-50 rounded-full ${stat.color}`}><stat.icon className="w-6 h-6" /></div></div></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Your Active Projects</CardTitle><CardDescription>Overview of your project postings</CardDescription></CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12"><Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">You haven't posted any projects yet</p><Link to="/projects/post" className="text-[#00ADB5] hover:underline text-sm mt-2 inline-block">Post your first project</Link></div>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div key={proj.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Briefcase className="w-5 h-5 text-blue-600" /></div>
                        <div>
                          <Link to={`/projects`} className="font-medium text-[#222831] hover:text-[#00ADB5]">{proj.title}</Link>
                          <p className="text-sm text-gray-500 flex items-center gap-1"><Clock3 className="w-3 h-3" /> Posted {new Date(proj.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-medium">{proj.proposals_count} Proposals</p>
                          <p className="text-xs text-gray-500">{proj.views || 0} Views</p>
                        </div>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Client Profile</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-20 h-20 mb-3"><AvatarFallback className="bg-[#00ADB5] text-white text-2xl">{user.full_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <h3 className="font-bold text-lg">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-2"><Badge variant="secondary" className="bg-blue-100 text-blue-800">Client</Badge></div>
              </div>
              <Button variant="outline" className="w-full">Edit Client Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 14. DASHBOARD PAGE WRAPPER
// ==========================================
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: [], proposals: [], jobs: [], myJobs: [], projects: [], myProjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchStats(); }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      if (user.user_type === 'jobseeker') {
        const [appsRes, jobsRes] = await Promise.all([
          axios.get(`${API}/applications/my`),
          axios.get(`${API}/jobs`)
        ]);
        setStats({ ...stats, applications: appsRes.data, jobs: jobsRes.data });
      } else if (user.user_type === 'employer') {
        const jobsRes = await axios.get(`${API}/jobs`);
        const myPostedJobs = jobsRes.data.filter(job => job.employer_id === user.id);
        setStats({ ...stats, myJobs: myPostedJobs });
      } else if (user.user_type === 'freelancer') {
        const [propsRes, projectsRes] = await Promise.all([
          axios.get(`${API}/proposals/my`),
          axios.get(`${API}/projects`)
        ]);
        setStats({ ...stats, proposals: propsRes.data, projects: projectsRes.data });
      } else if (user.user_type === 'client') {
        const projectsRes = await axios.get(`${API}/projects`);
        const myPostedProjects = projectsRes.data.filter(proj => proj.client_id === user.id);
        setStats({ ...stats, myProjects: myPostedProjects });
      }
    } catch (error) { console.error('Failed to fetch stats:', error); } finally { setLoading(false); }
  };

  if (!user) return <Navigate to="/auth" />;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  if (user.user_type === 'jobseeker') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <JobSeekerDashboard user={user} applications={stats.applications} jobs={stats.jobs} />
        </div>
      </div>
    );
  }

  if (user.user_type === 'employer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmployerDashboard user={user} jobs={stats.myJobs} />
        </div>
      </div>
    );
  }

  if (user.user_type === 'freelancer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FreelancerDashboard user={user} proposals={stats.proposals} projects={stats.projects} />
        </div>
      </div>
    );
  }

  if (user.user_type === 'client') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ClientDashboard user={user} projects={stats.myProjects} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold text-[#222831]">Welcome back, {user.full_name}!</h1></div>
        <div className="grid grid-cols-1 gap-6"><Card><CardHeader><CardTitle>Overview</CardTitle></CardHeader><CardContent><p>Welcome to your dashboard.</p></CardContent></Card></div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

// ==========================================
// 15. MAIN APP
// ==========================================
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/post" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/post" element={<ProtectedRoute><PostProjectPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;