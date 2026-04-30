import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopics, createQuestion } from '../api/quiz';
import toast from 'react-hot-toast';
import {
  Container, Typography, TextField, Button, MenuItem, FormControl,
  InputLabel, Select, Box, Paper, IconButton, Radio, FormControlLabel,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function CreateQuestion() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [questionType, setQuestionType] = useState('MCQ');
  const [question, setQuestion] = useState({
    topic: topicId || '',
    question_text: '',
    question_type: 'MCQ',
    source: 'DB',
    correct_answer: '',
    explanation: '',
  });
  const [options, setOptions] = useState([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);

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

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].option_text = value;
    setOptions(newOptions);
  };

  const handleCorrectOption = (index) => {
    setOptions(options.map((opt, i) => ({
      ...opt,
      is_correct: questionType === 'MCQ' ? i === index : opt.is_correct,
    })));
  };

  const handleCorrectOptionToggle = (index) => {
    const newOptions = [...options];
    newOptions[index].is_correct = !newOptions[index].is_correct;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { option_text: '', is_correct: false }]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.topic) {
      toast.error('Please select a topic');
      return;
    }
    
    if (!question.question_text.trim()) {
      toast.error('Question text is required');
      return;
    }

    try {
      const payload = { ...question, question_type: questionType };
      
      if (['MCQ', 'TF'].includes(questionType)) {
        if (options.some(opt => !opt.option_text.trim())) {
          toast.error('All options must have text');
          return;
        }
        
        const correctOption = options.find(opt => opt.is_correct);
        if (!correctOption) {
          toast.error('Please mark the correct answer');
          return;
        }
        
        payload.correct_answer = correctOption.option_text;
        payload.options = options.filter(opt => opt.option_text.trim());
      }

      await createQuestion(payload);
      toast.success('Question created successfully!');
      navigate(`/topics/${question.topic}`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create question';
      toast.error(message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Question
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Topic</InputLabel>
            <Select
              value={question.topic}
              onChange={(e) => setQuestion({ ...question, topic: e.target.value })}
              required
            >
              {topics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Question Type</InputLabel>
            <Select
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value);
                setQuestion({ ...question, question_type: e.target.value });
              }}
              required
            >
              <MenuItem value="MCQ">Multiple Choice</MenuItem>
              <MenuItem value="TF">True / False</MenuItem>
              <MenuItem value="SA">Short Answer</MenuItem>
              <MenuItem value="FIB">Fill in the Blanks</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Question Text"
            multiline
            rows={3}
            margin="normal"
            value={question.question_text}
            onChange={(e) => setQuestion({ ...question, question_text: e.target.value })}
            required
          />

          {/* Options for MCQ and TF */}
          {['MCQ', 'TF'].includes(questionType) && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Options
              </Typography>
              {options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {questionType === 'MCQ' ? (
                    <Radio
                      checked={option.is_correct}
                      onChange={() => handleCorrectOption(index)}
                    />
                  ) : (
                    <Checkbox
                      checked={option.is_correct}
                      onChange={() => handleCorrectOptionToggle(index)}
                    />
                  )}
                  <TextField
                    fullWidth
                    label={`Option ${index + 1}`}
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <IconButton
                      color="error"
                      onClick={() => removeOption(index)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {questionType === 'MCQ' && options.length < 6 && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={addOption}
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              )}
            </Box>
          )}

          {/* Short Answer - Correct Answer */}
          {questionType === 'SA' && (
            <TextField
              fullWidth
              label="Correct Answer"
              margin="normal"
              value={question.correct_answer}
              onChange={(e) => setQuestion({ ...question, correct_answer: e.target.value })}
              required
            />
          )}

          {/* Fill in the Blanks */}
          {questionType === 'FIB' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Use ___ to indicate blanks in the question text
              </Typography>
              <TextField
                fullWidth
                label="Correct Answer for Blank"
                margin="normal"
                value={question.correct_answer}
                onChange={(e) => setQuestion({ ...question, correct_answer: e.target.value })}
                required
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Explanation (Optional)"
            multiline
            rows={3}
            margin="normal"
            value={question.explanation}
            onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              Create Question
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}