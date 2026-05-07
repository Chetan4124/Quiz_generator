import { useState, useEffect } from 'react';
import { getTopics, generateQuestions } from '../api/quiz';
import toast from 'react-hot-toast';
import {
  Container, Typography, Paper, FormControl, InputLabel, Select,
  MenuItem, Button, Box, Slider, Chip, Grid, Card,
  CardContent, CircularProgress, Radio, RadioGroup, FormControlLabel,
  TextField, Divider, LinearProgress, Avatar, alpha
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

export default function GenerateQuiz() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionTypes, setQuestionTypes] = useState(['MCQ']);
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  
  // Quiz mode states
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);

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
    setQuizStarted(false);
    setQuizSubmitted(false);
    setUserAnswers({});
    setScore(0);
    
    try {
      const response = await generateQuestions({
        topic_id: selectedTopic,
        num_questions: numQuestions,
        difficulty: difficulty,
        question_type: questionTypes[0],
        include_db_questions: true
      });
      
      setQuestions(response.data.questions);
      setQuizStarted(true);
      toast.success(`Generated ${response.data.questions.length} questions!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      const userAnswer = userAnswers[q.id];
      if (q.question_type === 'MCQ') {
        // For MCQ, correct_answer stores the index of correct option
        const correctOptionIndex = q.options.findIndex(opt => opt.is_correct);
        if (userAnswer === String(correctOptionIndex) || userAnswer === correctOptionIndex) {
          correctCount++;
        }
      } else if (q.question_type === 'TF') {
        if (userAnswer?.toLowerCase() === q.correct_answer?.toLowerCase()) {
          correctCount++;
        }
      } else {
        // For SA and FIB, do a simple comparison
        if (userAnswer?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim()) {
          correctCount++;
        }
      }
    });
    
    setScore(correctCount);
    setQuizSubmitted(true);
    
    if (correctCount === questions.length) {
      toast.success('🎉 Perfect Score!');
    } else if (correctCount >= questions.length / 2) {
      toast.success(`Good job! You got ${correctCount}/${questions.length}`);
    } else {
      toast(`You got ${correctCount}/${questions.length}. Keep practicing!`);
    }
  };

  const handleReset = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setUserAnswers({});
    setScore(0);
    setQuestions([]);
  };

  const isAnswerCorrect = (question) => {
    const userAnswer = userAnswers[question.id];
    if (question.question_type === 'MCQ') {
      const correctOptionIndex = question.options.findIndex(opt => opt.is_correct);
      return userAnswer === String(correctOptionIndex) || userAnswer === correctOptionIndex;
    } else if (question.question_type === 'TF') {
      return userAnswer?.toLowerCase() === question.correct_answer?.toLowerCase();
    } else {
      return userAnswer?.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim();
    }
  };

  const allAnswered = questions.length > 0 && questions.every(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== '');

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.8rem' }, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#f59e0b' }} />
          Generate Quiz
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate questions and test your knowledge
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1.1rem' }}>
              Quiz Settings
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Select Topic
              </Typography>
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                size="small"
                sx={{ borderRadius: '10px' }}
                disabled={quizStarted && !quizSubmitted}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                Questions: {numQuestions}
              </Typography>
              <Slider
                value={numQuestions}
                onChange={(e, val) => setNumQuestions(val)}
                min={1}
                max={20}
                step={1}
                disabled={quizStarted && !quizSubmitted}
                sx={{ color: '#6366f1' }}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Difficulty
              </Typography>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                size="small"
                sx={{ borderRadius: '10px' }}
                disabled={quizStarted && !quizSubmitted}
              >
                <MenuItem value="easy">🟢 Easy</MenuItem>
                <MenuItem value="medium">🟡 Medium</MenuItem>
                <MenuItem value="hard">🔴 Hard</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                Question Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { value: 'MCQ', label: 'MCQ' },
                  { value: 'TF', label: 'True/False' },
                  { value: 'SA', label: 'Short Answer' },
                  { value: 'FIB', label: 'Fill Blank' },
                ].map((type) => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    onClick={() => setQuestionTypes([type.value])}
                    color={questionTypes.includes(type.value) ? 'primary' : 'default'}
                    variant={questionTypes.includes(type.value) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                    disabled={quizStarted && !quizSubmitted}
                  />
                ))}
              </Box>
            </Box>

            {!quizStarted ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerate}
                disabled={generating || !selectedTopic}
                startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: '14px',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                  '&:hover': { boxShadow: '0 12px 32px rgba(245,158,11,0.5)' },
                }}
              >
                {generating ? 'Generating...' : 'Start Quiz'}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: '12px', fontWeight: 600, textTransform: 'none' }}
                >
                  New Quiz
                </Button>
              </Box>
            )}
          </Paper>

          {/* Score Card (after submission) */}
          {quizSubmitted && (
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 3,
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                background: score === questions.length
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                  : score >= questions.length / 2
                  ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                  : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              }}
            >
              <TrophyIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                {score}/{questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {score === questions.length ? 'Perfect Score! 🎉' : 
                 score >= questions.length / 2 ? 'Good Job! 👍' : 
                 'Keep Practicing! 💪'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(score / questions.length) * 100}
                sx={{
                  mt: 2,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha('#6366f1', 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: score === questions.length ? '#10b981' : 
                             score >= questions.length / 2 ? '#f59e0b' : '#ef4444',
                    borderRadius: 4,
                  },
                }}
              />
            </Paper>
          )}
        </Grid>

        {/* Questions Area */}
        <Grid item xs={12} md={8}>
          {generating ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={48} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                AI is generating your questions...
              </Typography>
            </Box>
          ) : quizStarted && questions.length > 0 ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Questions ({questions.length})
                </Typography>
                {!quizSubmitted && (
                  <Typography variant="caption" color="text.secondary">
                    {Object.keys(userAnswers).length}/{questions.length} answered
                  </Typography>
                )}
              </Box>

              {questions.map((q, index) => (
                <Card
                  key={q.id}
                  sx={{
                    mb: 2,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: quizSubmitted
                      ? isAnswerCorrect(q) ? '#10b981' : '#ef4444'
                      : 'divider',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Question Number & Type */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: quizSubmitted
                              ? isAnswerCorrect(q) ? '#10b981' : '#ef4444'
                              : '#6366f1',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                          }}
                        >
                          {quizSubmitted ? (isAnswerCorrect(q) ? '✓' : '✗') : index + 1}
                        </Avatar>
                        <Chip label={q.question_type} size="small" sx={{ borderRadius: '6px', fontWeight: 600 }} />
                      </Box>
                      {quizSubmitted && (
                        <Chip
                          icon={isAnswerCorrect(q) ? <CheckCircleIcon /> : <CancelIcon />}
                          label={isAnswerCorrect(q) ? 'Correct' : 'Incorrect'}
                          size="small"
                          color={isAnswerCorrect(q) ? 'success' : 'error'}
                          sx={{ borderRadius: '8px', fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    {/* Question Text */}
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                      {index + 1}. {q.question_text}
                    </Typography>

                    {/* Answer Options */}
                    {q.question_type === 'MCQ' && q.options?.length > 0 && (
                      <RadioGroup
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      >
                        {q.options.map((opt, i) => {
                          const isCorrectOption = opt.is_correct;
                          const userSelected = String(userAnswers[q.id]) === String(i);
                          
                          return (
                            <FormControlLabel
                              key={i}
                              value={String(i)}
                              control={<Radio />}
                              disabled={quizSubmitted}
                              label={opt.option_text}
                              sx={{
                                py: 0.5,
                                px: 1.5,
                                borderRadius: '10px',
                                mb: 0.5,
                                ...(quizSubmitted && isCorrectOption && {
                                  bgcolor: '#f0fdf4',
                                  border: '1px solid #10b981',
                                }),
                                ...(quizSubmitted && userSelected && !isCorrectOption && {
                                  bgcolor: '#fef2f2',
                                  border: '1px solid #ef4444',
                                }),
                                ...(!quizSubmitted && {
                                  '&:hover': { bgcolor: '#f8fafc' },
                                }),
                              }}
                            />
                          );
                        })}
                      </RadioGroup>
                    )}

                    {/* True/False */}
                    {q.question_type === 'TF' && (
                      <RadioGroup
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      >
                        {['True', 'False'].map((val) => (
                          <FormControlLabel
                            key={val}
                            value={val}
                            control={<Radio />}
                            disabled={quizSubmitted}
                            label={val}
                          />
                        ))}
                      </RadioGroup>
                    )}

                    {/* Short Answer / Fill in Blanks */}
                    {(q.question_type === 'SA' || q.question_type === 'FIB') && (
                      <TextField
                        fullWidth
                        placeholder="Type your answer..."
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        disabled={quizSubmitted}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                        }}
                      />
                    )}

                    {/* Show Answer & Explanation After Submit */}
                    {quizSubmitted && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                        {!isAnswerCorrect(q) && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981' }}>
                              ✅ Correct Answer:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                              {q.question_type === 'MCQ'
                                ? q.options.find(opt => opt.is_correct)?.option_text
                                : q.correct_answer}
                            </Typography>
                          </Box>
                        )}
                        {q.explanation && (
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              💡 Explanation:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {q.explanation}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Submit Button */}
              {!quizSubmitted && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmitQuiz}
                    disabled={!allAnswered}
                    startIcon={<QuizIcon />}
                    sx={{
                      py: 1.5,
                      px: 6,
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      background: allAnswered
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : '#cbd5e1',
                      boxShadow: allAnswered ? '0 8px 24px rgba(99,102,241,0.3)' : 'none',
                    }}
                  >
                    Submit Answers
                  </Button>
                  {!allAnswered && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Answer all questions to submit
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: '20px',
                border: '2px dashed',
                borderColor: 'divider',
                textAlign: 'center',
                bgcolor: '#f8fafc',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 72, color: '#6366f1', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Ready to Start?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                Configure your quiz settings and click "Start Quiz" to generate questions
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}