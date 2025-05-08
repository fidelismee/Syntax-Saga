from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import requests
from dotenv import load_dotenv
import os

app = FastAPI()

load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

class Card(BaseModel):
    name: str
    type: str
    image: str
    points: int

class Character(BaseModel):
    id: int
    name: str
    image: str
    HP: int
    special_ability: str

class GameMoveRequest(BaseModel):
    botCharacter: Character
    botDeck: List[Card]
    difficulty: str

@app.post("/api/bot/move")
async def bot_move(data: GameMoveRequest):
    persona = get_persona(data.difficulty, data.botCharacter)
    card_names = ", ".join([card.name for card in data.botDeck])

    prompt = f"""
You are a bot named {data.botCharacter.name}, with {data.botCharacter.HP} HP.
Your special ability: {data.botCharacter.special_ability}
You are playing a grammar-based card game.
These are your available cards: {card_names}

Form a sentence using your cards. If it's strategic to skip your turn or activate your special ability, you may do so.
Respond in JSON with the following format:
{{
  "skip_turn": true or false,
  "played_cards": ["card1", "card2", ...],
  "use_special_ability": true or false
}}
"""

    response = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": persona},
                {"role": "user", "content": prompt.strip()}
            ]
        }
    )

    if response.status_code == 200:
        try:
            reply = response.json()["choices"][0]["message"]["content"].strip()
            result = eval(reply) if reply.startswith('{') else {"skip_turn": False, "played_cards": [], "use_special_ability": False}
            return {"status": "ok", "move": result}
        except Exception as e:
            return {"status": "error", "message": "Invalid JSON from DeepSeek", "raw": reply}
    else:
        return {"status": "error", "message": response.text}

def get_persona(difficulty: str, character: Character) -> str:
    styles = {
        "primary": "You are a playful primary school student. Use simple phrases and basic grammar.",
        "highschool": "You are a smart high school student. Use intermediate grammar with clear structure.",
        "university": "You are an advanced university student. Form complex, well-structured sentences."
    }
    return styles.get(difficulty, styles["primary"])
