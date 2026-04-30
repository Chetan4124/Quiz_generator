import { useState, useEffect } from 'react';
import { getTopics, createTopic, deleteTopic } from '../api/quiz';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Container, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Card, CardContent, CardActions, Grid,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [open, setOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createTopic(newTopic);
      toast.success('Topic created successfully!');
      setOpen(false);
      setNewTopic({ name: '', description: '' });
      fetchTopics();
    } catch (error) {
      toast.error('Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await deleteTopic(id);
        toast.success('Topic deleted');
        fetchTopics();
      } catch (error) {
        toast.error('Failed to delete topic');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Typography variant="h4">Topics</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          New Topic
        </Button>
      </div>

      <Grid container spacing={3}>
        {topics.map((topic) => (
          <Grid item xs={12} sm={6} md={4} key={topic.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{topic.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {topic.description || 'No description'}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Created: {new Date(topic.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  View Questions
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(topic.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Topic Name"
            margin="normal"
            value={newTopic.name}
            onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={newTopic.description}
            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}