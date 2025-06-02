# Backend\fastapi_service\deepseek_microservice.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import json
import requests
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# -----------------------------
# 🔄 Card Models
# -----------------------------
class Card(BaseModel):
    id: int
    type: str
    value: Optional[str] = None         # e.g. "Beautiful"
    name: Optional[str] = None          # e.g. "Pronoun Parry" (for special cards)
    image: str
    points: Optional[int] = None
    frequency: Optional[str] = None
    effect: Optional[str] = None
    category: Optional[str] = None
    conjugations: Optional[List[dict]] = None  # for verb cards

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

# -----------------------------
# 🔧 Card Normalizer
# -----------------------------
def normalize_card(card: Card) -> str:
    if card.value:
        return card.value
    elif card.name:
        return card.name
    elif card.type == "verb" and card.conjugations:
        return card.conjugations[0]["form"]
    else:
        return "[Unknown]"

# -----------------------------
# 🤖 Bot Move Endpoint
# -----------------------------
@app.post("/api/bot/move")
async def bot_move(data: GameMoveRequest):
    persona = get_persona(data.difficulty, data.botCharacter)

    # Normalize card display values for DeepSeek prompt
    card_names = ", ".join([normalize_card(card) for card in data.botDeck])

    prompt = f"""
You are a bot named {data.botCharacter.name}, with {data.botCharacter.HP} HP.
Your special ability: {data.botCharacter.special_ability}
You are playing a grammar-based card game.
These are your available cards: {card_names}

Form a grammatically correct and meaningful sentence using your cards.
If it's strategic, you may choose to skip your turn or use your special ability.

⚠️ Respond ONLY in valid JSON. DO NOT add explanation or extra words.
Use this format exactly:
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
            result = json.loads(reply) if reply.startswith('{') else {
                "skip_turn": False,
                "played_cards": [],
                "use_special_ability": False
            }
            return {"status": "ok", "move": result}
        except Exception as e:
            return {
                "status": "error",
                "message": "Invalid JSON from DeepSeek",
                "raw": reply
            }
    else:
        return {"status": "error", "message": response.text}

# -----------------------------
# 🎓 Persona Styling
# -----------------------------
def get_persona(difficulty: str, character: Character) -> str:
    styles = {
        "primary": "You are a playful primary school student. Use simple phrases and basic grammar.",
        "highschool": "You are a smart high school student. Use intermediate grammar with clear structure.",
        "university": "You are an advanced university student. Form complex, well-structured sentences."
    }
    return styles.get(difficulty, styles["primary"])
