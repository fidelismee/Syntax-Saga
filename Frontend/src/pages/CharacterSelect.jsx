import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CharacterSelect() {
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate(); // ✅ make sure this exists

  useEffect(() => {
    fetch('http://localhost:3000/api/characters')
      .then(res => res.json())
      .then(data => setCharacters(data))
      .catch(err => console.error('Failed to fetch characters:', err));
  }, []);

  function handleSelect(id) {
    setSelected(id);
  }

  function handleConfirm() {
    if (!selected) {
      alert('Please select a character');
      return;
    }

    const playerCharacter = characters.find(c => c.id === selected);
    const botCharacter = characters[Math.floor(Math.random() * characters.length)];

    navigate('/select-difficulty', {
      state: { playerCharacter, botCharacter } // ✅ pass both as route state
    });
  }

  return (
    <div>
      <h2>Select Your Character</h2>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {characters.map(char => (
          <div
            key={char.id}
            onClick={() => handleSelect(char.id)}
            style={{
              border: selected === char.id ? '3px solid blue' : '1px solid black',
              padding: '10px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <img
              src={`http://localhost:3000${char.image}`}
              alt={char.name}
              style={{ width: '150px', height: '200px', objectFit: 'cover' }}
            />
            <p>{char.name}</p>
          </div>
        ))}
      </div>
      <br />
      <button onClick={handleConfirm}>Confirm Selection</button>
    </div>
  );
}

export default CharacterSelect;
