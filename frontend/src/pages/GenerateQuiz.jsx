import { useState, useEffect } from 'react';
import { getTopics, createSession } from '../api/quiz';
import toast from 'react-hot-toast';
import {
  Container, Typography, Paper, FormControl, InputLabel, Select,
  MenuItem, TextField, Button, Box, Slider, Chip, Grid, Card,
  CardContent, CircularProgress
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function GenerateQuiz() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionTypes, setQuestionTypes] = useState(['MCQ']);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await getTopics();
      setTopics(response.data);
    } catch (error) {
      toast.error('Failed to load topics');
    }
  };

  const handleGenerate = async () => {
    if (!selectedTopic) {
      toast.error('Please select a topic');
      return;
    }

    setGenerating(true);
    try {
      const response = await createSession({
        topic: selectedTopic,
        num_questions: numQuestions,
        difficulty,
        question_types: questionTypes,
        generate_with_ai: true, // Flag for your AI agent
      });
      
      setGeneratedQuestions(response.data.questions);
      toast.success('Questions generated successfully!');
    } catch (error) {
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <AutoAwesomeIcon sx={{ mr: 1 }} />
        Generate Quiz with AI
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quiz Configuration
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Select Topic</InputLabel>
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>
                Number of Questions: {numQuestions}
              </Typography>
              <Slider
                value={numQuestions}
                onChange={(e, val) => setNumQuestions(val)}
                min={1}
                max={20}
                step={1}
                marks
              />
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Question Types</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['MCQ', 'TF', 'SA', 'FIB'].map((type) => {
                  const labels = {
                    MCQ: 'Multiple Choice',
                    TF: 'True/False',
                    SA: 'Short Answer',
                    FIB: 'Fill in Blanks',
                  };
                  return (
                    <Chip
                      key={type}
                      label={labels[type]}
                      onClick={() => {
                        if (questionTypes.includes(type)) {
                          if (questionTypes.length > 1) {
                            setQuestionTypes(questionTypes.filter(t => t !== type));
                          }
                        } else {
                          setQuestionTypes([...questionTypes, type]);
                        }
                      }}
                      color={questionTypes.includes(type) ? 'primary' : 'default'}
                      variant={questionTypes.includes(type) ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={generating}
              sx={{ mt: 4 }}
              startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            >
              {generating ? 'Generating...' : 'Generate Questions'}
            </Button>
          </Paper>
        </Grid>

        {/* Generated Questions */}
        <Grid item xs={12} md={7}>
          {generatedQuestions.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Generated Questions ({generatedQuestions.length})
              </Typography>
              {generatedQuestions.map((q, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={q.question_type} size="small" color="primary" />
                      <Chip label={q.source} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body1">
                      <strong>Q{index + 1}.</strong> {q.question_text}
                    </Typography>
                    {q.options?.length > 0 && (
                      <Box sx={{ mt: 2, ml: 2 }}>
                        {q.options.map((opt, i) => (
                          <Typography
                            key={i}
                            color={opt.is_correct ? 'success.main' : 'text.primary'}
                          >
                            {opt.is_correct ? '✓' : '○'} {opt.option_text}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {q.correct_answer && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        Answer: {q.correct_answer}
                      </Typography>
                    )}
                    {q.explanation && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Explanation: {q.explanation}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" align="center">
                Configure your quiz and click "Generate Questions"
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                The AI agent will create questions based on your settings
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}