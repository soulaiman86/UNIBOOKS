import React, { useState, useEffect } from 'react'; // أضفنا useEffect هنا
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'FICTION', 
    seller_id: '' // سنغيره تلقائياً في الخطوة القادمة
  });
  
  const [imageFile, setImageFile] = useState(null);

  // 1. كود الحماية (يفحص الصلاحيات عند فتح الصفحة)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== 'SELLER') {
      alert("Sorry, this page is for sellers only!");
      navigate('/'); 
    }else{
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
    data.append('seller_id', formData.seller_id);
    data.append('image', imageFile);

    try {
      await axios.post('http://localhost:5000/api/books/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Book added successfully!');
      navigate('/'); 
    } catch (error) {
      console.error("Error details:", error.response?.data);
      alert('Failed: ' + (error.response?.data?.error || "Server Error"));
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Add New Book</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input type="text" placeholder="Book Title" required 
          onChange={(e) => setFormData({...formData, title: e.target.value})} />
        
        <textarea placeholder="Description" required 
          onChange={(e) => setFormData({...formData, description: e.target.value})} />
        
        <input type="number" step="0.01" placeholder="Price" required 
          onChange={(e) => setFormData({...formData, price: e.target.value})} />
        
        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
          <option value="FICTION">FICTION</option>
          <option value="SCIENCE">SCIENCE</option>
          <option value="HISTORY">HISTORY</option>
          <option value="COOKING">COOKING</option>
          <option value="TECHNOLOGY">TECHNOLOGY</option>
        </select>

        <label>Upload Book Cover:</label>
        <input 
          type="file" 
          accept="image/*" 
          required 
          onChange={(e) => setImageFile(e.target.files[0])} 
        />

        <button type="submit" style={buttonStyle}>List Book</button>
      </form>
    </div>
  );
};

const containerStyle = { maxWidth: '500px', margin: '50px auto', padding: '20px', boxShadow: '0 0 10px #ccc', borderRadius: '10px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const buttonStyle = { padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' };

export default AddBook;