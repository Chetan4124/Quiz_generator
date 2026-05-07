import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Box, Typography, alpha } from '@mui/material';

export default function Layout() {
  const location = useLocation();
  const path = location.pathname.split('/')[1] || 'dashboard';
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navbar - Fixed at top */}
      <Navbar />

      {/* Main Content Area */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          mt: '64px', // Navbar height
        }}
      >
        {/* Sidebar */}
        <Box
          component="aside"
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: '#fff',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
            overflow: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { 
              background: '#cbd5e1', 
              borderRadius: 4,
            },
          }}
        >
          <Sidebar />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          {/* Page Header */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '1.8rem' },
                color: '#0f172a',
                textTransform: 'capitalize',
              }}
            >
              {path === 'dashboard' ? 'Dashboard' : path.replace(/-/g, ' ')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Ready to create your next quiz? Explore topics or generate one in seconds.
            </Typography>
          </Box>

          {/* Page Content */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}