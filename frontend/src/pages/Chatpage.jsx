import { useState, useEffect, useRef } from 'react';
import { getChatSessions, createChatSession, sendMessage, getMessages } from '../api/chats';
import toast from 'react-hot-toast';
import {
  Container, Paper, Typography, TextField, Button, Box, List,
  ListItem, ListItemButton, ListItemText, Divider, CircularProgress,
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const response = await getChatSessions();
      setSessions(response.data);
    } catch (error) {
      toast.error('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await getMessages(sessionId);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const startNewChat = async () => {
    try {
      const response = await createChatSession({ title: 'New Conversation' });
      const newSession = response.data;
      setSessions([newSession, ...sessions]);
      setActiveSession(newSession);
      setMessages([]);
    } catch (error) {
      toast.error('Failed to create new chat');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSession) return;

    const userMessage = {
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await sendMessage(activeSession.id, {
        content: input,
        role: 'user',
      });
      
      // Assuming your backend responds with AI message
      if (response.data.assistant_message) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.assistant_message,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      toast.error('Failed to send message');
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
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', height: '70vh', gap: 2 }}>
        {/* Sessions Sidebar */}
        <Paper sx={{ width: 280, p: 2, overflow: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={startNewChat}
            sx={{ mb: 2 }}
          >
            New Chat
          </Button>
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                disablePadding
              >
                <ListItemButton
                  selected={activeSession?.id === session.id}
                  onClick={() => {
                    setActiveSession(session);
                    fetchMessages(session.id);
                  }}
                >
                  <ListItemText
                    primary={session.title || 'Untitled'}
                    secondary={new Date(session.created_at).toLocaleDateString()}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          {activeSession ? (
            <>
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {messages.length === 0 ? (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography color="textSecondary">
                      Start a conversation with the AI assistant
                    </Typography>
                  </Box>
                ) : (
                  messages.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                          </Avatar>
                          <Typography variant="caption" color="textSecondary">
                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                          </Typography>
                        </Box>
                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor: message.role === 'user' ? '#1976d2' : '#f5f5f5',
                            color: message.role === 'user' ? 'white' : 'inherit',
                          }}
                        >
                          <Typography>{message.content}</Typography>
                        </Paper>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || sending}
                >
                  {sending ? <CircularProgress size={24} /> : <SendIcon />}
                </Button>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SmartToyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Select a chat or start a new conversation
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Chat with the AI assistant to generate and discuss questions
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}