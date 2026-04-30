from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Topic, Question, Option, QuizSession

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'topic', 'topic_name', 'question_text', 'question_type',
            'source', 'correct_answer', 'explanation', 'options',
            'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['created_by', 'source']


class TopicSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'created_at', 'question_count']
    
    def get_question_count(self, obj):
        return obj.questions.count()


class QuizSessionSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    
    class Meta:
        model = QuizSession
        fields = ['id', 'user', 'topic', 'topic_name', 'questions', 'created_at']
        read_only_fields = ['user']


class QuestionGenerationSerializer(serializers.Serializer):
    """For AI question generation request"""
    topic_id = serializers.IntegerField(required=True)
    num_questions = serializers.IntegerField(default=5, min_value=1, max_value=20)
    question_type = serializers.ChoiceField(
        choices=['MCQ', 'TF', 'SA', 'FIB'],
        required=False,
        allow_null=True
    )
    difficulty = serializers.ChoiceField(
        choices=['easy', 'medium', 'hard'],
        default='medium',
        required=False
    )
    include_db_questions = serializers.BooleanField(default=True)