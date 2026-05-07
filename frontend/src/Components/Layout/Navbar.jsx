import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu,
  MenuItem, Avatar, Chip, Tooltip, Divider, Badge, alpha
} from '@mui/material';
import logo from '../../assets/image.png';
import { useState } from 'react';
import {
  School as SchoolIcon,
  Chat as ChatIcon,
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  AutoAwesome as AutoAwesomeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Notifications as NotificationsIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Topics', icon: <MenuBookIcon />, path: '/topics' },
  { label: 'Generate Quiz', icon: <AutoAwesomeIcon />, path: '/generate-quiz', highlight: true },
  { label: 'AI Chat', icon: <ChatIcon />, path: '/chats' },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(255,255,255,0.08)',
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: '64px !important', gap: 2 }}>
        {/* Logo Section */}
        <Box
          component={Link}
          to="/dashboard"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            mr: 2,
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="NIELIT"
            sx={{
              height: 40,
              mr: 1.5,
              filter: 'brightness(1.1)',
              '@media (max-width:600px)': { height: 32 },
            }}
          />
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1rem',
                letterSpacing: '-0.3px',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              NIELIT Generator
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.65rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Question Engine
            </Typography>
          </Box>
        </Box>

        {/* Navigation Items */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            gap: 0.5,
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  borderRadius: '10px',
                  position: 'relative',
                  background: item.highlight
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(239,68,68,0.2) 100%)'
                    : 'transparent',
                  border: item.highlight ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
                  '&:hover': {
                    background: item.highlight
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(239,68,68,0.3) 100%)'
                      : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  },
                  '&::after': isActive ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 3,
                    bgcolor: '#6366f1',
                    borderRadius: '4px 4px 0 0',
                  } : {},
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          {/* Generate CTA - Mobile */}
          <Button
            component={Link}
            to="/generate-quiz"
            variant="contained"
            size="small"
            startIcon={<AutoAwesomeIcon />}
            sx={{
              display: { xs: 'flex', lg: 'none' },
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
              },
            }}
          >
            Generate
          </Button>

          {/* User Avatar */}
          <Tooltip title="Account">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                p: 0.5,
                border: '2px solid',
                borderColor: anchorEl ? '#6366f1' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#6366f1',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: '16px',
                minWidth: 220,
                boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  right: 20,
                  width: 16,
                  height: 16,
                  bgcolor: 'background.paper',
                  transform: 'rotate(45deg)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRight: 'none',
                  borderBottom: 'none',
                },
              },
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    fontWeight: 700,
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {user?.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Question Creator
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="Pro Plan"
                size="small"
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>

            <Divider />

            {/* Menu Items */}
            <MenuItem
              onClick={() => { setAnchorEl(null); navigate('/dashboard'); }}
              sx={{ py: 1.2, px: 2, gap: 1.5 }}
            >
              <DashboardIcon fontSize="small" sx={{ color: '#6366f1' }} />
              <Typography variant="body2">Dashboard</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => { setAnchorEl(null); navigate('/topics'); }}
              sx={{ py: 1.2, px: 2, gap: 1.5 }}
            >
              <MenuBookIcon fontSize="small" sx={{ color: '#ec4899' }} />
              <Typography variant="body2">Topics</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => { setAnchorEl(null); navigate('/chats'); }}
              sx={{ py: 1.2, px: 2, gap: 1.5 }}
            >
              <ChatIcon fontSize="small" sx={{ color: '#06b6d4' }} />
              <Typography variant="body2">AI Chat</Typography>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.2, px: 2, gap: 1.5 }}>
              <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
              <Typography variant="body2" color="error">Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}