import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopic, getQuestions } from '../api/quiz';
import {
  Container, Typography, Paper, Button, Grid, Card, CardContent,
  CardActions, Chip, Box, CircularProgress, Avatar, IconButton,
  Tooltip, alpha, Divider, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  Quiz as QuizIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

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
      setQuestions(questionsRes.data || []);
    } catch (error) {
      console.error('Failed to load topic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeColor = (type) => {
    const colors = {
      MCQ: '#6366f1',
      TF: '#06b6d4',
      SA: '#f59e0b',
      FIB: '#ec4899',
    };
    return colors[type] || '#6366f1';
  };

  const getSourceColor = (source) => {
    return source === 'AI' ? '#f59e0b' : '#6366f1';
  };

  const stats = {
    total: questions.length,
    mcq: questions.filter(q => q.question_type === 'MCQ').length,
    ai: questions.filter(q => q.source === 'AI').length,
    db: questions.filter(q => q.source === 'DB').length,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!topic) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MenuBookIcon sx={{ fontSize: 72, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Topic not found
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/topics')}
            sx={{ mt: 2 }}
          >
            Back to Topics
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/topics')}
        sx={{ 
          mb: 2, 
          fontWeight: 600, 
          textTransform: 'none',
          color: 'text.secondary',
          '&:hover': { color: '#6366f1' },
        }}
      >
        Back to Topics
      </Button>

      {/* Topic Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          mb: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                }}
              >
                <MenuBookIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    color: '#0f172a',
                  }}
                >
                  {topic.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {topic.description || 'No description provided'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<QuizIcon sx={{ fontSize: 16 }} />}
                    label={`${stats.total} Questions`}
                    size="small"
                    sx={{ borderRadius: '10px', bgcolor: '#eef2ff', color: '#6366f1', fontWeight: 600 }}
                  />
                  <Chip
                    icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                    label={`${stats.ai} AI Generated`}
                    size="small"
                    sx={{ borderRadius: '10px', bgcolor: '#fffbeb', color: '#f59e0b', fontWeight: 600 }}
                  />
                  <Chip
                    label={`${stats.db} Manual`}
                    size="small"
                    sx={{ borderRadius: '10px', fontWeight: 600 }}
                  />
                  <Chip
                    label={`Created ${new Date(topic.created_at).toLocaleDateString()}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: '10px' }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => navigate(`/generate-quiz`)}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  '&:hover': {
                    borderColor: '#f59e0b',
                    bgcolor: '#fffbeb',
                  },
                }}
              >
                Generate AI
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/questions/create/${topicId}`)}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                  },
                }}
              >
                Add Question
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Bar */}
      {stats.total > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'MCQ', value: stats.mcq, color: '#6366f1', total: stats.total },
            { label: 'True/False', value: questions.filter(q => q.question_type === 'TF').length, color: '#06b6d4', total: stats.total },
            { label: 'Short Answer', value: questions.filter(q => q.question_type === 'SA').length, color: '#f59e0b', total: stats.total },
            { label: 'Fill in Blank', value: questions.filter(q => q.question_type === 'FIB').length, color: '#ec4899', total: stats.total },
          ].map((stat) => (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 140,
                p: 2,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {stat.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.value}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(stat.value / stat.total) * 100}
                sx={{
                  mt: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(stat.color, 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: stat.color,
                    borderRadius: 2,
                  },
                }}
              />
            </Paper>
          ))}
        </Box>
      )}

      {/* Questions List */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <QuizIcon sx={{ color: '#6366f1' }} />
        Questions ({stats.total})
      </Typography>

      <Grid container spacing={2}>
        {questions.map((question) => {
          const typeColor = getQuestionTypeColor(question.question_type);
          const sourceColor = getSourceColor(question.source);
          
          return (
            <Grid item xs={12} key={question.id}>
              <Card
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: typeColor,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Question Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={question.question_type}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          bgcolor: alpha(typeColor, 0.1),
                          color: typeColor,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                        }}
                      />
                      <Chip
                        icon={question.source === 'AI' ? <AutoAwesomeIcon sx={{ fontSize: 14 }} /> : undefined}
                        label={question.source === 'AI' ? 'AI Generated' : 'Manual'}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          bgcolor: alpha(sourceColor, 0.08),
                          color: sourceColor,
                          fontWeight: 600,
                          fontSize: '0.72rem',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(question.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Question Text */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      fontSize: '1rem',
                      lineHeight: 1.7,
                    }}
                  >
                    {question.question_text}
                  </Typography>

                  {/* Options for MCQ */}
                  {question.options?.length > 0 && (
                    <Box sx={{ pl: 2, mb: 2 }}>
                      {question.options.map((option, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.8,
                            px: 1.5,
                            borderRadius: '10px',
                            bgcolor: option.is_correct ? alpha('#10b981', 0.08) : 'transparent',
                          }}
                        >
                          {option.is_correct ? (
                            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                          ) : (
                            <RadioIcon sx={{ color: '#cbd5e1', fontSize: 20 }} />
                          )}
                          <Typography
                            sx={{
                              fontWeight: option.is_correct ? 700 : 400,
                              color: option.is_correct ? '#10b981' : 'text.primary',
                            }}
                          >
                            {option.option_text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Answer & Explanation */}
                  {question.correct_answer && question.question_type !== 'MCQ' && (
                    <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: '12px', mb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                        Answer
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                        {question.correct_answer}
                      </Typography>
                    </Box>
                  )}

                  {question.explanation && (
                    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '12px' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Explanation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {question.explanation}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
                  <Tooltip title="Copy Question">
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(question.question_text);
                        toast.success('Question copied!');
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {questions.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: '#f8fafc',
          }}
        >
          <QuizIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No questions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first question or generate with AI
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/questions/create/${topicId}`)}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              Add Manually
            </Button>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => navigate('/generate-quiz')}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                borderColor: '#f59e0b',
                color: '#f59e0b',
              }}
            >
              Generate with AI
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}