import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Game.css';

function Game() {
  const location = useLocation();
  const {
    playerCharacter,
    botCharacter,
    playerDeck: initialDeck,
    botDeck,
    difficulty,
    firstTurn
  } = location.state || {};

  const [botAction, setBotAction] = useState(null);
  const [playerDeck, setPlayerDeck] = useState(initialDeck || []);
  const [playerPlayArea, setPlayerPlayArea] = useState([]);
  const [botPlayArea, setBotPlayArea] = useState([]);
  const [playerDiscard, setPlayerDiscard] = useState([]);
  const [botDiscard, setBotDiscard] = useState([]);

  useEffect(() => {
    if (firstTurn === 'bot') {
      const payload = {
        bot_character: {
          name: botCharacter.name,
          health: botCharacter.health || 50,
          ability: botCharacter.ability || "None"
        },
        bot_deck: botDeck,
        difficulty: difficulty,
        is_first_turn: true
      };

      fetch('http://localhost:8000/api/bot/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          console.log('🤖 Bot move suggestion:', data.suggestion);
          setBotAction(data.suggestion);
        })
        .catch(err => console.error('❌ Failed to get bot move:', err));
    }
  }, [firstTurn, botCharacter, botDeck, difficulty]);

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

  const handleSubmit = () => {
    if (playerPlayArea.length === 0) return;
    setPlayerDiscard(playerPlayArea);
    setPlayerPlayArea([]);
  };

  if (!playerCharacter || !botCharacter || !playerDeck || !botDeck) {
    return <p>Missing game data. Please restart the game setup.</p>;
  }

  return (
    <div className="game-table">
      <div className="board-columns">
        {/* Left Column: Deck Piles */}
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

        {/* Center Column: Characters + Dropzones + Hands */}
        <div className="board-center">
          {/* Bot Section */}
          <div className="section">
            <div className="character bot-character">
              <img src={`http://localhost:3000${botCharacter.image}`} alt={botCharacter.name} />
              <p>{botCharacter.name}</p>
            </div>
            <div className="play-area bot-area">
              <div className="dropzone-label bot-label">PHRASE / SENTENCE</div>
              {botPlayArea.map((card, index) => (
                <img key={index} src={`http://localhost:3000${card.image}`} alt={card.name} className="card" />
              ))}
            </div>
          </div>

          {/* Player Section */}
          <div className="section">
            <div className="character player-character">
              <img src={`http://localhost:3000${playerCharacter.image}`} alt={playerCharacter.name} />
              <p>{playerCharacter.name}</p>
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

          {/* Player Hand */}
          <div className="player-hand-row">
            <div className="player-hand">
              {playerDeck.map((card, index) => (
                <img
                  key={index}
                  src={`http://localhost:3000${card.image}`}
                  alt={card.name}
                  className="card player-card"
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Discard Zones */}
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

      {/* Bot Action Box */}
      {botAction && (
        <div className="bot-action-box">
          <p><strong>Bot played:</strong> {botAction}</p>
        </div>
      )}

      {/* Controls */}
      <div className="controls-row">
        <button onClick={handleSubmit}>Submit Sentence</button>

        <div className="button-row">
          <button className="skip-button" onClick={() => console.log("⏭ Skip Turn Clicked!")}>
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
    </div>
  );
}

export default Game;
