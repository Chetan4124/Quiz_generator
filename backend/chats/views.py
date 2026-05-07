from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging

from .models import ChatSession, Message
from .serializers import (
    ChatSessionSerializer, MessageSerializer, ChatMessageRequestSerializer
)
from agent.chat_bot import chatbot

logger = logging.getLogger(__name__)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """Manage chat sessions"""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        title = self.request.data.get('title', 'New Conversation')
        serializer.save(user=self.request.user, title=title)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a session"""
        session = self.get_object()
        messages = session.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def send(self, request):
        """Send a message to the AI agent"""
        serializer = ChatMessageRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        user_message = data['message']
        session_id = data.get('session_id')
        
        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            title = user_message[:50] + ('...' if len(user_message) > 50 else '')
            session = ChatSession.objects.create(user=request.user, title=title)
        
        # Save user message
        user_msg = Message.objects.create(session=session, role='user', content=user_message)
        
        # Get AI response
        try:
            recent_msgs = session.messages.order_by('-created_at')[:10]
            chat_history = [{'role': m.role, 'content': m.content} for m in reversed(recent_msgs)]
            ai_response = chatbot.chat(user_message, chat_history)
        except Exception as e:
            logger.error(f"Chat error: {e}")
            ai_response = "I'm having trouble. Please try again."
        
        # Save AI response
        ai_msg = Message.objects.create(session=session, role='assistant', content=ai_response)
        
        return Response({
            'session_id': session.id,
            'session_title': session.title,
            'user_message': MessageSerializer(user_msg).data,
            'ai_response': MessageSerializer(ai_msg).data
        })
    
    @action(detail=True, methods=['delete'])
    def clear(self, request, pk=None):
        """Clear all messages"""
        session = self.get_object()
        session.messages.all().delete()
        return Response({'status': 'messages cleared'}, status=status.HTTP_204_NO_CONTENT)