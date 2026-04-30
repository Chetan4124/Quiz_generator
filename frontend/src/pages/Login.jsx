import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Container, Paper, TextField, Button, Typography, Box, Avatar
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData.username, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
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
              Login
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
              Welcome back — enter your credentials to access the NIELIT Question Generator.
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
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Typography align="center">
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}