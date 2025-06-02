// Frontend/src/pages/RPS.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RPS.css';

function RPS() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
  playerCharacter,
  botCharacter,
  difficulty,
  playerDeck,
  botDeck,
  playerPile,
  botPile
} = location.state || {};


  const [playerChoice, setPlayerChoice] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [isReady, setIsReady] = useState(false);

function submitRPS(choice) {
  setPlayerChoice(choice);

  function playRPS() {
    fetch('http://localhost:3000/api/rps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerChoice: choice })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result === 'draw') {
          playRPS(); // Retry if draw
        } else {
          setTimeout(() => {
            setOutcome(data);
            setIsReady(true);
          }, 2000);
        }
      })
      .catch(err => console.error('❌ Failed to play RPS:', err));
  }

  playRPS();
}


  function startGame() {
navigate('/game', {
  state: {
    playerCharacter,
    botCharacter,
    difficulty,
    playerDeck,
    botDeck,
    playerPile,     // ✅ include this
    botPile,        // ✅ and this
    firstTurn: outcome?.result || 'player'
  }
});

  }

  // If result not yet ready, show choice buttons
  if (!outcome) {
    return (
      <div className="rps-container">
        <h2>Choose Rock, Paper, or Scissors</h2>
        <div className="rps-options">
          <button onClick={() => submitRPS('rock')}>🪨 Rock</button>
          <button onClick={() => submitRPS('paper')}>📄 Paper</button>
          <button onClick={() => submitRPS('scissors')}>✂️ Scissors</button>
        </div>
      </div>
    );
  }

  // If result is ready, show outcome
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
        {outcome.result === 'draw'
          ? 'It’s a Draw!'
          : `${outcome.result === 'player' ? 'You' : 'Bot'} will go first!`}
      </h3>
      <button onClick={startGame}>Continue to Game</button>
    </div>
  );
}

export default RPS;
