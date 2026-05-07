import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTopics } from '../api/quiz';
import toast from 'react-hot-toast';
import {
  Container, Typography, Button, Box, Grid, Paper, Card, CardContent,
  Avatar, Divider, TextField, InputAdornment, IconButton, Chip,
  alpha, CircularProgress, Stack
} from '@mui/material';
import {
  School as SchoolIcon,
  AutoAwesome as AutoAwesomeIcon,
  Quiz as QuizIcon,
  Chat as ChatIcon,
  MenuBook as MenuBookIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowForwardIcon,
  AccountBalance as EmblemIcon,
  Language as LanguageIcon,
  Groups as GroupsIcon,
  Assessment as AssessmentIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';

export default function Landing() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ topics: 0, questions: 0 });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      const response = await getTopics();
      const topics = response.data || [];
      setStats({
        topics: topics.length,
        questions: topics.reduce((acc, t) => acc + (t.question_count || 0), 0),
      });
    } catch (error) {} finally {
      setStatsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f0' }}>
      {/* Top Government Header Bar */}
      <Box sx={{ bgcolor: '#1a1a2e', py: 0.8, px: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}>
              <EmblemIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ fontSize: '0.7rem', letterSpacing: '0.5px', opacity: 0.9 }}>
                Government of India
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', cursor: 'pointer', '&:hover': { color: '#fff' } }}>
                Skip to Main Content
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', cursor: 'pointer', '&:hover': { color: '#fff' } }}>
                Screen Reader Access
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>A+</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>A</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>A-</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)' }}>
                <LanguageIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>English</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Header with Logo */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '3px solid #f59e0b', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#1a1a2e', mx: 'auto', mb: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Avatar>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#666', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                National Institute of Electronics & Information Technology
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.5px' }}>
                NIELIT Question Generator
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                Ministry of Electronics & Information Technology, Government of India
              </Typography>
            </Box>
            <Avatar sx={{ width: 70, height: 70, bgcolor: 'transparent' }}>
              <EmblemIcon sx={{ fontSize: 50, color: '#1a1a2e' }} />
            </Avatar>
          </Box>
        </Container>
      </Box>

      {/* Navigation Bar */}
      <Box sx={{ bgcolor: '#1a1a2e', py: 1.2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, md: 4 }, flexWrap: 'wrap' }}>
            {['Home', 'About NIELIT', 'Scheme', 'Student Zone', 'Contact Us'].map((item) => (
              <Typography
                key={item}
                sx={{
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  px: 1,
                  '&:hover': { color: '#f59e0b' },
                  transition: 'color 0.2s',
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Hero Banner */}
      <Box sx={{ bgcolor: '#e8ecf1', borderBottom: '1px solid #d0d5dd', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip
            label="DIGITAL INDIA INITIATIVE"
            size="small"
            sx={{
              mb: 2,
              bgcolor: '#1a1a2e',
              color: '#f59e0b',
              fontWeight: 700,
              borderRadius: '4px',
              fontSize: '0.7rem',
              letterSpacing: '1px',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.6rem', md: '2.2rem' },
              color: '#1a1a2e',
              mb: 2,
              lineHeight: 1.3,
            }}
          >
            AI-Powered Question Generation for NIELIT Examinations
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#555',
              fontSize: { xs: '0.9rem', md: '1.05rem' },
              mb: 4,
              maxWidth: 650,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            A comprehensive platform for generating, managing, and organizing examination questions 
            aligned with NIELIT syllabus. Built with advanced AI technology to support educators and students.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              href="#login-section"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: '4px',
                fontSize: '0.95rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#1a1a2e',
                '&:hover': { bgcolor: '#2d2d4e' },
              }}
            >
              Login to Portal
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArticleIcon />}
              component={Link}
              to="/register"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: '4px',
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#1a1a2e',
                color: '#1a1a2e',
                '&:hover': { borderColor: '#1a1a2e', bgcolor: 'rgba(26,26,46,0.04)' },
              }}
            >
              New Registration
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ bgcolor: '#fff', py: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="md">
          <Grid container spacing={2} justifyContent="center">
            {[
              { label: 'Total Questions', value: stats.questions, icon: <QuizIcon /> },
              { label: 'Topics Available', value: stats.topics, icon: <MenuBookIcon /> },
              { label: 'Active Users', value: '1,200+', icon: <GroupsIcon /> },
              { label: 'Question Types', value: '4', icon: <AssessmentIcon /> },
            ].map((stat, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Box sx={{ textAlign: 'center', p: 2, borderRight: i < 3 ? '1px solid #e0e0e0' : 'none' }}>
                  <Box sx={{ color: '#1a1a2e', mb: 0.5 }}>{stat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1.3rem' }}>
                    {statsLoading ? '-' : stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Left - Information */}
          <Grid item xs={12} md={7}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, fontSize: '1.3rem' }}>
              About the Portal
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#f59e0b', borderWidth: 2, width: 60 }} />

            <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.8, mb: 3, fontSize: '0.9rem' }}>
              The NIELIT Question Generator is an innovative platform designed to assist educators, 
              trainers, and students in creating high-quality examination questions aligned with NIELIT 
              (National Institute of Electronics & Information Technology) syllabus and standards.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { icon: <AutoAwesomeIcon />, title: 'AI Generation', desc: 'Generate questions instantly using advanced AI technology' },
                { icon: <MenuBookIcon />, title: 'Topic Management', desc: 'Organize questions by topics and subtopics efficiently' },
                { icon: <QuizIcon />, title: 'Multiple Formats', desc: 'MCQ, True/False, Short Answer & Fill in Blanks' },
                { icon: <ChatIcon />, title: 'AI Assistant', desc: 'Chat with AI for explanations and study support' },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#e8ecf1', color: '#1a1a2e' }}>
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ bgcolor: '#fff8e1', p: 2.5, borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                📢 Important Notice
              </Typography>
              <Typography variant="caption" sx={{ color: '#555', fontSize: '0.78rem' }}>
                This portal is for educational purposes. All generated questions should be reviewed 
                before use in actual examinations. The AI model provides assistance but final verification 
                rests with the educator.
              </Typography>
            </Box>
          </Grid>

          {/* Right - Login Box */}
          <Grid item xs={12} md={5} id="login-section">
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '4px',
                border: '1px solid #d0d5dd',
                bgcolor: '#fff',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#1a1a2e', mx: 'auto', mb: 1.5 }}>
                  <LoginIcon sx={{ color: '#f59e0b' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
                  Registered User Login
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Enter your credentials to access the portal
                </Typography>
              </Box>

              <form onSubmit={handleLogin}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a2e', display: 'block', mb: 0.5 }}>
                  Username <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                  size="small"
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      bgcolor: '#fafafa',
                    },
                  }}
                />

                <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a2e', display: 'block', mb: 0.5 }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      bgcolor: '#fafafa',
                    },
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{ color: '#1a1a2e', display: 'block', textAlign: 'right', mb: 2.5, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  Forgot Password?
                </Typography>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.3,
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: '#1a1a2e',
                    '&:hover': { bgcolor: '#2d2d4e' },
                    mb: 2,
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </form>

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ color: '#999', px: 1 }}>
                  New User
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/register"
                startIcon={<PersonAddIcon />}
                sx={{
                  py: 1.2,
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#1a1a2e',
                  color: '#1a1a2e',
                  '&:hover': { borderColor: '#1a1a2e', bgcolor: 'rgba(26,26,46,0.04)' },
                }}
              >
                Create New Account
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a2e', py: 4, mt: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                Quick Links
              </Typography>
              {['NIELIT Official Website', 'Student Zone', 'Examination Schedule', 'Syllabus'].map((link) => (
                <Typography key={link} variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 0.5, cursor: 'pointer', '&:hover': { color: '#fff' } }}>
                  {link}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                Contact
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 0.5 }}>
                NIELIT Bhawan, New Delhi
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 0.5 }}>
                Email: support@nielit.gov.in
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                Policies
              </Typography>
              {['Terms & Conditions', 'Privacy Policy', 'Copyright Policy'].map((link) => (
                <Typography key={link} variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 0.5, cursor: 'pointer', '&:hover': { color: '#fff' } }}>
                  {link}
                </Typography>
              ))}
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block' }}>
            © 2026 NIELIT Question Generator | National Institute of Electronics & Information Technology | All Rights Reserved
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}