import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu,
  MenuItem, Avatar
} from '@mui/material';
import logo from '../../assets/image.png';
import { useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import ChatIcon from '@mui/icons-material/Chat';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
      }}
    >
      <Toolbar sx={{ width: '100%', maxWidth: '100%', margin: 0, px: 2, minHeight: 72 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box component={Link} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Box component="img" src={logo} alt="NIELIT" sx={{ height: 52, mr: 1.5, '@media (max-width:600px)': { height: 36 } }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 700, letterSpacing: 0.4, lineHeight: 1 }}>
                NIELIT Question Generator
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', mt: 0.25 }}>
                Create and manage question sets quickly
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            color="inherit"
            startIcon={<DashboardIcon />}
            component={Link}
            to="/dashboard"
          >
            Dashboard
          </Button>
          
          <Button
            color="inherit"
            startIcon={<MenuBookIcon />}
            component={Link}
            to="/topics"
          >
            Topics
          </Button>
          
          <Button
            color="inherit"
            startIcon={<AutoAwesomeIcon />}
            component={Link}
            to="/generate-quiz"
          >
            Generate Quiz
          </Button>
          
          <Button
            color="inherit"
            startIcon={<ChatIcon />}
            component={Link}
            to="/chats"
          >
            Chat with AI
          </Button>
          
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              Signed in as {user?.username}
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}