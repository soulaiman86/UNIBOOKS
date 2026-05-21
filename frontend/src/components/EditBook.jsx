import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('New');
    const [stock, setStock] = useState(1);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/books/${id}`);
                const book = response.data;
                setTitle(book.title);
                setDescription(book.description);
                setPrice(book.price);
                setCategory(book.category);
                setCondition(book.condition || 'New');
                setStock(book.stock || 1);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching book details:", error);
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('condition', condition);
        formData.append('stock', stock);
        if (image) formData.append('image', image);

        try {
            await axios.put(`http://localhost:5000/api/books/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Book updated successfully!");
            navigate(`/book/${id}`);
        } catch (error) {
            alert("Failed to update book.");
        }
    };

    if (loading) return (
        <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p style={{ color: '#64748b', marginTop: '15px' }}>Loading book data...</p>
        </div>
    );

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>

                {/* Header */}
                <div style={headerStyle}>
                    <h1 style={logoStyle}>📚 UNIBOOKS</h1>
                    <h2 style={titleStyle}>Edit Book Details</h2>
                    <p style={subtitleStyle}>Update your book information</p>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>

                    {/* Title */}
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>Book Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#0f3460'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                            onFocus={e => e.target.style.borderColor = '#0f3460'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            required
                        />
                    </div>

                    {/* Price and Stock */}
                    <div style={rowStyle}>
                        <div style={{ ...fieldGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Price ($)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#0f3460'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                required
                            />
                        </div>
                        <div style={{ ...fieldGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Available Stock</label>
                            <input
                                type="number"
                                min="1"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#0f3460'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="FICTION">Fiction</option>
                            <option value="SCIENCE">Science</option>
                            <option value="HISTORY">History</option>
                            <option value="COOKING">Cooking</option>
                            <option value="TECHNOLOGY">Technology</option>
                        </select>
                    </div>

                    {/* Condition */}
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>Book Condition</label>
                        <div style={conditionRowStyle}>
                            <div
                                onClick={() => setCondition('New')}
                                style={{
                                    ...conditionCardStyle,
                                    borderColor: condition === 'New' ? '#0f3460' : '#e2e8f0',
                                    backgroundColor: condition === 'New' ? '#f0f4ff' : 'white',
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>✨</span>
                                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>New</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Brand new book</span>
                            </div>
                            <div
                                onClick={() => setCondition('Used')}
                                style={{
                                    ...conditionCardStyle,
                                    borderColor: condition === 'Used' ? '#0f3460' : '#e2e8f0',
                                    backgroundColor: condition === 'Used' ? '#f0f4ff' : 'white',
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>📖</span>
                                <span style={{ fontWeight: '600', color: '#1a1a2e' }}>Used</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Previously read</span>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>Update Cover Image (Optional)</label>
                        <div style={fileBoxStyle}>
                            <span style={{ fontSize: '2rem' }}>🖼️</span>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
                                {image ? image.name : 'Click to upload a new cover'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG supported</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                style={fileInputStyle}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={rowStyle}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={cancelButtonStyle}
                            onMouseEnter={e => e.target.style.backgroundColor = '#64748b'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#94a3b8'}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={saveButtonStyle}
                            onMouseEnter={e => e.target.style.backgroundColor = '#1e8449'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#27ae60'}
                        >
                            💾 Save Changes
                        </button>
                    </div>

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
    maxWidth: '580px',
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

const saveButtonStyle = {
    flex: 1,
    padding: '13px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
};

const cancelButtonStyle = {
    flex: 1,
    padding: '13px',
    backgroundColor: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
};

const loadingStyle = {
    textAlign: 'center',
    marginTop: '100px',
};

const spinnerStyle = {
    width: '45px',
    height: '45px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #0f3460',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
};

export default EditBook;