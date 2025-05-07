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
    id: str
    name: str
    description: str
    ability: str
    image: str
    health: int

class GameInitRequest(BaseModel):
    botCharacter: Character
    botDeck: List[Card]
    difficulty: str
    isFirstTurn: bool

@app.post("/api/bot/init")
async def init_bot_game(data: GameInitRequest):
    persona = get_persona(data.difficulty, data.botCharacter)
    card_names = ", ".join([card.name for card in data.botDeck])

    prompt = f"""
You are a bot named {data.botCharacter.name} with the ability: {data.botCharacter.ability}.
You are playing a card-based grammar game. Your current hand consists of the following cards:
{card_names}.
You are playing on {data.difficulty} difficulty.
You {'go first' if data.isFirstTurn else 'go second'}.

Wait for the player to make a move, then reply with a grammatically correct phrase or sentence using available cards in your hand. Prioritize full sentences if possible.
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
        reply = response.json()["choices"][0]["message"]["content"].strip()
        return {"status": "ready", "response": reply}
    else:
        return {"status": "error", "message": response.text}

def get_persona(difficulty: str, character: Character) -> str:
    styles = {
        "primary": "You are a playful primary school student who forms simple and basic sentences.",
        "highschool": "You are a clever high school student with decent grammar skills and sentence structure.",
        "university": "You are an eloquent university student who constructs complex, well-formed sentences."
    }
    return styles.get(difficulty, styles["primary"])
