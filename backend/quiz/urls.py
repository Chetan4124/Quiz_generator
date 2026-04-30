from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'topics', views.TopicViewSet, basename='topic')
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'sessions', views.QuizSessionViewSet, basename='session')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
