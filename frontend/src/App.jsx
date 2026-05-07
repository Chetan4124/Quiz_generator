import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import Layout from './Components/Layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import TopicDetail from './pages/TopicDetail';
import CreateQuestion from './pages/CreateQuestion';
import QuizSessions from './pages/QuizSessions';
import GenerateQuiz from './pages/GenerateQuiz';
import ChatPage from './pages/Chatpage';
import BulkUpload from './pages/BulkUpload';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0066ff' },
    secondary: { main: '#ff0077' },
    background: { default: '#f6f7fb', paper: '#ffffff' },
    text: { primary: '#0b1220' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" />;  // Changed from /login to /
  
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="topics" element={<Topics />} />
              <Route path="topics/:topicId" element={<TopicDetail />} />
              <Route path="questions/create/:topicId?" element={<CreateQuestion />} />
              <Route path="quiz-sessions" element={<QuizSessions />} />
              <Route path="generate-quiz" element={<GenerateQuiz />} />
              <Route path="chats" element={<ChatPage />} />
              <Route path="bulk-upload" element={<BulkUpload />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;