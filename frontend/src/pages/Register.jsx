import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Container, Paper, TextField, Button, Typography, Box, Avatar
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data || 'Registration failed';
      toast.error(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 1 }}>
              <SchoolIcon />
            </Avatar>
            <Typography variant="h5" align="center" gutterBottom>
              NIELIT Question Generator
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
              Register
            </Typography>

            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
              Create an account to start generating questions and managing topics with NIELIT.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.1 }}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <Typography align="center">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
