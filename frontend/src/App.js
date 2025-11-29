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
import { Briefcase, Users, Star, TrendingUp, Search, Sparkles, MapPin, DollarSign, Clock, Bookmark, Bell, MessageSquare, User, Settings, LogOut, FileText, ArrowRight, Plus, Filter, Building2, CheckCircle2, Clock3, Eye, MoreHorizontal, Wallet, Calendar, XCircle, Check } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [salaryFilter, setSalaryFilter] = useState("All");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(response.data);
    } catch (error) { toast.error('Failed to fetch jobs'); } finally { setLoading(false); }
  };

  const formatSalary = (min, max) => (min && max) ? `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L` : 'Negotiable';

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === "All" || job.job_type === typeFilter;
    const matchesCategory = categoryFilter === "All" || job.category === categoryFilter;
    const matchesExperience = experienceFilter === "All" || job.experience_level === experienceFilter;
    
    let matchesSalary = true;
    if (salaryFilter !== "All") {
      const [minRange, maxRange] = salaryFilter.split('-').map(Number);
      if (maxRange) {
         const jobMinLakhs = job.salary_min / 100000;
         const jobMaxLakhs = job.salary_max / 100000;
         matchesSalary = (jobMinLakhs <= maxRange && jobMaxLakhs >= minRange);
      } else {
         const jobMaxLakhs = job.salary_max / 100000;
         matchesSalary = jobMaxLakhs >= minRange;
      }
    }

    return matchesSearch && matchesLocation && matchesType && matchesCategory && matchesExperience && matchesSalary;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00ADB5] py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Find Your Next Job in Architecture, Interior & Construction</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">Discover opportunities from top companies in the AEC industry</p>
          <div className="max-w-4xl mx-auto mt-8 bg-white p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative flex items-center"><Search className="absolute left-3 w-5 h-5 text-gray-400" /><Input placeholder="Job title, keywords, or company" className="pl-10 border-none shadow-none focus-visible:ring-0 text-base h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="hidden md:block w-px bg-gray-200 h-8 self-center"></div>
            <div className="flex-1 relative flex items-center"><MapPin className="absolute left-3 w-5 h-5 text-gray-400" /><Input placeholder="City or location" className="pl-10 border-none shadow-none focus-visible:ring-0 text-base h-12" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} /></div>
            <Button className="h-12 px-8 bg-[#00ADB5] hover:bg-[#009DA5] text-white font-semibold text-lg rounded-lg">Search Jobs</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#222831]">{filteredJobs.length} Jobs Found</h2>
          <Link to="/jobs/post"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Plus className="w-4 h-4 mr-2" />Post a Job</Button></Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm sticky top-24">
              <CardHeader>
                <div className="flex justify-between items-center"><CardTitle className="text-lg">Filters</CardTitle><Button variant="ghost" size="sm" className="text-[#00ADB5] hover:text-[#009DA5] h-auto p-0" onClick={() => { setSearchTerm(""); setLocationFilter(""); setTypeFilter("All"); setCategoryFilter("All"); setExperienceFilter("All"); setSalaryFilter("All"); }}>Clear All</Button></div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2"><Label>Category</Label><Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All Categories</SelectItem><SelectItem value="Architecture">Architecture</SelectItem><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Construction">Construction</SelectItem><SelectItem value="Design">Design</SelectItem><SelectItem value="Interior">Interior Design</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Job Type</Label><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All Types</SelectItem><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Internship">Internship</SelectItem><SelectItem value="Freelance">Freelance</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Experience Level</Label><Select value={experienceFilter} onValueChange={setExperienceFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">Any Experience</SelectItem><SelectItem value="Entry-level">Entry-level (0-2 yrs)</SelectItem><SelectItem value="Mid-level">Mid-level (2-5 yrs)</SelectItem><SelectItem value="Senior">Senior (5-8 yrs)</SelectItem><SelectItem value="Lead">Lead (8+ yrs)</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Salary Range (₹L/year)</Label><Select value={salaryFilter} onValueChange={setSalaryFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">Any Salary</SelectItem><SelectItem value="0-3">0 - 3 LPA</SelectItem><SelectItem value="3-6">3 - 6 LPA</SelectItem><SelectItem value="6-10">6 - 10 LPA</SelectItem><SelectItem value="10-20">10 - 20 LPA</SelectItem><SelectItem value="20+">20+ LPA</SelectItem></SelectContent></Select></div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {loading ? <div className="text-center py-12">Loading jobs...</div> : filteredJobs.length === 0 ? (
              <Card><CardContent className="py-16 text-center"><Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" /><h3 className="text-xl font-semibold text-gray-900">No jobs found</h3><p className="text-gray-500 mt-2">Try adjusting your search or filters</p></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#00ADB5]">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-xl font-bold text-gray-500 uppercase flex-shrink-0">{job.company_name.charAt(0)}</div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div><h3 className="text-xl font-bold text-[#222831] group-hover:text-[#00ADB5] transition-colors"><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3><p className="text-[#393E46] font-medium mt-1">{job.company_name}</p></div>
                            <Badge variant="secondary" className="w-fit bg-[#00ADB5]/10 text-[#00ADB5] hover:bg-[#00ADB5]/20 border-none">{job.category}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-y-2 gap-x-6 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.job_type}</span>
                            <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {formatSalary(job.salary_min, job.salary_max)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                            <div className="flex gap-2">{job.skills.slice(0, 3).map((skill, idx) => (<span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{skill}</span>))}</div>
                            <div className="flex items-center gap-4"><span className="text-xs text-gray-400">Posted {new Date(job.created_at).toLocaleDateString()}</span><Link to={`/jobs/${job.id}`}><Button className="bg-[#00ADB5] hover:bg-[#009DA5]">Apply Now</Button></Link></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
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
              <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Architecture">Architecture</SelectItem><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Construction">Construction</SelectItem><SelectItem value="Design">Design</SelectItem><SelectItem value="Interior">Interior Design</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Job Type</Label><Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Internship">Internship</SelectItem><SelectItem value="Freelance">Freelance</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Experience Level</Label><Select value={formData.experience_level} onValueChange={(value) => setFormData({ ...formData, experience_level: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Entry-level">Entry-level</SelectItem><SelectItem value="Mid-level">Mid-level</SelectItem><SelectItem value="Senior">Senior</SelectItem><SelectItem value="Lead">Lead</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Salary (₹)</Label><Input type="number" value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Max Salary (₹)</Label><Input type="number" value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })} required /></div>
            </div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="inline-flex items-center text-gray-500 hover:text-[#00ADB5] mb-6"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Jobs</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div><h1 className="text-3xl font-bold text-[#222831]">{job.title}</h1><div className="flex items-center gap-2 text-lg text-gray-600 mt-2"><Building2 className="w-5 h-5" /><span className="font-medium">{job.company_name}</span></div></div>
                  <button className="text-gray-400 hover:text-[#00ADB5]"><Bookmark className="w-6 h-6" /></button>
                </div>
                <div className="flex flex-wrap gap-6 mt-6 text-gray-500 text-sm border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.job_type}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {job.experience_level}</div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Posted {new Date(job.created_at).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><Eye className="w-4 h-4" /> {job.views || 0} views</div>
                </div>
                <div className="mt-6"><p className="text-2xl font-bold text-[#00ADB5]">₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L <span className="text-base font-normal text-gray-500 ml-2">per year</span></p></div>
                <div className="flex flex-wrap gap-2 mt-6"><Badge className="bg-[#222831] hover:bg-[#393E46]">{job.category}</Badge>{job.skills.map((skill, idx) => (<Badge key={idx} variant="outline" className="text-[#00ADB5] border-[#00ADB5] bg-[#00ADB5]/5">{skill}</Badge>))}</div>
                <div className="mt-10 space-y-6">
                  <div><h3 className="text-xl font-bold text-[#222831] mb-3">Job Description</h3><p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p></div>
                  <div><h3 className="text-xl font-bold text-[#222831] mb-3">Key Responsibilities & Requirements</h3><ul className="space-y-2">{job.requirements.map((req, idx) => (<li key={idx} className="flex items-start gap-3 text-gray-600"><CheckCircle2 className="w-5 h-5 text-[#00ADB5] mt-0.5 flex-shrink-0" /><span>{req}</span></li>))}</ul></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-6">
                {user && user.user_type !== 'employer' && user.user_type !== 'client' ? (
                  <form onSubmit={handleApply} className="space-y-4"><Button type="submit" className="w-full h-12 text-lg bg-[#00ADB5] hover:bg-[#009DA5] font-bold" disabled={applying}>{applying ? 'Submitting...' : 'Apply Now'}</Button><Textarea placeholder="Write a short cover letter..." className="resize-none" rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} required /></form>
                ) : (<Button className="w-full h-12 text-lg bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed">Login as Job Seeker to Apply</Button>)}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center"><span className="text-gray-600">Applicants</span><span className="font-bold text-[#222831]">{job.applicants_count}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-600">Views</span><span className="font-bold text-[#222831]">{job.views}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-600">Status</span><Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-lg">About {job.company_name}</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600 text-sm leading-relaxed">{job.company_name} is a leading firm in the {job.category} industry, known for delivering excellence and innovation.</p><div className="mt-4 pt-4 border-t border-gray-100"><Button variant="link" className="text-[#00ADB5] p-0 h-auto">View Company Profile</Button></div></CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. POST PROJECT PAGE
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
// 9. PROJECTS PAGE (REDESIGNED)
// ==========================================
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [budgetTypeFilter, setBudgetTypeFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) { toast.error('Failed to fetch projects'); } finally { setLoading(false); }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || project.category === categoryFilter;
    const matchesBudgetType = budgetTypeFilter === "All" || project.budget_type === budgetTypeFilter;
    const matchesDuration = durationFilter === "All" || project.duration === durationFilter;

    return matchesSearch && matchesCategory && matchesBudgetType && matchesDuration;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00ADB5] py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Find Exciting Freelance Projects</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">Work on amazing architectural and engineering projects from top clients</p>
          <div className="max-w-3xl mx-auto mt-8 bg-white p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative flex items-center"><Search className="absolute left-3 w-5 h-5 text-gray-400" /><Input placeholder="Search projects by title or keywords..." className="pl-10 border-none shadow-none focus-visible:ring-0 text-base h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Button className="h-12 px-8 bg-[#00ADB5] hover:bg-[#009DA5] text-white font-semibold text-lg rounded-lg">Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#222831]">{filteredProjects.length} Projects Available</h2>
          <Link to="/projects/post"><Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90"><Plus className="w-4 h-4 mr-2" />Post a Project</Button></Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm sticky top-24">
              <CardHeader>
                <div className="flex justify-between items-center"><CardTitle className="text-lg">Filters</CardTitle><Button variant="ghost" size="sm" className="text-[#00ADB5] hover:text-[#009DA5] h-auto p-0" onClick={() => { setSearchTerm(""); setCategoryFilter("All"); setBudgetTypeFilter("All"); setDurationFilter("All"); }}>Clear All</Button></div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2"><Label>Category</Label><Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All Categories</SelectItem><SelectItem value="Architecture">Architecture</SelectItem><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Interior Design">Interior Design</SelectItem><SelectItem value="3D Modeling">3D Modeling</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Budget Type</Label><Select value={budgetTypeFilter} onValueChange={setBudgetTypeFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">Any Type</SelectItem><SelectItem value="Fixed">Fixed Price</SelectItem><SelectItem value="Hourly">Hourly Rate</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Duration</Label><Select value={durationFilter} onValueChange={setDurationFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">Any Duration</SelectItem><SelectItem value="< 1 month">&lt; 1 month</SelectItem><SelectItem value="1-3 months">1-3 months</SelectItem><SelectItem value="3-6 months">3-6 months</SelectItem><SelectItem value="> 6 months">&gt; 6 months</SelectItem></SelectContent></Select></div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {loading ? <div className="text-center py-12">Loading projects...</div> : filteredProjects.length === 0 ? (
              <Card><CardContent className="py-16 text-center"><FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" /><h3 className="text-xl font-semibold text-gray-900">No projects found</h3><p className="text-gray-500 mt-2">Try adjusting your search or filters</p></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#00ADB5] cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div><h3 className="text-xl font-bold text-[#222831] group-hover:text-[#00ADB5] transition-colors">{project.title}</h3><div className="flex items-center gap-2 mt-2 text-sm text-gray-500"><Clock className="w-4 h-4" /><span>Posted {new Date(project.created_at).toLocaleDateString()}</span><span className="mx-1">•</span><span>{project.proposals_count} Proposals</span></div></div>
                          <Badge variant="secondary" className="bg-[#00ADB5]/10 text-[#00ADB5] hover:bg-[#00ADB5]/20 border-none">{project.budget_type}</Badge>
                        </div>
                        <p className="text-gray-600 line-clamp-2 text-sm">{project.description}</p>
                        <div className="flex items-center gap-6 text-sm font-medium text-gray-700 pt-2">
                          <div className="flex items-center gap-1.5"><Wallet className="w-4 h-4 text-[#00ADB5]" /><span>₹{project.budget_min} - ₹{project.budget_max}</span></div>
                          <div className="flex items-center gap-1.5"><Clock3 className="w-4 h-4 text-[#00ADB5]" /><span>{project.duration}</span></div>
                          <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-[#00ADB5]" /><span>{project.category}</span></div>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100">
                           <div className="flex gap-2">{project.skills && project.skills.slice(0, 3).map((skill, idx) => (<span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{skill}</span>))}</div>
                          <Button variant="ghost" className="text-[#00ADB5] hover:text-[#009DA5] hover:bg-[#00ADB5]/10">View Details <ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. PROJECT DETAIL PAGE (NEW)
// ==========================================
const ProjectDetailPage = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ cover_letter: '', proposed_budget: '', delivery_time: '' });
  const { user } = useAuth();
  const projectId = window.location.pathname.split('/').pop();
  const navigate = useNavigate();

  useEffect(() => { fetchProject(); }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}`);
      setProject(response.data);
    } catch (error) { toast.error('Failed to fetch project'); } finally { setLoading(false); }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to send a proposal'); navigate('/auth'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/proposals`, { project_id: projectId, ...formData, proposed_budget: parseFloat(formData.proposed_budget) });
      toast.success('Proposal sent successfully');
      navigate('/projects');
    } catch (error) { toast.error('Failed to send proposal'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center">Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/projects" className="inline-flex items-center text-gray-500 hover:text-[#00ADB5] mb-6"><ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Projects</Link>
        <Card>
          <CardHeader><CardTitle className="text-3xl">{project.title}</CardTitle><div className="flex gap-2 mt-2"><Badge>{project.category}</Badge><Badge variant="outline">{project.budget_type}</Badge></div></CardHeader>
          <CardContent className="space-y-6">
            <div><h3 className="font-bold mb-2">Description</h3><p className="text-gray-700 whitespace-pre-line">{project.description}</p></div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded"><div><p className="text-sm text-gray-500">Budget</p><p className="font-medium">₹{project.budget_min} - ₹{project.budget_max}</p></div><div><p className="text-sm text-gray-500">Duration</p><p className="font-medium">{project.duration}</p></div></div>
            
            {user && user.user_type === 'freelancer' ? (
              <div className="border-t pt-6">
                <h3 className="font-bold text-xl mb-4">Send Proposal</h3>
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Your Bid (₹)</Label><Input type="number" value={formData.proposed_budget} onChange={e => setFormData({...formData, proposed_budget: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Delivery Time</Label><Input placeholder="e.g. 2 weeks" value={formData.delivery_time} onChange={e => setFormData({...formData, delivery_time: e.target.value})} required /></div>
                  </div>
                  <div className="space-y-2"><Label>Cover Letter</Label><Textarea rows={4} placeholder="Describe your approach..." value={formData.cover_letter} onChange={e => setFormData({...formData, cover_letter: e.target.value})} required /></div>
                  <Button type="submit" className="w-full bg-[#00ADB5]" disabled={submitting}>{submitting ? 'Sending...' : 'Send Proposal'}</Button>
                </form>
              </div>
            ) : (
               !user ? <Button className="w-full bg-gray-200 text-gray-500" onClick={() => navigate('/auth')}>Login as Freelancer to Bid</Button> : null
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// 11. JOB SEEKER DASHBOARD
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
// 12. EMPLOYER DASHBOARD
// ==========================================
const EmployerDashboard = ({ user, jobs, applications, onUpdateStatus }) => {
  const totalJobs = jobs.length;
  const totalApplicants = applications.length; 
  const totalViews = jobs.reduce((acc, job) => acc + (job.views || 0), 0);

  const stats = [
    { title: "Active Jobs", value: totalJobs, icon: Briefcase, color: "text-blue-600" },
    { title: "Total Applicants", value: totalApplicants, icon: Users, color: "text-purple-600" },
    { title: "Total Views", value: totalViews, icon: Eye, color: "text-orange-600" },
    { title: "Hired", value: applications.filter(a => a.status === 'accepted').length, icon: CheckCircle2, color: "text-green-600" },
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
            <CardHeader><CardTitle>Recent Applications</CardTitle><CardDescription>Review and manage candidates</CardDescription></CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12"><Users className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No applications received yet</p></div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const job = jobs.find(j => j.id === app.job_id);
                    return (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                            {app.applicant_id.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#222831]">Applicant ID: {app.applicant_id.substring(0, 8)}</p>
                            <p className="text-sm text-gray-500">Applied for: <span className="font-medium text-[#00ADB5]">{job?.title || 'Unknown Job'}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {app.status === 'pending' ? (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => onUpdateStatus(app.id, 'accepted')}>
                                <Check className="w-4 h-4 mr-1" /> Accept
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => onUpdateStatus(app.id, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </>
                          ) : (
                            <Badge variant="secondary" className="capitalize">{app.status}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Your Active Jobs</CardTitle></CardHeader>
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
                      <div className="text-right">
                        <p className="text-sm font-medium">{job.applicants_count} Applicants</p>
                        <p className="text-xs text-gray-500">{job.views || 0} Views</p>
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
// 13. FREELANCER DASHBOARD
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
// 14. CLIENT DASHBOARD (NEW)
// ==========================================
const ClientDashboard = ({ user, projects, proposals, onUpdateStatus }) => {
  const totalProjects = projects.length;
  const totalProposals = proposals.length; 
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
            <CardHeader><CardTitle>Received Proposals</CardTitle><CardDescription>Review incoming bids from freelancers</CardDescription></CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="text-center py-12"><FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No proposals received yet</p></div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => {
                    const project = projects.find(p => p.id === prop.project_id);
                    return (
                      <div key={prop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                            {prop.freelancer_id.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#222831]">Bid: ₹{prop.proposed_budget}</p>
                            <p className="text-sm text-gray-500">For: <span className="font-medium text-[#00ADB5]">{project?.title || 'Unknown Project'}</span></p>
                            <p className="text-xs text-gray-400">Time: {prop.delivery_time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {prop.status === 'pending' ? (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => onUpdateStatus(prop.id, 'accepted')}>
                                <Check className="w-4 h-4 mr-1" /> Accept
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => onUpdateStatus(prop.id, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </>
                          ) : (
                            <Badge variant="secondary" className="capitalize">{prop.status}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle>Your Active Projects</CardTitle></CardHeader>
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
                      <div className="text-right">
                        <p className="text-sm font-medium">{proj.proposals_count} Proposals</p>
                        <p className="text-xs text-gray-500">{proj.views || 0} Views</p>
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
// 15. DASHBOARD PAGE WRAPPER
// ==========================================
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: [], proposals: [], jobs: [], myJobs: [], projects: [], myProjects: [], incomingProposals: [] });
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
        const appsPromises = myPostedJobs.map(job => axios.get(`${API}/applications/job/${job.id}`));
        const appsResponses = await Promise.all(appsPromises);
        const allApplications = appsResponses.flatMap(res => res.data);
        setStats({ ...stats, myJobs: myPostedJobs, applications: allApplications });

      } else if (user.user_type === 'freelancer') {
        const [propsRes, projectsRes] = await Promise.all([
          axios.get(`${API}/proposals/my`),
          axios.get(`${API}/projects`)
        ]);
        setStats({ ...stats, proposals: propsRes.data, projects: projectsRes.data });
      } else if (user.user_type === 'client') {
        const projectsRes = await axios.get(`${API}/projects`);
        const myPostedProjects = projectsRes.data.filter(proj => proj.client_id === user.id);
        
        // NEW: Fetch proposals for client's projects
        const proposalPromises = myPostedProjects.map(p => axios.get(`${API}/proposals/project/${p.id}`));
        const proposalResponses = await Promise.all(proposalPromises);
        const allProposals = proposalResponses.flatMap(res => res.data);

        setStats({ ...stats, myProjects: myPostedProjects, incomingProposals: allProposals });
      }
    } catch (error) { console.error('Failed to fetch stats:', error); } finally { setLoading(false); }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      await axios.put(`${API}/applications/${appId}`, { status: newStatus });
      toast.success(`Application ${newStatus}`);
      fetchStats();
    } catch (error) { toast.error("Failed to update status"); }
  };

  const handleUpdatePropStatus = async (propId, newStatus) => {
    try {
      await axios.put(`${API}/proposals/${propId}`, { status: newStatus });
      toast.success(`Proposal ${newStatus}`);
      fetchStats();
    } catch (error) { toast.error("Failed to update status"); }
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
          <EmployerDashboard user={user} jobs={stats.myJobs} applications={stats.applications} onUpdateStatus={handleUpdateAppStatus} />
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
          <ClientDashboard user={user} projects={stats.myProjects} proposals={stats.incomingProposals} onUpdateStatus={handleUpdatePropStatus} />
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
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

// ==========================================
// 16. MAIN APP
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
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/post" element={<ProtectedRoute><PostProjectPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;