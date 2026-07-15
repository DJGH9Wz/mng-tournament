import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/api-token-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas. Intenta nuevamente.');
      }

      const data = await response.json();
      await login(data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Hubo un problema al conectar con el servidor.');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Iniciar Sesión</h2>
      {error && <p className="auth-error">{error}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label className="auth-label">Usuario</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <div className="auth-field">
          <label className="auth-label">Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <button type="submit" className="auth-submit-btn">
          Entrar
        </button>
      </form>
      <p className="auth-footer-text">
        ¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link>
      </p>
    </div>
  );
};
