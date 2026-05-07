import { useState, useEffect, useRef } from 'react';
import { getChatSessions, createChatSession, sendMessage, getMessages } from '../api/chats';
import toast from 'react-hot-toast';
import {
  Container, Paper, Typography, TextField, Button, Box, List,
  ListItem, ListItemButton, ListItemText, Divider, CircularProgress,
  Avatar, IconButton, Chip
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const response = await getChatSessions();
      setSessions(response.data || []);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await getMessages(sessionId);
      setMessages(response.data || []);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const startNewChat = async () => {
    try {
      const response = await createChatSession({ title: 'New Conversation' });
      const newSession = response.data;
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      setMessages([]);
      inputRef.current?.focus();
    } catch (error) {
      toast.error('Failed to create chat');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSession) return;

    const tempMsg = {
      id: Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await sendMessage(activeSession.id, {
        message: input,
        session_id: activeSession.id,
      });
      
      if (response.data?.ai_response) {
        setMessages(prev => [...prev, {
          id: response.data.ai_response.id || Date.now() + 1,
          role: 'assistant',
          content: response.data.ai_response.content,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
        {/* Sidebar */}
        <Paper
          sx={{
            width: 300,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
              💬 AI Chat
            </Typography>
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={startNewChat}
              sx={{
                borderRadius: '12px',
                py: 1.2,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
              }}
            >
              New Conversation
            </Button>
          </Box>
          <Divider />
          <List sx={{ flex: 1, overflow: 'auto', px: 1 }}>
            {sessions.map((session) => (
              <ListItem key={session.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeSession?.id === session.id}
                  onClick={() => {
                    setActiveSession(session);
                    fetchMessages(session.id);
                  }}
                  sx={{
                    borderRadius: '12px',
                    '&.Mui-selected': {
                      bgcolor: '#eef2ff',
                      '&:hover': { bgcolor: '#e0e7ff' },
                    },
                  }}
                >
                  <Avatar sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#6366f1' }}>
                    <ChatIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <ListItemText
                    primary={session.title || 'Conversation'}
                    secondary={session.last_message?.content?.slice(0, 40) || 'No messages'}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      noWrap: true,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper
          sx={{
            flex: 1,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {activeSession ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <SmartToyIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    {activeSession.title || 'AI Assistant'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                    NIELIT Question Generator AI
                  </Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: '#f8fafc' }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Start the conversation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ask me anything about NIELIT topics!
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg, i) => (
                    <Box
                      key={msg.id || i}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                        animation: 'fadeIn 0.3s ease',
                      }}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar sx={{ width: 36, height: 36, mr: 1, bgcolor: '#6366f1' }}>
                          <SmartToyIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      )}
                      <Box sx={{ maxWidth: '70%' }}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            bgcolor: msg.role === 'user' ? '#6366f1' : '#fff',
                            color: msg.role === 'user' ? '#fff' : 'inherit',
                            boxShadow: msg.role === 'user'
                              ? '0 4px 16px rgba(99,102,241,0.3)'
                              : '0 2px 8px rgba(0,0,0,0.06)',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {msg.content}
                          </Typography>
                        </Paper>
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.disabled', px: 1 }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input */}
              <Divider />
              <Box sx={{ p: 2, bgcolor: '#fff', display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  inputRef={inputRef}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: '#f8fafc',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || sending}
                  sx={{
                    borderRadius: '16px',
                    minWidth: 52,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  {sending ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : <SendIcon />}
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 4 }}>
              <SmartToyIcon sx={{ fontSize: 96, color: '#6366f1', mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                AI Chat Assistant
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Select a conversation or start a new one to chat with the AI
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={startNewChat}
                sx={{
                  borderRadius: '14px',
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                Start New Chat
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Container>
  );
}