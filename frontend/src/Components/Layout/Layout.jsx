import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Box, Typography } from '@mui/material';

export default function Layout() {
  const location = useLocation();
  const path = location.pathname.split('/')[1] || 'dashboard';
  const pageClass = `page-${path || 'dashboard'}`;
  return (
    <Box className={pageClass} sx={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, width: '100%', maxWidth: '100%', margin: '24px 16px', px: 2 }}>
        <Box component="aside" className="sidebar" sx={{ borderRadius: 2, bgcolor: 'background.paper', boxShadow: 'var(--shadow)' }}>
          <Sidebar />
        </Box>

        <Box component="main" className="main-content">
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Ready to create your next quiz? Explore topics or generate one in seconds.
              </Typography>
            </Box>
            <Outlet />
        </Box>
      </Box>
    </Box>
  );
}