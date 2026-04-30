from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
import random

from .models import Topic, Question, Option, QuizSession
from .serializers import (
    UserSerializer, TopicSerializer, QuestionSerializer,
    QuizSessionSerializer, QuestionGenerationSerializer
)


class RegisterView(generics.CreateAPIView):
    """User Registration"""
    permission_classes = [AllowAny]
    serializer_class = UserSerializer


class TopicViewSet(viewsets.ModelViewSet):
    """CRUD operations for Topics"""
    queryset = Topic.objects.all().order_by('-created_at')
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save()


class QuestionViewSet(viewsets.ModelViewSet):
    """CRUD operations for Questions"""
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Question.objects.all().order_by('-created_at')
        
        # Filter by topic
        topic_id = self.request.query_params.get('topic')
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        
        # Filter by question type
        q_type = self.request.query_params.get('type')
        if q_type:
            queryset = queryset.filter(question_type=q_type)
        
        # Filter by source
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, source='DB')
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate questions using AI agent + database mix
        POST /api/quiz/questions/generate/
        """
        serializer = QuestionGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        topic_id = data['topic_id']
        num_questions = data['num_questions']
        question_type = data.get('question_type')
        include_db = data['include_db_questions']
        
        topic = get_object_or_404(Topic, id=topic_id)
        generated_questions = []
        
        # Step 1: Get questions from database if requested
        db_questions = []
        if include_db:
            db_query = Question.objects.filter(topic=topic, source='DB')
            if question_type:
                db_query = db_query.filter(question_type=question_type)
            db_questions = list(db_query.order_by('?')[:num_questions])
            generated_questions.extend(db_questions)
        
        # Step 2: Fill remaining with AI-generated questions
        remaining = num_questions - len(generated_questions)
        
        if remaining > 0:
            ai_questions = self._generate_ai_questions(
                topic=topic,
                num_questions=remaining,
                question_type=question_type,
                difficulty=data.get('difficulty', 'medium')
            )
            generated_questions.extend(ai_questions)
        
        # Step 3: Create a quiz session to track this generation
        session = QuizSession.objects.create(
            user=request.user,
            topic=topic
        )
        session.questions.set(generated_questions)
        
        # Return the questions
        serializer = QuestionSerializer(generated_questions, many=True)
        return Response({
            'session_id': session.id,
            'questions': serializer.data,
            'db_count': len(db_questions),
            'ai_count': remaining if remaining > 0 else 0
        })
    
    def _generate_ai_questions(self, topic, num_questions, question_type, difficulty):
        """
        Placeholder for AI agent integration
        This is where you'll integrate OpenAI/Gemini/Claude
        """
        ai_questions = []
        
        # TODO: Replace with actual AI call
        # Example structure for when you integrate AI:
        # prompt = f"Generate {num_questions} {difficulty} {question_type} questions about {topic.name}"
        # response = call_ai_agent(prompt)
        # Parse response and create Question objects
        
        # For now, creating placeholder questions
        for i in range(num_questions):
            q_type = question_type or random.choice(['MCQ', 'TF', 'SA', 'FIB'])
            question = Question.objects.create(
                topic=topic,
                created_by=self.request.user,
                question_text=f"[AI Generated] Sample question {i+1} about {topic.name}",
                question_type=q_type,
                source='AI',
                correct_answer="Sample answer - replace with AI response",
                explanation="This is a placeholder. AI integration pending."
            )
            
            # Create options for MCQ
            if q_type == 'MCQ':
                for j in range(4):
                    Option.objects.create(
                        question=question,
                        option_text=f"Option {j+1}",
                        is_correct=(j == 0)  # First option is correct
                    )
            
            ai_questions.append(question)
        
        return ai_questions


class QuizSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """View quiz session history"""
    serializer_class = QuizSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return QuizSession.objects.filter(user=self.request.user).order_by('-created_at')
