import { useState, useEffect } from 'react';
import { getTopics, createTopic, deleteTopic } from '../api/quiz';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Container, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Card, CardContent, CardActions, Grid,
  IconButton, Box, Chip, Avatar, InputAdornment, alpha, Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  Quiz as QuizIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
} from '@mui/icons-material';

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredTopics(
        topics.filter(t => 
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredTopics(topics);
    }
  }, [searchTerm, topics]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await getTopics();
      setTopics(response.data || []);
      setFilteredTopics(response.data || []);
    } catch (error) {
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTopic.name.trim()) {
      toast.error('Topic name is required');
      return;
    }
    setCreating(true);
    try {
      await createTopic(newTopic);
      toast.success('Topic created successfully!');
      setOpen(false);
      setNewTopic({ name: '', description: '' });
      fetchTopics();
    } catch (error) {
      toast.error('Failed to create topic');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"? This will remove all associated questions.`)) {
      try {
        await deleteTopic(id);
        toast.success('Topic deleted');
        fetchTopics();
      } catch (error) {
        toast.error('Failed to delete topic');
      }
    }
  };

  const topicColors = [
    '#6366f1', '#ec4899', '#06b6d4', '#f59e0b', 
    '#8b5cf6', '#ef4444', '#10b981', '#3b82f6',
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '1.5rem', md: '1.8rem' },
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <MenuBookIcon sx={{ color: '#6366f1', fontSize: 32 }} />
              Topics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {topics.length} topic{topics.length !== 1 ? 's' : ''} • Manage your question categories
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: '14px',
              py: 1.3,
              px: 3,
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(99,102,241,0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Create Topic
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search topics..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            bgcolor: '#fff',
            '&:hover fieldset': { borderColor: '#6366f1' },
          },
        }}
      />

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <Grid container spacing={2.5}>
          {filteredTopics.map((topic, index) => {
            const color = topicColors[index % topicColors.length];
            return (
              <Grid item xs={12} sm={6} md={4} key={topic.id}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 60px ${alpha(color, 0.15)}`,
                      borderColor: color,
                      '& .topic-icon': {
                        transform: 'scale(1.1) rotate(-5deg)',
                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                      },
                    },
                  }}
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  <CardContent sx={{ p: 3, flex: 1 }}>
                    {/* Icon */}
                    <Avatar
                      className="topic-icon"
                      sx={{
                        width: 52,
                        height: 52,
                        mb: 2,
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <MenuBookIcon />
                    </Avatar>

                    {/* Title */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '1.1rem',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {topic.name}
                    </Typography>

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 40,
                      }}
                    >
                      {topic.description || 'No description provided for this topic.'}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<QuizIcon sx={{ fontSize: 14 }} />}
                        label={`${topic.question_count || 0} Questions`}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          bgcolor: alpha(color, 0.08),
                          color: color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          '& .MuiChip-icon': { color: color },
                        }}
                      />
                      <Chip
                        label={new Date(topic.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                        }}
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        color: color,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        '&:hover': { bgcolor: alpha(color, 0.06) },
                      }}
                    >
                      View Questions
                    </Button>
                    <Tooltip title="Delete Topic">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(topic.id, topic.name);
                        }}
                        sx={{
                          color: 'text.disabled',
                          '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>

                  {/* Color accent bar */}
                  <Box
                    sx={{
                      height: 4,
                      background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
                      borderRadius: '0 0 20px 20px',
                    }}
                  />
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* Empty State */
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
          }}
        >
          {searchTerm ? (
            <>
              <SearchIcon sx={{ fontSize: 72, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No topics found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Try a different search term
              </Typography>
            </>
          ) : (
            <>
              <MenuBookIcon sx={{ fontSize: 72, color: '#6366f1', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No topics yet
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                Create your first topic to start organizing questions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                Create First Topic
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Create Topic Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 2,
            maxWidth: 500,
            width: '100%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#eef2ff' }}>
              <MenuBookIcon sx={{ color: '#6366f1', fontSize: 20 }} />
            </Avatar>
            Create New Topic
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Topic Name"
            placeholder="e.g., Python Programming, Database Concepts"
            value={newTopic.name}
            onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
            required
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="Brief description of this topic..."
            multiline
            rows={3}
            value={newTopic.description}
            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            disabled={creating || !newTopic.name.trim()}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            {creating ? 'Creating...' : 'Create Topic'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}