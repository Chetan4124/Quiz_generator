import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTopics, getSessions } from '../api/quiz';
import { getChatSessions } from '../api/chats';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Button, Card, CardContent,
  CardActions, CircularProgress, Box, Chip, Stack, Avatar, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import ChatIcon from '@mui/icons-material/Chat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

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

  useEffect(() => {
    if (!loading) {
      const items = Array.from(document.querySelectorAll('.card, .recent-card'));
      items.forEach((el, i) => {
        el.classList.add('reveal-hidden');
        setTimeout(() => {
          el.classList.remove('reveal-hidden');
          el.classList.add('reveal');
        }, 80 * i + 50);
      });
    }
  }, [loading]);

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
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="subtitle2" color="text.secondary">Overview of your question generator — quick insights</Typography>
        </Box>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/questions/create')}>Add Question</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper className="card card-1">
            <Typography variant="subtitle2" className="stat-label">Topics</Typography>
            <div className="stat-number">{stats.topics}</div>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>Manage and browse topic sets</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper className="card card-2">
            <Typography variant="subtitle2" className="stat-label">Questions</Typography>
            <div className="stat-number">{stats.questions}</div>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.95 }}>Multiple formats and difficulty levels</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper className="card card-3">
            <Typography variant="subtitle2" className="stat-label">Sessions</Typography>
            <div className="stat-number">{stats.sessions}</div>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.95 }}>Review past quiz runs</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper className="card card-4">
            <Typography variant="subtitle2" className="stat-label">Chats</Typography>
            <div className="stat-number">{stats.chats}</div>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>AI-assisted question generation</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Recent Topics</Typography>
      <Grid container spacing={2}>
        {recentTopics.map((t) => (
          <Grid item xs={12} md={4} key={t.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.18s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  <MenuBookIcon />
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t.description || 'No description provided.'}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip icon={<QuizIcon />} label={`${t.question_count || 0} questions`} size="small" />
                    <Chip label={t.difficulty || 'Mixed'} size="small" />
                  </Stack>
                </Box>
              </CardContent>

              <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                <Tooltip title="View Topic">
                  <IconButton size="small" onClick={() => navigate(`/topics/${t.id}`)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Topic">
                  <IconButton size="small" onClick={() => navigate(`/questions/create/${t.id}`)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}