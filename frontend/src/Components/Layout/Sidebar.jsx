import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatIcon from '@mui/icons-material/Chat';

export default function Sidebar() {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, px: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Workspace</Typography>
        <Typography variant="caption" color="text.secondary">Quick links</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tools & shortcuts to manage topics, quizzes, and chats.
        </Typography>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <List>
        <ListItemButton component={Link} to="/dashboard">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton component={Link} to="/topics">
          <ListItemIcon><MenuBookIcon /></ListItemIcon>
          <ListItemText primary="Topics" />
        </ListItemButton>

        <ListItemButton component={Link} to="/generate-quiz">
          <ListItemIcon><AutoAwesomeIcon /></ListItemIcon>
          <ListItemText primary="Generate Quiz" />
        </ListItemButton>

        <ListItemButton component={Link} to="/chats">
          <ListItemIcon><ChatIcon /></ListItemIcon>
          <ListItemText primary="Chat" />
        </ListItemButton>
      </List>
    </Box>
  );
}
