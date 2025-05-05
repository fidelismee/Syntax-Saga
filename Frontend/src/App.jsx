import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CharacterSelect from './pages/CharacterSelect'
import DifficultySelect from './pages/DifficultySelect' // ✅ Add this line
import Game from './pages/Game';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CharacterSelect />} />
        <Route path="/select-difficulty" element={<DifficultySelect />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  )
}
