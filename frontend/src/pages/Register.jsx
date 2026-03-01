import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'BUYER' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      setMessage("✅ Account created successfully!");
      setTimeout(() => navigate('/login'), 2000); // الانتقال لصفحة الدخول بعد ثانيتين
    } catch (error) {
      setMessage("❌ Error: " + (error.response?.data?.error || "Registration failed"));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', fontFamily: 'Arial' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} required />
        <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} style={inputStyle} required />
        <select onChange={(e) => setFormData({...formData, role: e.target.value})} style={inputStyle}>
          <option value="BUYER">I want to Buy books</option>
          <option value="SELLER">I want to Sell books</option>
        </select>
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };

export default Register;