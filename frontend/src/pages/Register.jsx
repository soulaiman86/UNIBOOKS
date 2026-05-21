import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'BUYER' });
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);

    if (profileImage) {
      data.append('profile_image', profileImage);
    }

    try {
      await axios.post('http://localhost:5000/api/users/register', data);
      setIsSuccess(true);
      setMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={logoStyle}>📚 UNIBOOKS</h1>
          <h2 style={titleStyle}>Create Account</h2>
          <p style={subtitleStyle}>Join our community of book lovers</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={formStyle}>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              required
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              placeholder="Create a strong password"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              required
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>I want to</label>
            <div style={roleContainerStyle}>
              <div
                onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                style={{
                  ...roleCardStyle,
                  borderColor: formData.role === 'BUYER' ? '#0f3460' : '#e2e8f0',
                  backgroundColor: formData.role === 'BUYER' ? '#f0f4ff' : 'white',
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>🛒</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.95rem' }}>Buy Books</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Browse & purchase books</span>
              </div>
              <div
                onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                style={{
                  ...roleCardStyle,
                  borderColor: formData.role === 'SELLER' ? '#0f3460' : '#e2e8f0',
                  backgroundColor: formData.role === 'SELLER' ? '#f0f4ff' : 'white',
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>📦</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '0.95rem' }}>Sell Books</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>List & sell your books</span>
              </div>
            </div>
          </div>

          {formData.role === 'SELLER' && (
            <div style={sellerBoxStyle}>
              <label style={{ ...labelStyle, color: '#0f3460' }}>
                📷 Profile Picture (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
                style={fileInputStyle}
              />
              {profileImage && (
                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#27ae60' }}>
                  ✅ {profileImage.name} selected
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={e => e.target.style.backgroundColor = '#0a2540'}
            onMouseLeave={e => e.target.style.backgroundColor = '#0f3460'}
          >
            Create Account
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

        <p style={loginLinkStyle}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={linkStyle}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >
            Login here
          </span>
        </p>

      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: '#f0f4f8',
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
  maxWidth: '480px',
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

const roleContainerStyle = {
  display: 'flex',
  gap: '12px',
};

const roleCardStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  padding: '16px 10px',
  borderRadius: '12px',
  border: '2px solid',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'center',
};

const sellerBoxStyle = {
  backgroundColor: '#f0f4ff',
  border: '1.5px dashed #0f3460',
  borderRadius: '10px',
  padding: '15px',
};

const fileInputStyle = {
  width: '100%',
  fontSize: '0.85rem',
  color: '#374151',
  marginTop: '8px',
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

const loginLinkStyle = {
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

export default Register;