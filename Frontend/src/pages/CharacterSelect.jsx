// CharacterSelect.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="w-full min-h-screen bg-black text-gold flex flex-col items-center justify-start py-5 px-5 box-border max-w-1440px mx-auto">
      <h2 className="text-4xl font-bold mb-8">Select Your Character</h2>

      <div className="flex flex-wrap justify-center gap-4 w-full max-w-1440px px-5 box-border">
        {characters.map(char => (
          <div
            key={char.id}
            onClick={() => handleSelect(char.id)}
            className={`w-50 h-90 flex flex-col justify-between overflow-hidden border-2 border-dark-100 rounded-lg p-2.5 text-center bg-dark-300 text-gold transition-all duration-300 ease-in-out cursor-pointer shadow-md hover:scale-105 hover:shadow-lg hover:border-gold hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C] ${
              selected === char.id ? 'border-gold scale-105 shadow-gold text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]' : ''
            }`}
            onMouseEnter={() => onHoverStart(char)}
            onMouseLeave={onHoverEnd}
            onDoubleClick={() => handleDoubleClick(char)}
          >
            <img
              src={`${char.image}`}
              alt={char.name}
              className="w-full h-auto rounded-lg"
            />
            <p className="text-xl mt-2">{char.name}</p>
          </div>
        ))}
      </div>

      <button 
        className="mt-10 px-5 py-2.5 text-base font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#AF803C] hover:text-shadow-[0_0_5px_#AF803C,0_0_10px_#AF803C,0_0_15px_#AF803C,0_0_20px_#AF803C]"
        onClick={handleConfirm}
      >
        Confirm Selection
      </button>

      {focusChar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-50 animate-fade-in"
          onClick={() => setFocusChar(null)}
        >
          <img
            src={`${focusChar.image}`}
            alt={focusChar.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-[0_0_30px_#AF803C]"
          />
        </div>
      )}

      {/* 🌌 Full-screen hover overlay */}
      {showOverlay && hoveredChar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-50 animate-fade-in"
          onClick={onHoverEnd}
        >
          <img
            src={`${hoveredChar.image}`}
            alt={hoveredChar.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-[0_0_30px_#AF803C]"
          />
        </div>
      )}
    </div>
  );
}

export default CharacterSelect;
