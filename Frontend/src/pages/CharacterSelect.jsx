// CharacterSelect.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CharacterSelect.css';

function CharacterSelect() {
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hoveredChar, setHoveredChar] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [focusChar, setFocusChar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/characters')
      .then(res => res.json())
      .then(data => setCharacters(data))
      .catch(err => console.error('Failed to fetch characters:', err));
  }, []);

  function handleDoubleClick(char) {
  setFocusChar(char);
  }

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
      state: { playerCharacter, botCharacter }
    });
  }

  // ⏱️ Handle delayed hover
  const hoverTimer = useRef(null);
  function onHoverStart(char) {
    hoverTimer.current = setTimeout(() => {
    setHoveredChar(char);
    setShowOverlay(true);
    }, 500);
  }

  function onHoverEnd() {
    clearTimeout(hoverTimer.current);
    setShowOverlay(false);
    setHoveredChar(null);
  }

  return (
    <div className="character-container">
      <h2 className="character-title">Select Your Character</h2>

      <div className="character-grid">
        {characters.map(char => (
          <div
            key={char.id}
            onClick={() => handleSelect(char.id)}
            className={`character-card ${selected === char.id ? 'selected' : ''}`}
            onMouseEnter={() => onHoverStart(char)}
            onMouseLeave={onHoverEnd}
            onDoubleClick={() => handleDoubleClick(char)}
          >
            <img
              src={`http://localhost:3000${char.image}`}
              alt={char.name}
              className="character-image"
            />
            <p className="character-name">{char.name}</p>
          </div>
        ))}
      </div>

      <button className="confirm-button" onClick={handleConfirm}>
        Confirm Selection
      </button>

      {focusChar && (
        <div className="focus-overlay" onClick={() => setFocusChar(null)}>
          <img
            src={`http://localhost:3000${focusChar.image}`}
            alt={focusChar.name}
            className="focus-image"
          />
        </div>
      )}

      {/* 🌌 Full-screen hover overlay */}
      {showOverlay && hoveredChar && (
        <div className="character-overlay" onClick={onHoverEnd}>
          <img
            src={`http://localhost:3000${hoveredChar.image}`}
            alt={hoveredChar.name}
            className="overlay-image"
          />
        </div>
      )}
    </div>
  );
}

export default CharacterSelect;
