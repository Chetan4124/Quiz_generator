from .gemini_client import ask_ai
import logging

logger = logging.getLogger(__name__)


class ChatBot:
    
    def chat(self, user_message, chat_history=None):
        prompt = f"""You are a helpful NIELIT exam tutor. Be friendly and brief.

Student: {user_message}
Tutor: """

        try:
            return ask_ai(prompt)
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return "I'm having trouble. Please try again."


chatbot = ChatBot()