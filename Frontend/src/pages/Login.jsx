// Frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'zach' && password === 'zach579') {
      navigate('/character-select');
    } else {
      setError('⚠️ Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Enter the Realm</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button">Enter</button>
        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
