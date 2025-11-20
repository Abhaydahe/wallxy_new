import { useState, useEffect, createContext, useContext } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Briefcase, Users, Star, TrendingUp, Search, Sparkles, MapPin, DollarSign, Clock, Bookmark, Bell, MessageSquare, User, Settings, LogOut, FileText, ArrowRight, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
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

// Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth();

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
                <Button variant="ghost" className="text-[#393E46] hover:text-[#00ADB5]" data-testid="nav-jobs-btn">
                  Jobs
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="ghost" className="text-[#393E46] hover:text-[#00ADB5]" data-testid="nav-projects-btn">
                  Projects
                </Button>
              </Link>
              {user && (
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-[#393E46] hover:text-[#00ADB5]" data-testid="nav-dashboard-btn">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="user-menu-trigger">
                    <Avatar>
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
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard'} data-testid="menu-dashboard">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="menu-logout" className="text-red-600" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90" data-testid="nav-login-btn">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Home Page
const HomePage = () => {
  const features = [
    {
      icon: Search,
      title: 'Smart Job Matching',
      description: 'AI-powered job recommendations tailored to your skills and experience',
    },
    {
      icon: Users,
      title: 'Top Talent Pool',
      description: 'Connect with verified professionals in architecture, engineering, and construction',
    },
    {
      icon: Sparkles,
      title: 'AI Tools',
      description: 'Automated proposal generation, resume improvement, and contract drafting',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Track your progress and discover opportunities for professional advancement',
    },
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
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Your Gateway to AEC Excellence
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Connect with opportunities in Architecture, Engineering & Construction.
                Find jobs, hire talent, and grow your career with AI-powered matching.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/jobs">
                  <Button size="lg" className="bg-white text-[#00ADB5] hover:bg-white/90 h-14 px-8" data-testid="hero-find-jobs-btn">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Find Jobs
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8" data-testid="hero-browse-projects-btn">
                    <Users className="w-5 h-5 mr-2" />
                    Browse Projects
                  </Button>
                </Link>
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#222831] mb-4">
              Why Choose Wallxy?
            </h2>
            <p className="text-xl text-gray-600">
              The most advanced platform for AEC professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-[#00ADB5] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-[#00ADB5]/10 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-[#00ADB5]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#222831] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#00ADB5] to-[#00ADB5]/80 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of professionals and companies transforming the AEC industry
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-[#00ADB5] hover:bg-white/90 h-14 px-8" data-testid="cta-get-started-btn">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Auth Page
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('jobseeker');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = (path) => window.location.href = path;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Successfully logged in!');
      } else {
        await register(email, password, fullName, userType);
        toast.success('Account created successfully!');
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
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#222831]">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  data-testid="auth-fullname-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="auth-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="auth-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="userType">I am a</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger data-testid="auth-usertype-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jobseeker">Job Seeker</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90"
              disabled={loading}
              data-testid="auth-submit-btn"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#00ADB5] hover:underline"
                data-testid="auth-toggle-btn"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Jobs Page
const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
    }
    return 'Negotiable';
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="jobs-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#222831]">Browse Jobs</h1>
            <p className="text-gray-600 mt-2">Discover opportunities in AEC industry</p>
          </div>
          <Link to="/jobs/post">
            <Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90" data-testid="post-job-btn">
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No jobs available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow border-2 hover:border-[#00ADB5]" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-[#222831]">
                        <Link to={`/jobs/${job.id}`} className="hover:text-[#00ADB5] transition-colors">
                          {job.title}
                        </Link>
                      </CardTitle>
                      <p className="text-[#393E46] font-medium">{job.company_name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 items-center text-sm text-[#393E46]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.job_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.experience_level}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-[#EEEEEE] text-[#222831]">
                        {job.category}
                      </Badge>
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="border-[#00ADB5] text-[#00ADB5]">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="border-gray-300">
                          +{job.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-sm text-gray-500">
                        {job.applicants_count} applicants
                      </span>
                      <Link to={`/jobs/${job.id}`}>
                        <Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90" data-testid={`apply-btn-${job.id}`}>
                          Apply Now
                        </Button>
                      </Link>
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

// Job Detail Page
const JobDetailPage = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { user } = useAuth();
  const jobId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`${API}/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to apply');
      window.location.href = '/auth';
      return;
    }

    setApplying(true);
    try {
      await axios.post(`${API}/applications`, {
        job_id: jobId,
        cover_letter: coverLetter,
      });
      toast.success('Application submitted successfully!');
      setCoverLetter('');
      fetchJob();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="job-detail-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-[#222831]">{job.title}</CardTitle>
            <p className="text-xl text-[#393E46] mt-2">{job.company_name}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge className="bg-[#00ADB5]">{job.job_type}</Badge>
              <Badge variant="outline">{job.experience_level}</Badge>
              <Badge variant="outline">{job.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="text-gray-700">{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-[#00ADB5] text-[#00ADB5]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Salary Range</p>
                <p className="font-medium">₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L</p>
              </div>
            </div>

            {user && user.user_type !== 'employer' && user.user_type !== 'client' && (
              <form onSubmit={handleApply} className="space-y-4" data-testid="apply-form">
                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    data-testid="cover-letter-input"
                    placeholder="Tell the employer why you're a great fit..."
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90"
                  disabled={applying}
                  data-testid="submit-application-btn"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Post Job Page
const PostJobPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    description: '',
    requirements: '',
    category: 'Architecture',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary_min: '',
    salary_max: '',
    location: '',
    skills: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post a job');
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/jobs`, {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        salary_min: parseFloat(formData.salary_min),
        salary_max: parseFloat(formData.salary_max),
      });
      toast.success('Job posted successfully!');
      window.location.href = '/jobs';
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="post-job-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post a Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="post-job-form">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  data-testid="job-title-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  data-testid="job-company-input"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="job-description-input"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  data-testid="job-requirements-input"
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="job-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Architecture">Architecture</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type</Label>
                  <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}>
                    <SelectTrigger data-testid="job-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select value={formData.experience_level} onValueChange={(value) => setFormData({ ...formData, experience_level: value })}>
                  <SelectTrigger data-testid="job-experience-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry-level">Entry-level</SelectItem>
                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Min Salary (₹)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    data-testid="job-salary-min-input"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Max Salary (₹)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    data-testid="job-salary-max-input"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  data-testid="job-location-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  data-testid="job-skills-input"
                  placeholder="AutoCAD, Revit, Project Management"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90"
                disabled={loading}
                data-testid="submit-job-btn"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Projects Page
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="projects-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#222831]">Browse Projects</h1>
            <p className="text-gray-600 mt-2">Find freelance opportunities</p>
          </div>
          <Link to="/projects/post">
            <Button className="bg-[#00ADB5] hover:bg-[#00ADB5]/90" data-testid="post-project-btn">
              <Plus className="w-4 h-4 mr-2" />
              Post a Project
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No projects available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow border-2 hover:border-[#00ADB5]" data-testid={`project-card-${project.id}`}>
                <CardHeader>
                  <CardTitle className="text-xl text-[#222831]">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{project.description.substring(0, 200)}...</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-[#00ADB5]">{project.category}</Badge>
                    <Badge variant="outline">{project.budget_type}</Badge>
                    <Badge variant="outline">{project.duration}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      ₹{(project.budget_min / 1000).toFixed(0)}k - ₹{(project.budget_max / 1000).toFixed(0)}k
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.proposals_count} proposals
                    </span>
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

// Dashboard Page
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: [],
    proposals: [],
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      if (user.user_type === 'jobseeker' || user.user_type === 'freelancer') {
        const [appsRes, propsRes] = await Promise.all([
          axios.get(`${API}/applications/my`),
          axios.get(`${API}/proposals/my`),
        ]);
        setStats({
          applications: appsRes.data,
          proposals: propsRes.data,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222831]">Welcome back, {user.full_name}!</h1>
          <p className="text-gray-600 mt-2">Here's your activity overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profile Rating</p>
                  <p className="text-2xl font-bold text-[#222831]">{user.rating.toFixed(1)}</p>
                </div>
                <Star className="w-8 h-8 text-[#00ADB5]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Projects</p>
                  <p className="text-2xl font-bold text-[#222831]">{user.completed_projects}</p>
                </div>
                <Briefcase className="w-8 h-8 text-[#00ADB5]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="text-2xl font-bold text-[#222831] capitalize">{user.user_type}</p>
                </div>
                <User className="w-8 h-8 text-[#00ADB5]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.applications.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No applications yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">{app.job_id.substring(0, 8)}...</span>
                      <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.proposals.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No proposals yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.proposals.slice(0, 5).map((prop) => (
                    <div key={prop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">₹{(prop.proposed_budget / 1000).toFixed(0)}k</span>
                      <Badge variant={prop.status === 'pending' ? 'secondary' : 'default'}>
                        {prop.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

// Main App
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/post" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
