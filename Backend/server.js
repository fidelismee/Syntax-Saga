const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files
app.use('/', express.static(path.join(__dirname, '../Frontend')));

// ✅ Serve character images
app.use('/character', express.static(path.join(__dirname, '../public/character')));

// ✅ Serve back of card
app.use('/backcard', express.static(path.join(__dirname, '../public/backcard')));

// ✅ Serve all card images from /public
const cardFolders = [
  'adjective',
  'article',
  'auxiliary',
  'noun',
  'preposition',
  'pronoun',
  'specialability',
  'verb'
];

cardFolders.forEach(folder => {
  app.use(`/${folder}`, express.static(path.join(__dirname, `../public/${folder}`)));
});

// ✅ Load all card data from /data
function loadCardDeck() {
  const folders = cardFolders;
  let deck = [];

  folders.forEach(folder => {
    const folderPath = path.join(__dirname, `../data/${folder}`);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          deck = deck.concat(content);
        } catch (err) {
          console.warn(`❌ Failed to load or parse ${filePath}:`, err.message);
        }
      });
    }
  });

  return deck;
}

// ✅ Helper: Shuffle array
function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ✅ Rock Paper Scissors logic
function playRockPaperScissors() {
  const choices = ['rock', 'paper', 'scissors'];
  let playerChoice, botChoice, result;

  do {
    playerChoice = choices[Math.floor(Math.random() * 3)];
    botChoice = choices[Math.floor(Math.random() * 3)];

    if (playerChoice === botChoice) {
      result = 'draw';
    } else if (
      (playerChoice === 'rock' && botChoice === 'scissors') ||
      (playerChoice === 'paper' && botChoice === 'rock') ||
      (playerChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'player';
    } else {
      result = 'bot';
    }
  } while (result === 'draw');

  return { playerChoice, botChoice, result };
}

// ✅ API: Get all characters
app.get('/api/characters', (req, res) => {
  const charactersPath = path.join(__dirname, '../data/character/characters.json');
  try {
    const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
    res.json(characters);
  } catch (err) {
    console.error('❌ Failed to load characters.json:', err.message);
    res.status(500).json({ error: 'Failed to load character data.' });
  }
});

// ✅ API: Deal cards to both player and bot
app.get('/api/deal', (req, res) => {
  const fullDeck = loadCardDeck();
  const playerDeck = shuffle(fullDeck).slice(0, 5);
  const botDeck = shuffle(fullDeck).slice(0, 5);

  res.json({ playerDeck, botDeck });
});

// ✅ API: Play RPS
app.post('/api/rps', (req, res) => {
  const playerChoice = req.body.playerChoice;
  const choices = ['rock', 'paper', 'scissors'];

  let result = 'draw';
  let botChoice;
  let attempts = 0;

  while (result === 'draw' && attempts < 10) {
    botChoice = choices[Math.floor(Math.random() * 3)];
    if (playerChoice === botChoice) {
      result = 'draw';
    } else if (
      (playerChoice === 'rock' && botChoice === 'scissors') ||
      (playerChoice === 'paper' && botChoice === 'rock') ||
      (playerChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'player';
    } else {
      result = 'bot';
    }
    attempts++;
  }

  res.json({ playerChoice, botChoice, result, attempts });
});



// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
