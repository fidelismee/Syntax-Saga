// Frontend\src\pages\DifficultySelect.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function DifficultySelect() {
  const location = useLocation();
  const navigate = useNavigate();

  const { playerCharacter, botCharacter } = location.state || {};
  const [playerDeck, setPlayerDeck] = useState([]);
  const [botDeck, setBotDeck] = useState([]);
  const [playerPile, setPlayerPile] = useState([]);
  const [botPile, setBotPile] = useState([]);
  const [focusedChar, setFocusedChar] = useState(null);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);

  const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button 
      className="absolute top-10 left-10 px-5 py-2.5 text-base bg-dark-300 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:bg-dark-100 hover:shadow-[0_0_10px_gold]"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>
  );
  };
  
  function onDoubleClick(char) {
    setFocusedChar(char);
    setShowFocusOverlay(true);
  }

  function closeOverlay() {
    setFocusedChar(null);
    setShowFocusOverlay(false);
  }

useEffect(() => {
  fetch('http://localhost:3000/api/deal')
    .then(res => res.json())
    .then(data => {
      setPlayerDeck(data.playerDeck.slice(0, 5));
      setBotDeck(data.botDeck.slice(0, 5));

      // Send initial piles to game
      setPlayerPile(data.playerDeck.slice(5));
      setBotPile(data.botDeck.slice(5));
    })
    .catch(err => console.error('❌ Failed to fetch decks:', err));
}, []);


  if (!playerCharacter || !botCharacter) {
    return <p>Missing character selection. Please go back and choose again.</p>;
  }

  function startGameWithDifficulty(difficulty) {
navigate('/rps', {
  state: {
    playerCharacter,
    botCharacter,
    difficulty,
    playerDeck,
    botDeck,
    playerPile,
    botPile
  }
});

  }
  

  return (
    <div className="w-full min-h-screen bg-black text-gold flex flex-col items-center justify-start py-10 px-5 box-border relative">  
      <BackButton />
      
      <div className="flex justify-center flex-wrap gap-10 mb-10">
        <div
          className="w-55 p-2.5 bg-dark-300 border-2 border-dark-100 rounded-lg text-center transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:border-gold hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
          onDoubleClick={() => onDoubleClick(playerCharacter)}
        >
          <h3 className="text-lg mb-2.5">You Chose:</h3>
          <img src={`${playerCharacter.image}`} alt={playerCharacter.name} className="w-full h-auto rounded-lg mb-2" />
          <p className="text-xl font-bold">{playerCharacter.name}</p>
        </div>

        <div
          className="w-55 p-2.5 bg-dark-300 border-2 border-dark-100 rounded-lg text-center transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:border-gold hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
          onDoubleClick={() => onDoubleClick(botCharacter)}
        >
          <h3 className="text-lg mb-2.5">Bot Chose:</h3>
          <img src={`${botCharacter.image}`} alt={botCharacter.name} className="w-full h-auto rounded-lg mb-2" />
          <p className="text-xl font-bold">{botCharacter.name}</p>
        </div>
      </div>

      <h2 className="text-4xl font-bold mb-8">Select Bot Difficulty</h2>
      
      <div className="flex justify-center gap-5 flex-wrap">
        <button 
          className="px-6 py-3 text-xl font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
          onClick={() => startGameWithDifficulty('primary')}
        >
          Primary School
        </button>
        <button 
          className="px-6 py-3 text-xl font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
          onClick={() => startGameWithDifficulty('highschool')}
        >
          High School
        </button>
        <button 
          className="px-6 py-3 text-xl font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
          onClick={() => startGameWithDifficulty('university')}
        >
          University
        </button>
      </div>

      {showFocusOverlay && focusedChar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-50 animate-fade-in"
          onClick={closeOverlay}
        >
          <img
            src={`${focusedChar.image}`}
            alt={focusedChar.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-[0_0_30px_#AF803C]"
          />
        </div>
      )}
    </div>
  );
}

export default DifficultySelect;
