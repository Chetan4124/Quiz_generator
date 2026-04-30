import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopic, getQuestions } from '../api/quiz';
import {
  Container, Typography, Paper, Button, Grid, Card, CardContent,
  CardActions, Chip, Box, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopicData();
  }, [topicId]);

  const fetchTopicData = async () => {
    try {
      const [topicRes, questionsRes] = await Promise.all([
        getTopic(topicId),
        getQuestions({ topic: topicId }),
      ]);
      setTopic(topicRes.data);
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Failed to load topic data:', error);
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

  if (!topic) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          Topic not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">{topic.name}</Typography>
          <Typography variant="body1" color="textSecondary">
            {topic.description || 'No description'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/questions/create/${topicId}`)}
        >
          Add Question
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Questions ({questions.length})
      </Typography>

      <Grid container spacing={3}>
        {questions.map((question) => (
          <Grid item xs={12} key={question.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={question.question_type} size="small" color="primary" />
                  <Chip label={question.source} size="small" variant="outlined" />
                </Box>
                <Typography variant="body1" gutterBottom>
                  {question.question_text}
                </Typography>
                
                {question.options?.length > 0 && (
                  <Box sx={{ ml: 2, mt: 1 }}>
                    {question.options.map((option, i) => (
                      <Typography
                        key={i}
                        color={option.is_correct ? 'success.main' : 'text.primary'}
                      >
                        {option.is_correct ? '✓' : '○'} {option.option_text}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                {question.correct_answer && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    Answer: {question.correct_answer}
                  </Typography>
                )}
                
                {question.explanation && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Explanation: {question.explanation}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {questions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No questions yet
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/questions/create/${topicId}`)}
            sx={{ mt: 2 }}
          >
            Create First Question
          </Button>
        </Paper>
      )}
    </Container>
  );
}