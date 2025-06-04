// Frontend/src/pages/Game.jsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Game.css';

function Game() {
  const location = useLocation();
  const {
    playerCharacter,
    botCharacter,
    playerDeck: initialDeck,
    botDeck: initialBotDeck,
    playerPile: initialPlayerPile,
    botPile: initialBotPile,
    difficulty,
    firstTurn
  } = location.state || {};

  const [playerCardPile, setPlayerCardPile] = useState(initialPlayerPile || []);
  const [botCardPile, setBotCardPile] = useState(initialBotPile || []);
  const [turn, setTurn] = useState(firstTurn); // 'player' or 'bot'
  const [playerDeck, setPlayerDeck] = useState(initialDeck || []);
  const [botDeck, setBotDeck] = useState(initialBotDeck || []);
  const [playerPlayArea, setPlayerPlayArea] = useState([]);
  const [botPlayArea, setBotPlayArea] = useState([]);
  const [playerDiscard, setPlayerDiscard] = useState([]);
  const [botDiscard, setBotDiscard] = useState([]);
  const [botAction, setBotAction] = useState(null);
  const [playerHealth, setPlayerHealth] = useState(playerCharacter?.HP || 50);
  const [botHealth, setBotHealth] = useState(botCharacter?.HP || 50);
  const [roundComplete, setRoundComplete] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const fetchBotMove = async () => {
    const payload = {
      botCharacter: {
        id: botCharacter.id,
        name: botCharacter.name,
        image: botCharacter.image,
        HP: botHealth,
        special_ability: botCharacter.special_ability || botCharacter.ability || ""
      },
      botDeck,
      difficulty
    };

    try {
      const response = await fetch('http://localhost:8001/api/bot/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.status === 'ok') {
        const { played_cards, skip_turn, use_special_ability } = data.move;

        if (!skip_turn) {
          const playedCardObjects = botDeck.filter(card =>
            played_cards.includes(card.value || card.name)
          );

          setBotPlayArea(playedCardObjects);
          setBotDeck(prev => prev.filter(card => !playedCardObjects.includes(card)));
          setBotDiscard(prev => [...prev, ...playedCardObjects]);

          // 👉 Evaluate bot's sentence and damage player
          try {
            const evalRes = await fetch('http://localhost:8000/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cards: playedCardObjects })
            });

            const evalResult = await evalRes.json();
            if (evalResult.valid) {
              setPlayerHealth(prev => Math.max(0, prev - evalResult.damage));
            }
          } catch (e) {
            console.error("Bot evaluation failed", e);
          }

          // 🧹 Clear bot play area after use
          setBotPlayArea([]);
        }

        setBotAction(
          skip_turn ? 'Bot skipped its turn.' :
            use_special_ability ? 'Bot used its special ability!' :
              `Bot played: ${played_cards.join(', ')}`
        );
      } else {
        setBotAction('Bot failed to act.');
      }
    } catch (err) {
      setBotAction('Error fetching bot move.');
    }

    setRoundComplete(true);
    setTurn('player');
  };

  const handleSubmit = async () => {
    if (playerPlayArea.length === 0) return;

    try {
      const response = await fetch('http://localhost:8000/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: playerPlayArea })
      });

      const result = await response.json();

      if (result.valid) {
        setBotHealth(prev => Math.max(0, prev - result.damage));
      }

      setPlayerDiscard(prev => [...prev, ...playerPlayArea]);
      setPlayerPlayArea([]); // 🧹 Clear player play area immediately
      setRoundComplete(true);
      setTurn('bot');
    } catch (error) {
      console.error("❌ Error evaluating sentence:", error);
    }
  };

  const drawCardsForNewRound = () => {
    const draw = (pile, count) => {
      const drawn = pile.slice(0, count);
      const rest = pile.slice(count);
      return [drawn, rest];
    };

    const [newPlayerCards, remainingPlayerPile] = draw(playerCardPile, 2);
    const [newBotCards, remainingBotPile] = draw(botCardPile, 2);

    setPlayerCardPile(remainingPlayerPile);
    setBotCardPile(remainingBotPile);
    setPlayerDeck(prev => [...prev, ...newPlayerCards]);
    setBotDeck(prev => [...prev, ...newBotCards]);
  };

  useEffect(() => {
    if (roundComplete) {
      drawCardsForNewRound();
      setRoundComplete(false);
    }
  }, [roundComplete]);

  useEffect(() => {
    if (turn === 'bot') {
      fetchBotMove();
    }
  }, [turn]);

  const handleDrop = (e, target) => {
    e.preventDefault();
    const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'), 10);
    const card = playerDeck[cardIndex];
    if (target === 'player') {
      setPlayerPlayArea(prev => [...prev, card]);
      const newDeck = [...playerDeck];
      newDeck.splice(cardIndex, 1);
      setPlayerDeck(newDeck);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('cardIndex', index);
  };

  if (!playerCharacter || !botCharacter) {
    return <p>Missing game data. Please restart the game setup.</p>;
  }

  console.log("🔍 Current Bot Deck:", botDeck);

  function handleCardDoubleClick(card) {
    setHoveredCard(card);
    setShowOverlay(true);
  }

  function closeOverlay() {
    setShowOverlay(false);
    setHoveredCard(null);
  }

return (
  <div className="game-table">
    <div className="board-columns">
      <div className="board-left">
        <div className="bot-pile">
          <img src="http://localhost:3000/backcard/backcard.png" alt="Bot Deck" className="pile-card" />
          <p className="pile-label">Bot Deck</p>
        </div>

        <div className="player-pile">
          <img src="http://localhost:3000/backcard/backcard.png" alt="Your Deck" className="pile-card" />
          <p className="pile-label">Your Deck</p>
        </div>
      </div>

      <div className="board-center">
        <div className="section-bot">
          <div className="bot-hand-row">
            {botDeck.map((_, index) => (
              <img
                key={index}
                src="http://localhost:3000/backcard/backcard.png"
                alt="Bot Card"
                className="card"
              />
            ))}
          </div>

          <div className="section">
            <div className="character bot-character">
              <img src={`http://localhost:3000${botCharacter.image}`} alt={botCharacter.name} />
              <p>{botCharacter.name}</p>
              <p className="health-amount">{botHealth} HP</p>
              <div className="health-bar-container">
                <div className="health-bar" style={{ width: `${botHealth}%` }}></div>
              </div>
            </div>

            <div className="play-area bot-area">
              <div className="dropzone-label bot-label">PHRASE / SENTENCE</div>
              {botPlayArea.map((card, index) => (
                <img key={index} src={`http://localhost:3000${card.image}`} alt={card.name} className="card" />
              ))}
            </div>
          </div>
        </div>

        <div className="section">
          <div className="character player-character">
            <img src={`http://localhost:3000${playerCharacter.image}`} alt={playerCharacter.name} />
            <p>{playerCharacter.name}</p>
            <p className="health-amount">{playerHealth} HP</p>
            <div className="health-bar-container">
              <div className="health-bar" style={{ width: `${playerHealth}%` }}></div>
            </div>
          </div>

          <div
            className="play-area player-area"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, 'player')}
          >
            <div className="dropzone-label">PHRASE / SENTENCE</div>
            {playerPlayArea.map((card, index) => (
              <img key={index} src={`http://localhost:3000${card.image}`} alt={card.name} className="card" />
            ))}
          </div>
        </div>

        <div className="player-hand-row">
          <div className="player-hand">
            {playerDeck.map((card, index) => (
              <img
                key={index}
                src={`http://localhost:3000${card.image}`}
                alt={card.name}
                className="card player-card"
                draggable={turn === 'player'}
                onDragStart={e => handleDragStart(e, index)}
                onDoubleClick={() => handleCardDoubleClick(card)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="board-right">
        <div className="bot-discard-zone">
          <p className="discard-label flipped-label">DISCARD</p>
          <div className="discard-slot">
            {botDiscard.slice(-5).map((card, i) => (
              <img key={i} src={`http://localhost:3000${card.image}`} alt={card.name} className="card discard-card" />
            ))}
          </div>
        </div>

        <div className="player-discard-zone">
          <p className="discard-label">DISCARD</p>
          <div className="discard-slot">
            {playerDiscard.slice(-5).map((card, i) => (
              <img key={i} src={`http://localhost:3000${card.image}`} alt={card.name} className="card discard-card" />
            ))}
          </div>
        </div>
      </div>
    </div>

    {botAction && (
      <div className="bot-action-box">
        <p><strong>Bot played:</strong> {botAction}</p>
      </div>
    )}

    <div className="controls-row">
      <button onClick={handleSubmit} disabled={turn !== 'player'}>
        Submit Sentence
      </button>
      <div className="button-row">
        <button className="skip-button" disabled={turn !== 'player'} onClick={() => setTurn('bot')}>
          Skip Turn
        </button>
        <div
          className="skill-button-container"
          onClick={() => console.log('🛡️ Skill Activated!')}
          title="Activate Skill"
        >
          <div className="skill-button"></div>
        </div>
      </div>
    </div>

    {showOverlay && hoveredCard && (
      <div className="card-overlay" onClick={closeOverlay}>
        <img
          src={`http://localhost:3000${hoveredCard.image}`}
          alt={hoveredCard.name}
          className="card-overlay-image"
        />
      </div>
    )}
  </div>
);

}

export default Game;