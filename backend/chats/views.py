from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ChatSession, Message
from .serializers import (
    ChatSessionSerializer, MessageSerializer, ChatMessageRequestSerializer
)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """Manage chat sessions"""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        # Auto-generate title from first message or use default
        title = self.request.data.get('title', 'New Conversation')
        serializer.save(user=self.request.user, title=title)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a specific chat session"""
        session = self.get_object()
        messages = session.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def send(self, request):
        """
        Send a message to the AI agent
        POST /api/chats/sessions/send/
        """
        serializer = ChatMessageRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        user_message = data['message']
        session_id = data.get('session_id')
        
        # Get or create chat session
        if session_id:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        else:
            # Create new session with auto-generated title
            title = user_message[:50] + ('...' if len(user_message) > 50 else '')
            session = ChatSession.objects.create(
                user=request.user,
                title=title
            )
        
        # Save user message
        user_msg = Message.objects.create(
            session=session,
            role='user',
            content=user_message
        )
        
        # TODO: Integrate AI agent here
        # For now, placeholder response
        ai_response = self._get_ai_response(user_message)
        
        # Save AI response
        ai_msg = Message.objects.create(
            session=session,
            role='assistant',
            content=ai_response
        )
        
        return Response({
            'session_id': session.id,
            'session_title': session.title,
            'user_message': MessageSerializer(user_msg).data,
            'ai_response': MessageSerializer(ai_msg).data
        })
    
    def _get_ai_response(self, message):
        """
        Placeholder for AI agent integration
        This is where you'll connect to your AI agent
        """
        # TODO: Replace with actual AI call
        # Example: response = call_ai_agent(message)
        
        # Placeholder response
        if 'question' in message.lower():
            return "I can help you generate questions! What topic would you like questions about?"
        elif 'hello' in message.lower() or 'hi' in message.lower():
            return "Hello! I'm your AI assistant. How can I help you with question generation today?"
        else:
            return f"I received your message: '{message}'. I'm here to help with question generation and learning assistance. (AI integration pending)"
    
    @action(detail=True, methods=['delete'])
    def clear(self, request, pk=None):
        """Clear all messages in a session"""
        session = self.get_object()
        session.messages.all().delete()
        return Response({'status': 'messages cleared'}, status=status.HTTP_204_NO_CONTENT)