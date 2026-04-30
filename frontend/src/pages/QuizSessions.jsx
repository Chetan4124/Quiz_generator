import { useState, useEffect } from 'react';
import { getSessions } from '../api/quiz';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Grid, Chip, Box,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';

export default function QuizSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quiz Sessions
      </Typography>

      <Grid container spacing={3}>
        {sessions.map((session) => (
          <Grid item xs={12} sm={6} md={4} key={session.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {session.topic_name || 'Quiz Session'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={`${session.questions_count || 0} questions`}
                    size="small"
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Created: {format(new Date(session.created_at), 'PPp')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sessions.length === 0 && (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
          No quiz sessions yet. Generate a quiz to get started!
        </Typography>
      )}
    </Container>
  );
}