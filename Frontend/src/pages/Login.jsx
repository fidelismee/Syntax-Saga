// Frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'ZACH' && password === 'ZACH') {
      navigate('/character-select');
    } else {
      setError('⚠️ Invalid credentials');
    }
  };

  return (
    <div className="h-screen bg-black text-gold flex flex-col items-center justify-center font-aboreto">
      <h2 className="text-4xl mb-6 text-shadow-[0_0_10px_gold]">Enter the Realm</h2>
      <form className="flex flex-col gap-4 w-80" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          className="p-3 bg-dark-300 border-2 border-gold rounded text-gold text-base"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 bg-dark-300 border-2 border-gold rounded text-gold text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          type="submit" 
          className="p-3 font-bold bg-dark-100 text-gold border-2 border-gold rounded cursor-pointer transition-all duration-300 hover:shadow-[0_0_12px_gold]"
        >
          Enter
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
