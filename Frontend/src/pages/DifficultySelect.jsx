import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DifficultySelect.css';

function DifficultySelect() {
  const location = useLocation();
  const navigate = useNavigate();

  const { playerCharacter, botCharacter } = location.state || {};
  const [playerDeck, setPlayerDeck] = useState([]);
  const [botDeck, setBotDeck] = useState([]);

  const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button className="back-button" onClick={() => navigate(-1)}>
      ← Back
    </button>
  );
  };
  
  useEffect(() => {
    // Fetch 5 shuffled cards for both player and bot
    fetch('http://localhost:3000/api/deal')
      .then(res => res.json())
      .then(data => {
        setPlayerDeck(data.playerDeck.slice(0, 5));
        setBotDeck(data.botDeck.slice(0, 5));
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
        botDeck
      }
    });
  }
  

  return (
    <div className="difficulty-container">  
      <div className="character-preview">
        <div className="character-block">
          <h3>You Chose:</h3>
          <img src={`http://localhost:3000${playerCharacter.image}`} alt={playerCharacter.name} />
          <p>{playerCharacter.name}</p>
        </div>

        <div className="character-block">
          <h3>Bot Chose:</h3>
          <img src={`http://localhost:3000${botCharacter.image}`} alt={botCharacter.name} />
          <p>{botCharacter.name}</p>
        </div>
      </div>

      <h2>Select Bot Difficulty</h2>
      
      <div className="difficulty-buttons">
        <button onClick={() => startGameWithDifficulty('primary')}>
          Primary School
        </button>
        <button onClick={() => startGameWithDifficulty('highschool')}>
          High School
        </button>
        <button onClick={() => startGameWithDifficulty('university')}>
          University
        </button>
      </div>
    </div>
  );
}

export default DifficultySelect;
