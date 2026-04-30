from django.contrib import admin
from .models import Topic, Question, Option, QuizSession


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4  # Show 4 option fields by default


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'question_text', 'question_type', 'topic', 'source', 'created_at']
    list_filter = ['question_type', 'source', 'topic', 'created_at']
    search_fields = ['question_text', 'correct_answer']
    inlines = [OptionInline]
    readonly_fields = ['source', 'created_at']


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description', 'question_count', 'created_at']
    search_fields = ['name', 'description']
    
    def question_count(self, obj):
        return obj.questions.count()
    question_count.short_description = 'Number of Questions'


@admin.register(QuizSession)
class QuizSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'topic', 'question_count', 'created_at']
    list_filter = ['topic', 'created_at']
    search_fields = ['user__username']
    filter_horizontal = ['questions']
    
    def question_count(self, obj):
        return obj.questions.count()
    question_count.short_description = 'Questions Generated'

# Register your models here.
