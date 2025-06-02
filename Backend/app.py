# Backend\app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("DEEPSEEK_API_KEY")

# Evaluate the sentence using DeepSeek's HTTP API
def evaluate_sentence(sentence):
    url = "https://api.deepseek.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "user",
                "content": f"Evaluate this sentence: \"{sentence}\". Is it grammatically correct and meaningful? If yes, give a quality score from 1 to 10."
            }
        ]
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content'].lower()

        valid = "yes" in content or "grammatically correct" in content
        score = 5
        for word in content.split():
            if word.isdigit():
                score = int(word)
                break

        return valid, score

    except Exception as e:
        print("❌ DeepSeek API call failed:", str(e))
        return False, 0

# Extract text from card
def get_card_text(card):
    if 'article' in card:
        return card['article']
    elif 'noun' in card:
        return card['noun']
    elif 'adjective' in card:
        return card['adjective']
    elif 'forms' in card and isinstance(card['forms'], list):
        if isinstance(card['forms'][0], dict) and 'form' in card['forms'][0]:
            return card['forms'][0]['form']
        else:
            return card['forms'][0]
    elif 'words' in card and isinstance(card['words'], list):
        return card['words'][0]
    elif 'verb' in card:
        return card['verb']
    elif 'type' in card:
        return card['type']
    return "[UNK]"

# Main evaluation route
@app.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.json
        cards = data.get("cards", [])

        print("📥 Received cards:", cards)

        # Build sentence
        words = [get_card_text(card) for card in cards]
        sentence = " ".join(words)
        print("🧠 Sentence to evaluate:", sentence)

        # Grammar evaluation
        valid, score = evaluate_sentence(sentence)

        # Base points
        base_damage = sum(card.get("points", 0) for card in cards)

        # Bonus calculation
        bonus_damage = 0
        adjectives = [card.get("adjective", "").lower() for card in cards if "adjective" in card]

        for card in cards:
            if "bonus" in card and isinstance(card["bonus"], dict):
                bonus = card["bonus"]
                required_adj = bonus.get("adjective", "").lower()
                extra = bonus.get("extra_points", 0)
                if required_adj in adjectives:
                    bonus_damage += extra
                    print(f"🎯 Bonus triggered: {card.get('noun', card.get('id'))} +{extra} pts")

        total_damage = (base_damage + bonus_damage) if valid else 0

        return jsonify({
            "sentence": sentence,
            "valid": valid,
            "base_points": base_damage,
            "bonus_points": bonus_damage,
            "score": score,
            "damage": total_damage
        })

    except Exception as e:
        print("❌ Internal Server Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)
