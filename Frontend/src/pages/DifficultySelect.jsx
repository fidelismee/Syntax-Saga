import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function DifficultySelect() {
  const location = useLocation();
  const navigate = useNavigate();

  const { playerCharacter, botCharacter } = location.state || {};

  if (!playerCharacter || !botCharacter) {
    return <p>Missing character selection. Please go back and choose again.</p>;
  }

  return (
    <div>
      <h2>Select Bot Difficulty</h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '30px 0' }}>
        <div>
          <h3>You Selected:</h3>
          <img
            src={`http://localhost:3000${playerCharacter.image}`}
            alt={playerCharacter.name}
            width={200}
          />
          <p>{playerCharacter.name}</p>
        </div>

        <div>
          <h3>Bot Selected:</h3>
          <img
            src={`http://localhost:3000${botCharacter.image}`}
            alt={botCharacter.name}
            width={200}
          />
          <p>{botCharacter.name}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => navigate('/game', { state: { playerCharacter, botCharacter, difficulty: 'primary' } })}>
          Primary School
        </button>
        <button onClick={() => navigate('/game', { state: { playerCharacter, botCharacter, difficulty: 'highschool' } })}>
          High School
        </button>
        <button onClick={() => navigate('/game', { state: { playerCharacter, botCharacter, difficulty: 'university' } })}>
          University
        </button>
      </div>
    </div>
  );
}

export default DifficultySelect;
