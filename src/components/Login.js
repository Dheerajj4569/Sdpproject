import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state for tracking login status

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', { username, password });
    // Here you can implement your actual login logic, for now, let's just simulate a successful login
    setIsLoggedIn(true);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {/* Conditional rendering of success message */}
      {isLoggedIn && (
        <p style={{ color: 'green' }}>Successfully logged in!</p>
      )}
    </div>
  );
};

export default Login;
