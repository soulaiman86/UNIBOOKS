import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });
      
      // Save token to localStorage for persistent session
      localStorage.setItem('token', response.data.token);
      setMessage("✅ Login successful! Redirecting...");
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Redirect to home page after 1.5 seconds
      setTimeout(() => navigate('/'), 1500);
      
      console.log("Token received:", response.data.token);
    } catch (error) {
      setMessage("❌ Error: " + (error.response?.data?.error || "Login failed. Please check your credentials."));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Login to UNIBOOKS</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required 
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required 
          />
        </div>
        <button type="submit" style={buttonStyle}>
          Login
        </button>
      </form>
      {message && (
        <p style={{ 
          marginTop: '15px', 
          textAlign: 'center', 
          color: message.includes('✅') ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {message}
        </p>
      )}
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
        Don't have an account? <span style={{ color: '#27ae60', cursor: 'pointer' }} onClick={() => navigate('/register')}>Register here</span>
      </p>
    </div>
  );
}

// Shared styles for consistency
const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '5px', 
  border: '1px solid #ccc', 
  boxSizing: 'border-box',
  fontSize: '1rem'
};

const buttonStyle = { 
  width: '100%', 
  padding: '12px', 
  backgroundColor: '#2c3e50', 
  color: 'white', 
  border: 'none', 
  borderRadius: '5px', 
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold'
};

export default Login;