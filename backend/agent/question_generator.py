import json
import logging
import time
from .gemini_client import ask_ai
from quiz.models import Question, Option

logger = logging.getLogger(__name__)


class QuestionGenerator:
    
    def generate(self, topic, num_questions=5, question_type=None, difficulty='medium', user=None):
        """Generate questions with long delays to avoid rate limits"""
        all_questions = []
        
        for i in range(num_questions):
            try:
                # Wait 8 seconds between requests (safe for free tier)
                if i > 0:
                    logger.info(f"Waiting 8 seconds before next question...")
                    time.sleep(8)
                
                question = self._generate_one(topic, question_type, difficulty, user)
                if question:
                    all_questions.append(question)
                    logger.info(f"✅ Generated {i+1}/{num_questions}")
                    
            except Exception as e:
                logger.error(f"❌ Failed question {i+1}: {e}")
                continue
        
        return all_questions
    
    def _generate_one(self, topic, question_type, difficulty, user):
        """Generate a single question with simple prompt"""
        
        q_type = question_type or 'MCQ'
        
        # Shorter prompt to reduce tokens
        prompt = f"Generate one {difficulty} {q_type} question about {topic.name}. Reply with JSON: {{'question_text':'...', 'question_type':'{q_type}', 'options':['A','B','C','D'], 'correct_answer':0, 'explanation':'...'}}"
        
        ai_text = ask_ai(prompt)
        
        # Clean response
        ai_text = ai_text.strip()
        start = ai_text.find('{')
        end = ai_text.rfind('}') + 1
        if start >= 0 and end > start:
            ai_text = ai_text[start:end]
        
        q_data = json.loads(ai_text)
        
        # Save question
        question = Question.objects.create(
            topic=topic,
            created_by=user,
            question_text=q_data.get('question_text', ''),
            question_type=q_data.get('question_type', q_type),
            source='AI',
            correct_answer=str(q_data.get('correct_answer', '')),
            explanation=q_data.get('explanation', '')
        )
        
        # Save MCQ options
        if q_data.get('question_type') == 'MCQ':
            options = q_data.get('options', [])
            correct_idx = q_data.get('correct_answer', 0)
            for i, opt_text in enumerate(options):
                Option.objects.create(
                    question=question,
                    option_text=opt_text,
                    is_correct=(i == correct_idx)
                )
        
        return question


generator = QuestionGenerator()
