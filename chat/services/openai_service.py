import openai
import os

# Load OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

async def get_openai_response(prompt: str) -> str:
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message['content']
    except Exception as e:
        return str(e)

def update_chat_history(chat_id, message):
    # Function to update chat history in the database
    pass

def delete_chat_history(chat_id):
    # Function to delete chat history from the database
    pass

def get_chat_history(chat_id):
    # Function to retrieve chat history from the database
    pass