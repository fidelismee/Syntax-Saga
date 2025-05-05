// Game.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import './Game.css';

function Game() {
  const location = useLocation();
  const { playerCharacter, botCharacter, playerDeck, botDeck } = location.state || {};

  if (!playerCharacter || !botCharacter || !playerDeck || !botDeck) {
    return <p>Missing game data. Please restart the game setup.</p>;
  }

  return (
    <div className="game-table">
      <div className="bot-hand">
        {botDeck.map((card, index) => (
          <img
            key={index}
            src={`http://localhost:3000${card.image}`}
            alt={card.name}
            className="card bot-card"
          />
        ))}
      </div>

      <div className="center-characters">
        <div className="character player">
          <img src={`http://localhost:3000${playerCharacter.image}`} alt={playerCharacter.name} />
          <p>{playerCharacter.name}</p>
        </div>
        <div className="character bot">
          <img src={`http://localhost:3000${botCharacter.image}`} alt={botCharacter.name} />
          <p>{botCharacter.name}</p>
        </div>
      </div>

      <div className="player-hand">
        {playerDeck.map((card, index) => (
          <img
            key={index}
            src={`http://localhost:3000${card.image}`}
            alt={card.name}
            className="card player-card"
          />
        ))}
      </div>
    </div>
  );
}

export default Game;
