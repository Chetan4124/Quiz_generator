import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Container, Paper, TextField, Button, Typography, Box, Avatar,
  InputAdornment, IconButton, Divider, Stepper, Step, StepLabel
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data || 'Registration failed';
      toast.error(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        },
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
            width: '100%',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                boxShadow: '0 8px 32px rgba(236,72,153,0.3)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
                background: 'linear-gradient(135deg, #1e293b 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create Account
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" color="text.secondary">
              Join NIELIT Generator and start creating questions
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#6366f1' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: '#ec4899' },
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#6366f1' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: '#ec4899' },
                },
              }}
            />
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#6366f1' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: '#ec4899' },
                },
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? null : <PersonAddIcon />}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                boxShadow: '0 8px 24px rgba(236,72,153,0.3)',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(236,72,153,0.5)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#ec4899',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}