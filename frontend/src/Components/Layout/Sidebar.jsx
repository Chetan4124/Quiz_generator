import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Typography, Chip, Button, alpha
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  AutoAwesome as AutoAwesomeIcon,
  Chat as ChatIcon,
  Quiz as QuizIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Lightbulb as LightbulbIcon,
  RocketLaunch as RocketIcon,
} from '@mui/icons-material';

const menuItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#6366f1' },
      { label: 'Topics', icon: <MenuBookIcon />, path: '/topics', color: '#ec4899' },
      { label: 'Quiz Sessions', icon: <HistoryIcon />, path: '/quiz-sessions', color: '#06b6d4' },
    ],
  },
  {
    section: 'AI Tools',
    items: [
      { label: 'Generate Quiz', icon: <AutoAwesomeIcon />, path: '/generate-quiz', color: '#f59e0b', badge: 'AI' },
      { label: 'Chat Assistant', icon: <ChatIcon />, path: '/chats', color: '#8b5cf6' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ px: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <RocketIcon sx={{ color: '#6366f1', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'text.secondary' }}>
            Workspace
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          Navigate your question generator
        </Typography>
      </Box>

      {/* Quick Create Button */}
      <Button
        component={Link}
        to="/generate-quiz"
        variant="contained"
        fullWidth
        startIcon={<AutoAwesomeIcon />}
        sx={{
          mb: 2,
          py: 1.2,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          fontWeight: 700,
          fontSize: '0.85rem',
          textTransform: 'none',
          boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        Generate Quiz
      </Button>

      <Divider sx={{ mb: 2 }} />

      {/* Navigation Sections */}
      {menuItems.map((section) => (
        <Box key={section.section} sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1,
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: 'text.disabled',
              mb: 0.5,
              display: 'block',
            }}
          >
            {section.section}
          </Typography>
          <List sx={{ p: 0 }}>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: '10px',
                    mb: 0.3,
                    py: 1.1,
                    px: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: isActive ? alpha(item.color, 0.08) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(item.color, 0.06),
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 24,
                      bgcolor: item.color,
                      borderRadius: '0 4px 4px 0',
                    } : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? item.color : 'text.secondary',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'text.primary' : 'text.secondary',
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}88 100%)`,
                        color: '#fff',
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}

      {/* Footer */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            p: 2,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%)',
            border: '1px solid',
            borderColor: '#e0e7ff',
          }}
        >
          <LightbulbIcon sx={{ color: '#f59e0b', fontSize: 24, mb: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
            Pro Tip
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.5 }}>
            Use AI Generate for instant questions. Combine with manual creation for best results.
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 2,
            color: 'text.disabled',
            fontSize: '0.65rem',
          }}
        >
          NIELIT Generator v1.0
        </Typography>
      </Box>
    </Box>
  );
}
