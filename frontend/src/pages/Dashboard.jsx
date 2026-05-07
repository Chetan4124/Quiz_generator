import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTopics, getSessions } from '../api/quiz';
import { getChatSessions } from '../api/chats';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Button, Card, CardContent,
  CardActions, CircularProgress, Box, Chip, Avatar, IconButton, 
  Tooltip, Divider, alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Quiz as QuizIcon,
  Chat as ChatIcon,
  MenuBook as MenuBookIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  History as HistoryIcon,
  RocketLaunch as RocketIcon,
  Lightbulb as LightbulbIcon,
  ArrowForward as ArrowForwardIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ topics: 0, questions: 0, sessions: 0, chats: 0 });
  const [recentTopics, setRecentTopics] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [topicsRes, sessionsRes, chatsRes] = await Promise.all([
        getTopics(),
        getSessions(),
        getChatSessions(),
      ]);

      const topics = topicsRes.data || [];
      const sessions = sessionsRes.data || [];
      const chats = chatsRes.data || [];

      setStats({
        topics: topics.length || 0,
        questions: topics.reduce((acc, t) => acc + (t.question_count || 0), 0) || 0,
        sessions: sessions.length || 0,
        chats: chats.length || 0,
      });

      setRecentTopics(topics.slice(0, 6));
      setRecentSessions(sessions.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  const statCards = [
    {
      label: 'Topics',
      value: stats.topics,
      icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      bgLight: '#eef2ff',
      description: 'Active topic collections',
      path: '/topics',
    },
    {
      label: 'Questions',
      value: stats.questions,
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      bgLight: '#fdf2f8',
      description: 'MCQ, True/False & more',
      path: '/topics',
    },
    {
      label: 'Sessions',
      value: stats.sessions,
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      bgLight: '#ecfeff',
      description: 'Quiz sessions completed',
      path: '/quiz-sessions',
    },
    {
      label: 'AI Chats',
      value: stats.chats,
      icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      bgLight: '#fffbeb',
      description: 'AI-assisted conversations',
      path: '/chats',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          borderRadius: '0 0 40px 40px',
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 5 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            left: '20%',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#fff',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                Welcome back, {user?.username || 'User'} 👋
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  mt: 1,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                }}
              >
                Your NIELIT Question Generator at a glance
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => navigate('/generate-quiz')}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 3,
                  py: 1.5,
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Generate Quiz
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/questions/create')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 3,
                  py: 1.5,
                  borderRadius: '16px',
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Add Question
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="lg">
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 60px ${alpha(stat.color, 0.2)}`,
                    borderColor: stat.color,
                    '& .stat-icon': {
                      transform: 'scale(1.1) rotate(-5deg)',
                    },
                    '& .stat-number': {
                      color: stat.color,
                    },
                  },
                }}
                onClick={() => navigate(stat.path)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    className="stat-icon"
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: stat.bgLight,
                      color: stat.color,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 20, mt: 1 }} />
                </Box>
                <Typography 
                  className="stat-number"
                  sx={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 800, 
                    lineHeight: 1,
                    mb: 0.5,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {stat.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.description}
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: stat.gradient,
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <RocketIcon sx={{ color: '#6366f1' }} />
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Generate AI Quiz', icon: <AutoAwesomeIcon />, path: '/generate-quiz', color: '#f59e0b', desc: 'Create questions with AI' },
              { label: 'Browse Topics', icon: <MenuBookIcon />, path: '/topics', color: '#6366f1', desc: 'View all topics' },
              { label: 'Create Question', icon: <AddIcon />, path: '/questions/create', color: '#ec4899', desc: 'Add manually' },
              { label: 'Bulk Upload', icon: <CloudUploadIcon />, path: '/bulk-upload', color: '#10b981', desc: 'Import from file' },
              { label: 'Chat with AI', icon: <ChatIcon />, path: '/chats', color: '#06b6d4', desc: 'Get help from AI' },
            ].map((action, i) => (
              <Grid item xs={6} sm={4} md={2.4} key={i}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      borderColor: action.color,
                      bgcolor: alpha(action.color, 0.04),
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 1.5,
                        bgcolor: alpha(action.color, 0.1),
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {action.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {action.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Topics */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <SchoolIcon sx={{ color: '#ec4899' }} />
              Recent Topics
            </Typography>
            <Button 
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/topics')}
              sx={{ fontWeight: 600 }}
            >
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {recentTopics.length > 0 ? recentTopics.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
                      '& .topic-avatar': {
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar
                        className="topic-avatar"
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: '#eef2ff',
                          color: '#6366f1',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <MenuBookIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            fontSize: '1.05rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mt: 0.5,
                          }}
                        >
                          {t.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={<QuizIcon sx={{ fontSize: 14 }} />}
                            label={`${t.question_count || 0} Q`}
                            size="small"
                            sx={{ 
                              borderRadius: '8px',
                              bgcolor: '#eef2ff',
                              color: '#6366f1',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                          <Chip 
                            label={t.difficulty || 'Mixed'}
                            size="small"
                            sx={{ 
                              borderRadius: '8px',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); navigate(`/topics/${t.id}`); }}
                        sx={{ color: '#6366f1' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Question">
                      <IconButton 
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate(`/questions/create/${t.id}`); }}
                        sx={{ color: '#ec4899' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: '20px',
                    bgcolor: '#f8fafc',
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <LightbulbIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    No Topics Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first topic to start generating questions
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/topics')}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      borderRadius: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Create Topic
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        
        body {
          background: #f8fafc;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .MuiPaper-root {
          animation: fadeInUp 0.5s ease forwards;
        }
      `}</style>
    </Box>
  );
}