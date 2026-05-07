from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
import logging
import pandas as pd
import re
import io

from .models import Topic, Question, Option, QuizSession
from .serializers import (
    UserSerializer, TopicSerializer, QuestionSerializer,
    QuizSessionSerializer, QuestionGenerationSerializer
)
from agent.question_generator import generator

logger = logging.getLogger(__name__)


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
        topic_id = self.request.query_params.get('topic')
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        q_type = self.request.query_params.get('type')
        if q_type:
            queryset = queryset.filter(question_type=q_type)
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
        """Generate questions using AI agent + database mix"""
        serializer = QuestionGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        topic_id = data['topic_id']
        num_questions = data['num_questions']
        question_type = data.get('question_type')
        include_db = data['include_db_questions']
        difficulty = data.get('difficulty', 'medium')
        
        topic = get_object_or_404(Topic, id=topic_id)
        generated_questions = []
        
        db_questions = []
        if include_db:
            db_query = Question.objects.filter(topic=topic, source='DB')
            if question_type:
                db_query = db_query.filter(question_type=question_type)
            db_questions = list(db_query.order_by('?')[:num_questions])
            generated_questions.extend(db_questions)
        
        remaining = num_questions - len(generated_questions)
        if remaining > 0:
            try:
                ai_questions = generator.generate(
                    topic=topic,
                    num_questions=remaining,
                    question_type=question_type,
                    difficulty=difficulty,
                    user=request.user
                )
                generated_questions.extend(ai_questions)
            except Exception as e:
                logger.error(f"AI generation failed: {str(e)}")
                return Response(
                    {'error': f'Question generation failed. Please try again later.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        session = QuizSession.objects.create(user=request.user, topic=topic)
        session.questions.set(generated_questions)
        
        serializer = QuestionSerializer(generated_questions, many=True)
        return Response({
            'session_id': session.id,
            'questions': serializer.data,
            'total_questions': len(generated_questions),
            'db_count': len(db_questions),
            'ai_count': remaining if remaining > 0 else 0
        })
    
    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """
        Upload questions from TXT, Excel, or CSV file
        POST /api/quiz/questions/bulk_upload/
        """
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided. Please upload a file.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        topic_id = request.data.get('topic_id')
        
        if not topic_id:
            return Response(
                {'error': 'Topic ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response(
                {'error': 'Topic not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        filename = file.name.lower()
        questions_data = []
        
        try:
            if filename.endswith('.txt'):
                questions_data = self._parse_txt_file(file)
            elif filename.endswith('.xlsx') or filename.endswith('.xls'):
                questions_data = self._parse_excel_file(file)
            elif filename.endswith('.csv'):
                questions_data = self._parse_csv_file(file)
            else:
                return Response(
                    {'error': 'Unsupported file format. Please upload .txt, .xlsx, .xls, or .csv file'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"File parse error: {str(e)}")
            return Response(
                {'error': f'Failed to parse file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not questions_data:
            return Response(
                {'error': 'No valid questions found in the file. Please check the format.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        saved_questions = []
        errors = []
        
        for i, q_data in enumerate(questions_data):
            try:
                question = Question.objects.create(
                    topic=topic,
                    created_by=request.user,
                    question_text=q_data.get('question_text', ''),
                    question_type=q_data.get('question_type', 'MCQ'),
                    source='DB',
                    correct_answer=str(q_data.get('correct_answer', '')),
                    explanation=q_data.get('explanation', '')
                )
                
                if q_data.get('question_type') == 'MCQ' and q_data.get('options'):
                    options = q_data['options']
                    correct_idx = q_data.get('correct_answer', 0)
                    if isinstance(correct_idx, str):
                        correct_idx = correct_idx.lower()
                        option_map = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4}
                        correct_idx = option_map.get(correct_idx, 0)
                    
                    for j, opt_text in enumerate(options):
                        Option.objects.create(
                            question=question,
                            option_text=str(opt_text),
                            is_correct=(j == int(correct_idx) if isinstance(correct_idx, (int, float)) else False)
                        )
                
                saved_questions.append(question)
                
            except Exception as e:
                errors.append(f'Row {i+1}: {str(e)}')
                logger.error(f"Error saving question {i+1}: {str(e)}")
        
        return Response({
            'message': f'Successfully imported {len(saved_questions)} questions',
            'total_rows': len(questions_data),
            'imported': len(saved_questions),
            'failed': len(errors),
            'errors': errors if errors else None
        })
    
    def _parse_txt_file(self, file):
        """
        Parse TXT file with format:
        
        Format 1 (Recommended):
        Q: What is the capital of India?
        A: New Delhi
        T: SA
        E: New Delhi is the capital of India
        ---
        Q: Which of the following is a programming language?
        A: 0
        T: MCQ
        a) Python
        b) Microsoft Word
        c) Google Chrome
        d) Adobe Photoshop
        E: Python is a high-level programming language
        ---
        
        Format 2 (Numbered):
        1. What is Python?
        a) A snake
        b) A programming language
        c) A car
        d) A movie
        Answer: b
        """
        content = file.read().decode('utf-8', errors='ignore')
        questions = []
        
        if 'Q:' in content.upper() or 'QUESTION:' in content.upper():
            blocks = re.split(r'\n---+\n|\n===+\n|\n{3,}', content)
            
            for block in blocks:
                block = block.strip()
                if not block:
                    continue
                
                q_data = {
                    'question_text': '',
                    'question_type': 'SA',
                    'correct_answer': '',
                    'explanation': '',
                    'options': []
                }
                
                lines = block.split('\n')
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    if re.match(r'^(Q|QUESTION):', line, re.IGNORECASE):
                        q_data['question_text'] = re.split(r'^[Qq](UESTION)?:\s*', line, flags=re.IGNORECASE)[-1].strip()
                    
                    elif re.match(r'^(A|ANSWER):', line, re.IGNORECASE):
                        q_data['correct_answer'] = re.split(r'^[Aa](NSWER)?:\s*', line, flags=re.IGNORECASE)[-1].strip()
                    
                    elif re.match(r'^(T|TYPE):', line, re.IGNORECASE):
                        q_type = re.split(r'^[Tt](YPE)?:\s*', line, flags=re.IGNORECASE)[-1].strip().upper()
                        if q_type in ['MCQ', 'TF', 'SA', 'FIB']:
                            q_data['question_type'] = q_type
                    
                    elif re.match(r'^(E|EXPLANATION):', line, re.IGNORECASE):
                        q_data['explanation'] = re.split(r'^[Ee](XPLANATION)?:\s*', line, flags=re.IGNORECASE)[-1].strip()
                    
                    elif re.match(r'^[a-eA-E][).]\s', line):
                        option_text = re.split(r'^[a-eA-E][).]\s*', line)[-1].strip()
                        q_data['options'].append(option_text)
                        q_data['question_type'] = 'MCQ'
                
                if q_data['question_text']:
                    questions.append(q_data)
        
        elif re.match(r'^\d+[.)]', content):
            lines = content.strip().split('\n')
            current_q = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                if re.match(r'^\d+[.)]\s', line):
                    if current_q and current_q.get('question_text'):
                        questions.append(current_q)
                    current_q = {
                        'question_text': re.sub(r'^\d+[.)]\s*', '', line),
                        'question_type': 'SA',
                        'correct_answer': '',
                        'explanation': '',
                        'options': []
                    }
                
                elif re.match(r'^[a-eA-E][).]\s', line) and current_q:
                    option_text = re.sub(r'^[a-eA-E][).]\s*', '', line)
                    current_q['options'].append(option_text)
                    current_q['question_type'] = 'MCQ'
                
                elif re.match(r'^(Answer|Ans):', line, re.IGNORECASE) and current_q:
                    ans = re.split(r':\s*', line)[-1].strip().lower()
                    option_map = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4}
                    current_q['correct_answer'] = option_map.get(ans, ans)
            
            if current_q and current_q.get('question_text'):
                questions.append(current_q)
        
        return questions
    
    def _parse_excel_file(self, file):
        """
        Parse Excel file with columns:
        question_text | question_type | option_a | option_b | option_c | option_d | correct_answer | explanation
        """
        df = pd.read_excel(file)
        df.columns = [col.lower().strip() for col in df.columns]
        questions = []
        
        for _, row in df.iterrows():
            q_data = {
                'question_text': str(row.get('question_text', row.get('question', ''))),
                'question_type': str(row.get('question_type', row.get('type', 'MCQ'))).upper().strip(),
                'correct_answer': '',
                'explanation': str(row.get('explanation', row.get('explain', ''))),
                'options': []
            }
            
            if pd.isna(q_data['question_text']) or q_data['question_text'] in ['nan', '']:
                continue
            
            for col in ['option_a', 'option_b', 'option_c', 'option_d', 'option_e']:
                if col in df.columns and pd.notna(row[col]):
                    val = str(row[col])
                    if val not in ['nan', '']:
                        q_data['options'].append(val)
            
            if q_data['options']:
                q_data['question_type'] = 'MCQ'
            
            correct = row.get('correct_answer', row.get('answer', ''))
            if pd.notna(correct):
                q_data['correct_answer'] = str(correct)
            
            questions.append(q_data)
        
        return questions
    
    def _parse_csv_file(self, file):
        """
        Parse CSV file with same format as Excel
        """
        file_content = file.read().decode('utf-8', errors='ignore')
        df = pd.read_csv(io.StringIO(file_content))
        df.columns = [col.lower().strip() for col in df.columns]
        questions = []
        
        for _, row in df.iterrows():
            q_data = {
                'question_text': str(row.get('question_text', row.get('question', ''))),
                'question_type': str(row.get('question_type', row.get('type', 'MCQ'))).upper().strip(),
                'correct_answer': '',
                'explanation': str(row.get('explanation', row.get('explain', ''))),
                'options': []
            }
            
            if pd.isna(q_data['question_text']) or q_data['question_text'] in ['nan', '']:
                continue
            
            for col in ['option_a', 'option_b', 'option_c', 'option_d', 'option_e']:
                if col in df.columns and pd.notna(row[col]):
                    val = str(row[col])
                    if val not in ['nan', '']:
                        q_data['options'].append(val)
            
            if q_data['options']:
                q_data['question_type'] = 'MCQ'
            
            correct = row.get('correct_answer', row.get('answer', ''))
            if pd.notna(correct):
                q_data['correct_answer'] = str(correct)
            
            questions.append(q_data)
        
        return questions


class QuizSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """View quiz session history"""
    serializer_class = QuizSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return QuizSession.objects.filter(user=self.request.user).order_by('-created_at')
