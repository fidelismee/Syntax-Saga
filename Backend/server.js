const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use('/', express.static(path.join(__dirname, '../Frontend')));

// Serve character images
app.use('/character', express.static(path.join(__dirname, '../public/character')));

// Serve all card images from /public
const cardFolders = ['adjective', 'article', 'auxiliary', 'noun', 'preposition', 'pronoun', 'specialability', 'verb'];
cardFolders.forEach(folder => {
  app.use(`/${folder}`, express.static(path.join(__dirname, `../public/${folder}`)));
});

// Load all card data from /data
function loadCardDeck() {
  const folders = ['adjective', 'article', 'auxiliary', 'noun', 'preposition', 'pronoun', 'specialability', 'verb'];
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

// Helper: Shuffle array
function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function playRockPaperScissors() {
  const choices = ['rock', 'paper', 'scissors'];

  const playerChoice = choices[Math.floor(Math.random() * 3)];
  const botChoice = choices[Math.floor(Math.random() * 3)];

  let result;
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

  return { playerChoice, botChoice, result };
}


// GET: Characters list
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

// GET: Deal cards to player and bot
app.get('/api/deal', (req, res) => {
  const fullDeck = loadCardDeck();
  const playerDeck = shuffle(fullDeck).slice(0, 5);
  const botDeck = shuffle(fullDeck).slice(0, 5);

  res.json({ playerDeck, botDeck });
});
// GET: Rock Paper Scissors simulation
app.get('/api/rps', (req, res) => {
  const outcome = playRockPaperScissors();
  res.json(outcome);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
