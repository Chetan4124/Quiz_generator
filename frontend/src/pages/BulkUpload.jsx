import { useState, useEffect, useRef } from 'react';
import { getTopics, bulkUploadQuestions } from '../api/quiz';
import toast from 'react-hot-toast';
import {
  Container, Typography, Paper, Button, Box, Grid, FormControl,
  Select, MenuItem, LinearProgress, Chip, Card, CardContent,
  IconButton, Divider, alpha
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

export default function BulkUpload() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['.txt', '.xlsx', '.xls', '.csv'];
      const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        toast.error('Invalid file type. Please upload .txt, .xlsx, .xls, or .csv');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ['.txt', '.xlsx', '.xls', '.csv'];
      const fileExt = '.' + droppedFile.name.split('.').pop().toLowerCase();
      
      if (validTypes.includes(fileExt)) {
        setFile(droppedFile);
        setResult(null);
      } else {
        toast.error('Invalid file type. Please upload .txt, .xlsx, .xls, or .csv');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    if (!selectedTopic) {
      toast.error('Please select a topic');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('topic_id', selectedTopic);

      const response = await bulkUploadQuestions(formData);
      setResult(response.data);
      
      if (response.data.imported > 0) {
        toast.success(`Successfully imported ${response.data.imported} questions!`);
      } else {
        toast.error('No questions were imported');
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    const colors = { txt: '#6366f1', xlsx: '#10b981', xls: '#10b981', csv: '#06b6d4' };
    return <FileIcon sx={{ color: colors[ext] || '#6366f1', fontSize: 40 }} />;
  };

  const downloadSampleFile = (type) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (type === 'txt') {
      content = `Q: What is the capital of India?
A: New Delhi
T: SA
E: India's capital is New Delhi
---
Q: Which of these is a programming language?
A: a
T: MCQ
a) Python
b) Microsoft Word
c) Google Chrome
d) Adobe Photoshop
E: Python is widely used in software development
---
Q: HTML stands for HyperText Markup Language
A: True
T: TF
E: HTML is the standard markup language for web pages`;
      filename = 'sample_questions.txt';
      mimeType = 'text/plain';
    } else if (type === 'csv') {
      content = 'question_text,question_type,option_a,option_b,option_c,option_d,correct_answer,explanation\n"What is Python?",MCQ,"A snake","A programming language","A car","A movie",b,"Python is a programming language"\n"HTML is a programming language",TF,,,,,False,"HTML is a markup language, not programming"';
      filename = 'sample_questions.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Sample ${type.toUpperCase()} file downloaded!`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.5rem', md: '1.8rem' } }}>
        📁 Bulk Upload Questions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Upload multiple questions at once from a file. Supports .txt, .xlsx, .xls, and .csv formats.
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Area */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            sx={{
              p: 5,
              borderRadius: '20px',
              border: '2px dashed',
              borderColor: dragOver ? '#6366f1' : file ? '#10b981' : '#d0d5dd',
              bgcolor: dragOver ? '#eef2ff' : '#fff',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { borderColor: '#6366f1', bgcolor: '#fafafe' },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".txt,.xlsx,.xls,.csv"
              onChange={handleFileSelect}
            />

            {file ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  {getFileIcon(file.name)}
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  sx={{ borderRadius: '10px' }}
                >
                  Choose Different File
                </Button>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Drop your file here or click to browse
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports .TXT, .XLSX, .XLS, .CSV (Max 10MB)
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Upload Button */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={!file || !selectedTopic || uploading}
              startIcon={uploading ? null : <CloudUploadIcon />}
              sx={{
                py: 1.5,
                borderRadius: '14px',
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          </Box>

          {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 4, height: 6 }} />}

          {/* Result */}
          {result && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: result.imported > 0 ? '#10b981' : '#ef4444',
                bgcolor: result.imported > 0 ? '#f0fdf4' : '#fef2f2',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {result.imported > 0 ? (
                  <CheckCircleIcon sx={{ color: '#10b981', fontSize: 28 }} />
                ) : (
                  <CancelIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                )}
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {result.imported > 0 ? 'Upload Successful!' : 'Upload Failed'}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Total Rows</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{result.total_rows}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Imported</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>{result.imported}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Failed</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444' }}>{result.failed}</Typography>
                </Grid>
              </Grid>

              {result.errors && result.errors.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                    Errors:
                  </Typography>
                  {result.errors.map((err, i) => (
                    <Typography key={i} variant="caption" color="error" display="block">
                      • {err}
                    </Typography>
                  ))}
                </Box>
              )}
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Topic Select */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Select Topic
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                displayEmpty
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="" disabled>
                  Choose a topic...
                </MenuItem>
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Format Guide */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InfoIcon sx={{ color: '#6366f1' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                File Format Guide
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              TXT Format:
            </Typography>
            <Box sx={{ bgcolor: '#1a1a2e', color: '#e2e8f0', p: 1.5, borderRadius: '8px', fontSize: '0.7rem', fontFamily: 'monospace', mb: 2 }}>
              Q: Question text here<br />
              A: Answer here<br />
              T: MCQ (or SA/TF/FIB)<br />
              a) Option A<br />
              b) Option B<br />
              c) Option C<br />
              d) Option D<br />
              E: Explanation<br />
              ---
            </Box>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              Excel/CSV Columns:
            </Typography>
            <Box sx={{ bgcolor: '#1a1a2e', color: '#e2e8f0', p: 1.5, borderRadius: '8px', fontSize: '0.7rem', fontFamily: 'monospace', mb: 2 }}>
              question_text | question_type | option_a | option_b | option_c | option_d | correct_answer | explanation
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => downloadSampleFile('txt')}
                sx={{ borderRadius: '8px', fontSize: '0.8rem' }}
              >
                Download TXT Sample
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => downloadSampleFile('csv')}
                sx={{ borderRadius: '8px', fontSize: '0.8rem' }}
              >
                Download CSV Sample
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}