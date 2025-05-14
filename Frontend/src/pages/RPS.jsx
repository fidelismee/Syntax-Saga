// src/pages/RPS.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RPS.css';

function RPS() {
  const location = useLocation();
  const navigate = useNavigate();

  const { playerCharacter, botCharacter, difficulty, playerDeck, botDeck } = location.state || {};
  const [outcome, setOutcome] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/rps')
      .then(res => res.json())
      .then(data => {
      setTimeout(() => {
        setOutcome(data);     // delay outcome reveal
        setIsReady(true);     // mark as ready to render
      }, 2000); // 2000 ms = 2 seconds
    })
      .catch(err => console.error('❌ Failed to play RPS:', err));
  }, []);

  function startGame() {
    navigate('/game', {
      state: {
        playerCharacter,
        botCharacter,
        difficulty,
        playerDeck,
        botDeck,
        firstTurn: outcome?.result || 'player' // default to player if undefined
      }
    });
  }

  if (!isReady) {
    return (
      <div className="rps-loading-screen">
        <h2 className="rps-loading-text">Playing Rock Paper Scissors...</h2>
      </div>
    );
  }


  return (
    <div className="rps-container">
      <h2>Rock Paper Scissors Result</h2>
      <p>🧍 You chose: <strong>{outcome.playerChoice}</strong></p>
      <p>🤖 Bot chose: <strong>{outcome.botChoice}</strong></p>
      <h3>
        {outcome.result === 'draw' ? 'It’s a Draw!' : `${outcome.result === 'player' ? 'You' : 'Bot'} will go first!`}
      </h3>
      <button onClick={startGame}>Continue to Game</button>
    </div>
  );
}

export default RPS;
