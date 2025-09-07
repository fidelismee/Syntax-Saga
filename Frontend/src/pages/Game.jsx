// Frontend/src/pages/Game.jsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function Game() {
  const location = useLocation();
  const {
    playerCharacter,
    botCharacter,
    playerDeck: initialDeck,
    botDeck: initialBotDeck,
    playerPile: initialPlayerPile,
    botPile: initialBotPile,
    difficulty,
    firstTurn
  } = location.state || {};

  const [playerCardPile, setPlayerCardPile] = useState(initialPlayerPile || []);
  const [botCardPile, setBotCardPile] = useState(initialBotPile || []);
  const [turn, setTurn] = useState(firstTurn); // 'player' or 'bot'
  const [playerDeck, setPlayerDeck] = useState(initialDeck || []);
  const [botDeck, setBotDeck] = useState(initialBotDeck || []);
  const [playerPlayArea, setPlayerPlayArea] = useState([]);
  const [botPlayArea, setBotPlayArea] = useState([]);
  const [playerDiscard, setPlayerDiscard] = useState([]);
  const [botDiscard, setBotDiscard] = useState([]);
  const [botAction, setBotAction] = useState(null);
  const [playerHealth, setPlayerHealth] = useState(playerCharacter?.HP || 50);
  const [botHealth, setBotHealth] = useState(botCharacter?.HP || 50);
  const [roundComplete, setRoundComplete] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const fetchBotMove = async () => {
    const payload = {
      botCharacter: {
        id: botCharacter.id,
        name: botCharacter.name,
        image: botCharacter.image,
        HP: botHealth,
        special_ability: botCharacter.special_ability || botCharacter.ability || ""
      },
      botDeck,
      difficulty
    };

    try {
      const response = await fetch('http://127.0.0.1:8001/api/bot/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.status === 'ok') {
        const { played_cards, skip_turn, use_special_ability } = data.move;

        if (!skip_turn) {
          const playedCardObjects = botDeck.filter(card =>
            played_cards.includes(card.value || card.name)
          );

          setBotPlayArea(playedCardObjects);
          setBotDeck(prev => prev.filter(card => !playedCardObjects.includes(card)));
          setBotDiscard(prev => [...prev, ...playedCardObjects]);

          // 👉 Evaluate bot's sentence and damage player
          try {
            const evalRes = await fetch('http://127.0.0.1:8000/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cards: playedCardObjects })
            });

            const evalResult = await evalRes.json();
            if (evalResult.valid) {
              setPlayerHealth(prev => Math.max(0, prev - evalResult.damage));
            }
          } catch (e) {
            console.error("Bot evaluation failed", e);
          }

          // 🧹 Clear bot play area after use
          setBotPlayArea([]);
        }

        setBotAction(
          skip_turn ? 'Bot skipped its turn.' :
            use_special_ability ? 'Bot used its special ability!' :
              `Bot played: ${played_cards.join(', ')}`
        );
      } else {
        setBotAction('Bot failed to act.');
      }
    } catch (err) {
      setBotAction('Error fetching bot move.');
    }

    setRoundComplete(true);
    setTurn('player');
  };

  const handleSubmit = async () => {
    if (playerPlayArea.length === 0) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: playerPlayArea })
      });

      const result = await response.json();

      if (result.valid) {
        setBotHealth(prev => Math.max(0, prev - result.damage));
      }

      setPlayerDiscard(prev => [...prev, ...playerPlayArea]);
      setPlayerPlayArea([]); // 🧹 Clear player play area immediately
      setRoundComplete(true);
      setTurn('bot');
    } catch (error) {
      console.error("❌ Error evaluating sentence:", error);
    }
  };

  const drawCardsForNewRound = () => {
    const draw = (pile, count) => {
      const drawn = pile.slice(0, count);
      const rest = pile.slice(count);
      return [drawn, rest];
    };

    const [newPlayerCards, remainingPlayerPile] = draw(playerCardPile, 2);
    const [newBotCards, remainingBotPile] = draw(botCardPile, 2);

    setPlayerCardPile(remainingPlayerPile);
    setBotCardPile(remainingBotPile);
    setPlayerDeck(prev => [...prev, ...newPlayerCards]);
    setBotDeck(prev => [...prev, ...newBotCards]);
  };

  useEffect(() => {
    if (roundComplete) {
      drawCardsForNewRound();
      setRoundComplete(false);
    }
  }, [roundComplete]);

  useEffect(() => {
    if (turn === 'bot') {
      fetchBotMove();
    }
  }, [turn]);

  const handleDrop = (e, target) => {
    e.preventDefault();
    const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'), 10);
    const card = playerDeck[cardIndex];
    if (target === 'player') {
      setPlayerPlayArea(prev => [...prev, card]);
      const newDeck = [...playerDeck];
      newDeck.splice(cardIndex, 1);
      setPlayerDeck(newDeck);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('cardIndex', index);
  };

  if (!playerCharacter || !botCharacter) {
    return <p>Missing game data. Please restart the game setup.</p>;
  }

  console.log("🔍 Current Bot Deck:", botDeck);

  function handleCardDoubleClick(card) {
    setHoveredCard(card);
    setShowOverlay(true);
  }

  function closeOverlay() {
    setShowOverlay(false);
    setHoveredCard(null);
  }

return (
  <div className="w-full h-full flex flex-col justify-between p-5 box-border">
    <div className="flex justify-between items-center flex-1">
      {/* Left column - Piles */}
      <div className="flex flex-col justify-between items-center w-32 h-full">
        <div className="flex flex-col items-center">
          <img src="/backcard/backcard.png" alt="Bot Deck" className="pile-card" />
          <p className="font-aboreto text-sm text-gold mt-1">Bot Deck</p>
        </div>

        <div className="flex flex-col items-center">
          <img src="/backcard/backcard.png" alt="Your Deck" className="pile-card" />
          <p className="font-aboreto text-sm text-gold mt-1">Your Deck</p>
        </div>
      </div>

      {/* Center game board */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Bot section */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex items-end justify-center gap-5 mb-2.5">
            {botDeck.map((_, index) => (
              <img
                key={index}
                src="/backcard/backcard.png"
                alt="Bot Card"
                className="card"
              />
            ))}
          </div>

          <div className="flex items-center gap-5 mx-2.5">
            <div className="text-center">
              <img src={`${botCharacter.image}`} alt={botCharacter.name} className="w-24 border-2 border-gold rounded-lg" />
              <p className="font-bold text-gold mt-1">{botCharacter.name}</p>
              <p className="text-sm font-bold text-red-500 my-1">{botHealth} HP</p>
              <div className="w-24 h-3 bg-dark-300 border border-gold rounded-lg mt-1 overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-300 ease-in-out rounded-lg" style={{ width: `${botHealth}%` }}></div>
              </div>
            </div>

            <div
              className="relative min-w-[300px] max-w-[600px] h-32 border-2 border-gold/50 rounded-xl bg-dark-100/50 p-3 flex items-center justify-center gap-3 backdrop-blur-sm transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-xl pointer-events-none"></div>
              <div className="absolute top-1/2 transform -translate-y-1/2 font-aboreto text-3xl text-gold opacity-20 z-0 pointer-events-none text-shadow-glow animate-pulse rotate-180">
                PHRASE / SENTENCE
              </div>
              {botPlayArea.map((card, index) => (
                <img 
                  key={index} 
                  src={`${card.image}`} 
                  alt={card.name} 
                  className="card transform hover:scale-110 transition-transform duration-200 shadow-lg" 
                />
              ))}
              {botPlayArea.length === 0 && (
                <div className="text-gold/50 italic text-sm font-medium">Bot's play area</div>
              )}
            </div>
          </div>
        </div>

        {/* Player section */}
        <div className="flex items-center gap-5 mx-2.5 my-2.5">
          <div className="text-center">
            <img src={`${playerCharacter.image}`} alt={playerCharacter.name} className="w-24 border-2 border-gold rounded-lg" />
            <p className="font-bold text-gold mt-1">{playerCharacter.name}</p>
            <p className="text-sm font-bold text-red-500 my-1">{playerHealth} HP</p>
            <div className="w-24 h-3 bg-dark-300 border border-gold rounded-lg mt-1 overflow-hidden">
              <div className="h-full bg-red-500 transition-all duration-300 ease-in-out rounded-lg" style={{ width: `${playerHealth}%` }}></div>
            </div>
          </div>

          <div
            className="relative min-w-[300px] max-w-[600px] h-32 border-2 border-gold/50 rounded-xl bg-dark-100/50 p-3 flex items-center justify-center gap-3 backdrop-blur-sm transition-all duration-300 hover:border-gold/70 hover:bg-dark-100/70 hover:shadow-gold"
            onDragOver={e => {
              e.preventDefault();
              e.currentTarget.classList.add('border-gold', 'bg-dark-100/80', 'shadow-gold');
            }}
            onDragLeave={e => {
              e.currentTarget.classList.remove('border-gold', 'bg-dark-100/80', 'shadow-gold');
            }}
            onDrop={e => {
              e.currentTarget.classList.remove('border-gold', 'bg-dark-100/80', 'shadow-gold');
              handleDrop(e, 'player');
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-xl pointer-events-none"></div>
            <div className="absolute top-1/2 transform -translate-y-1/2 font-aboreto text-3xl text-gold opacity-20 z-0 pointer-events-none text-shadow-glow animate-pulse">
              PHRASE / SENTENCE
            </div>
            {playerPlayArea.map((card, index) => (
              <img 
                key={index} 
                src={`${card.image}`} 
                alt={card.name} 
                className="card transform hover:scale-110 transition-transform duration-200 shadow-lg" 
              />
            ))}
            {playerPlayArea.length === 0 && (
              <div className="text-gold/50 italic text-sm font-medium">Drop cards here to form a sentence</div>
            )}
          </div>
        </div>

        {/* Player hand */}
        <div className="flex items-end justify-center gap-5 mt-5">
          <div className="flex gap-5">
            {playerDeck.map((card, index) => (
              <img
                key={index}
                src={`${card.image}`}
                alt={card.name}
                className="player-card"
                draggable={turn === 'player'}
                onDragStart={e => handleDragStart(e, index)}
                onDoubleClick={() => handleCardDoubleClick(card)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right column - Discard piles */}
      <div className="flex flex-col justify-between items-center w-32 h-full">
        <div className="flex flex-col items-center">
          <p className="font-aboreto text-lg text-gold tracking-wider text-shadow-gold mb-2.5 rotate-180">DISCARD</p>
          <div className="relative w-22 h-36">
            {botDiscard.slice(-5).map((card, i) => (
              <img key={i} src={`${card.image}`} alt={card.name} className="discard-card" style={{ transform: `translate(${i * 3}px, ${i * 3}px)` }} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-aboreto text-lg text-gold tracking-wider text-shadow-gold mb-2.5">DISCARD</p>
          <div className="relative w-22 h-36">
            {playerDiscard.slice(-5).map((card, i) => (
              <img key={i} src={`${card.image}`} alt={card.name} className="discard-card" style={{ transform: `translate(${i * 3}px, ${i * 3}px)` }} />
            ))}
          </div>
        </div>
      </div>
    </div>

    {botAction && (
      <div className="bg-dark-200 border border-gold rounded-lg p-3 text-center mx-auto mb-5">
        <p className="text-gold"><strong>Bot played:</strong> {botAction}</p>
      </div>
    )}

    <div className="flex justify-center items-center gap-10 mt-5">
      <button 
        onClick={handleSubmit} 
        disabled={turn !== 'player'}
        className="px-6 py-3 text-base font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Sentence
      </button>
      <div className="flex items-center gap-4">
        <button 
          className="px-4 py-2 text-sm font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg cursor-pointer transition-all duration-300 hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={turn !== 'player'} 
          onClick={() => setTurn('bot')}
        >
          Skip Turn
        </button>
        <div
          className="relative mt-2 cursor-pointer"
          onClick={() => console.log('🛡️ Skill Activated!')}
          title="Activate Skill"
        >
          <div className="px-4 py-2 text-sm font-bold bg-dark-100 text-gold border-2 border-gold rounded-lg transition-all duration-300 hover:shadow-gold"></div>
        </div>
      </div>
    </div>

    {showOverlay && hoveredCard && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 animate-fade-in"
        onClick={closeOverlay}
      >
        <img
          src={`${hoveredCard.image}`}
          alt={hoveredCard.name}
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-gold"
        />
      </div>
    )}
  </div>
);

}

export default Game;
