import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'FICTION',
    condition: 'New',
    seller_id: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [stock, setStock] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    if (!user || user.role !== 'SELLER') {
      alert("Sorry, this page is for sellers only!");
      navigate('/');
    } else {
      setFormData(prev => ({ ...prev, seller_id: user.id }));
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('condition', formData.condition);
    data.append('seller_id', formData.seller_id);
    data.append('image', imageFile);
    data.append('stock', stock);

    try {
  await axios.post('http://localhost:5000/api/books/add', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  alert('Book added successfully!');
  navigate('/');
} catch (error) {
  if (error.response?.data?.error === "SUBSCRIPTION_REQUIRED") {
    const confirm = window.confirm(
      "⚠️ You have reached the free limit of 3 books.\n\nUpgrade your subscription to add more books.\n\nClick OK to view subscription plans."
    );
    if (confirm) navigate('/subscription/plans');
  } else {
    alert('Failed: ' + (error.response?.data?.error || "Server Error"));
  }
}
 };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={logoStyle}>📚 UNIBOOKS</h1>
          <h2 style={titleStyle}>List a New Book</h2>
          <p style={subtitleStyle}>Fill in the details to list your book for sale</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>

          {/* Book Title */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Book Title</label>
            <input
              type="text"
              placeholder="Enter book title"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Describe the book..."
              required
              style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Price and Stock */}
          <div style={rowStyle}>
            <div style={{ ...fieldGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0f3460'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div style={{ ...fieldGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Available Stock</label>
              <input
                type="number"
                min="1"
                value={stock}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0f3460'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Category</label>
            <select
              style={selectStyle}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="FICTION">Fiction</option>
              <option value="SCIENCE">Science</option>
              <option value="HISTORY">History</option>
              <option value="COOKING">Cooking</option>
              <option value="TECHNOLOGY">Technology</option>
            </select>
          </div>

          {/* Book Condition */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Book Condition</label>
            <div style={conditionRowStyle}>
              <div
                onClick={() => setFormData({ ...formData, condition: 'New' })}
                style={{
                  ...conditionCardStyle,
                  borderColor: formData.condition === 'New' ? '#0f3460' : '#e2e8f0',
                  backgroundColor: formData.condition === 'New' ? '#f0f4ff' : 'white',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>✨</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>New</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Brand new book</span>
              </div>
              <div
                onClick={() => setFormData({ ...formData, condition: 'Used' })}
                style={{
                  ...conditionCardStyle,
                  borderColor: formData.condition === 'Used' ? '#0f3460' : '#e2e8f0',
                  backgroundColor: formData.condition === 'Used' ? '#f0f4ff' : 'white',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>📖</span>
                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>Used</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Previously read</span>
              </div>
            </div>
          </div>

          {/* Book Cover */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Book Cover Image</label>
            <div style={fileBoxStyle}>
              <span style={{ fontSize: '2rem' }}>🖼️</span>
              <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
                {imageFile ? imageFile.name : 'Click to upload book cover'}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG supported</p>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files[0])}
                style={fileInputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={e => e.target.style.backgroundColor = '#0a2540'}
            onMouseLeave={e => e.target.style.backgroundColor = '#0f3460'}
          >
            📚 List Book for Sale
          </button>

        </form>
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  padding: '40px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '40px',
  width: '100%',
  maxWidth: '550px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
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
  fontSize: '1.5rem',
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
  gap: '20px',
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const rowStyle = {
  display: 'flex',
  gap: '15px',
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
  fontFamily: 'inherit',
};

const selectStyle = {
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  backgroundColor: '#f8fafc',
  boxSizing: 'border-box',
  width: '100%',
  cursor: 'pointer',
  color: '#374151',
};

const conditionRowStyle = {
  display: 'flex',
  gap: '12px',
};

const conditionCardStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  padding: '14px 10px',
  borderRadius: '12px',
  border: '2px solid',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'center',
};

const fileBoxStyle = {
  position: 'relative',
  border: '2px dashed #e2e8f0',
  borderRadius: '12px',
  padding: '25px',
  textAlign: 'center',
  backgroundColor: '#f8fafc',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
};

const fileInputStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'pointer',
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

export default AddBook;