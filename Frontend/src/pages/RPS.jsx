// Frontend/src/pages/RPS.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
      <div className="w-full min-h-screen bg-black text-gold flex flex-col items-center justify-center p-5 box-border">
        <h2 className="text-3xl mb-5">Choose Rock, Paper, or Scissors</h2>
        <div className="flex gap-4">
          <button 
            className="px-6 py-3 text-xl font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
            onClick={() => submitRPS('rock')}
          >
            🪨 Rock
          </button>
          <button 
            className="px-6 py-3 text-xl font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
            onClick={() => submitRPS('paper')}
          >
            📄 Paper
          </button>
          <button 
            className="px-6 py-3 text-xl font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
            onClick={() => submitRPS('scissors')}
          >
            ✂️ Scissors
          </button>
        </div>
      </div>
    );
  }

  // If result is ready, show outcome
  if (!isReady) {
    return (
      <div className="w-full min-h-screen bg-black text-gold flex flex-col items-center justify-center p-5 box-border">
        <h2 className="text-3xl text-gold text-center animate-[shimmer_4s_ease-in-out_infinite]">
          Playing Rock Paper Scissors...
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-gold flex flex-col items-center justify-center p-5 box-border">
      <h2 className="text-3xl mb-5">Rock Paper Scissors Result</h2>
      <p className="text-xl mb-2">🧍 You chose: <strong>{outcome.playerChoice}</strong></p>
      <p className="text-xl mb-6">🤖 Bot chose: <strong>{outcome.botChoice}</strong></p>
      <h3 className="text-4xl font-bold mb-8 text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]">
        {outcome.result === 'draw'
          ? "It's a Draw!"
          : `${outcome.result === 'player' ? 'You' : 'Bot'} will go first!`}
      </h3>
      <button 
        className="px-6 py-3 text-xl font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
        onClick={startGame}
      >
        Continue to Game
      </button>
    </div>
  );
}

export default RPS;
