import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsSuccess(true);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={logoStyle}>📚 UNIBOOKS</h1>
          <h2 style={titleStyle}>Welcome Back!</h2>
          <p style={subtitleStyle}>Login to continue your journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={formStyle}>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              required
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              required
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={e => e.target.style.backgroundColor = '#0a2540'}
            onMouseLeave={e => e.target.style.backgroundColor = '#0f3460'}
          >
            Login
          </button>

        </form>

        {message && (
          <div style={{
            ...messageStyle,
            backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2',
            borderColor: isSuccess ? '#27ae60' : '#e74c3c',
            color: isSuccess ? '#27ae60' : '#e74c3c',
          }}>
            {isSuccess ? '✅' : '❌'} {message}
          </div>
        )}

        <p style={registerLinkStyle}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            style={linkStyle}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >
            Register here
          </span>
        </p>

      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '40px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
};

const logoStyle = {
  fontSize: '1.8rem',
  fontWeight: '800',
  color: '#0f3460',
  margin: '0 0 10px 0',
};

const titleStyle = {
  fontSize: '1.6rem',
  fontWeight: '700',
  color: '#1a1a2e',
  margin: '0 0 6px 0',
};

const subtitleStyle = {
  fontSize: '0.9rem',
  color: '#64748b',
  margin: 0,
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#374151',
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: '#f8fafc',
  boxSizing: 'border-box',
  width: '100%',
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#0f3460',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '1rem',
  transition: 'background-color 0.2s',
  marginTop: '5px',
};

const messageStyle = {
  marginTop: '15px',
  padding: '12px 15px',
  borderRadius: '10px',
  border: '1px solid',
  fontSize: '0.9rem',
  fontWeight: '600',
  textAlign: 'center',
};

const registerLinkStyle = {
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '0.9rem',
  color: '#64748b',
};

const linkStyle = {
  color: '#0f3460',
  fontWeight: '700',
  cursor: 'pointer',
  textDecoration: 'none',
};

export default Login;