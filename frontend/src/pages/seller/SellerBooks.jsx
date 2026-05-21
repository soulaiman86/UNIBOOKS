import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SellerBooks() {
    const [books, setBooks] = useState([]);
    const userData = JSON.parse(localStorage.getItem("user"));
    const sellerId = userData?.id;
    const navigate = useNavigate();

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/seller/books/${sellerId}`);
            setBooks(res.data);
        } catch (err) {
            console.error("Error fetching books:", err);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/seller/books/${id}`);
            alert("Book deleted successfully.");
            fetchBooks();
        } catch (err) {
            console.error("Error deleting book:", err);
            alert("Failed to delete book.");
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>📚 My Books</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Stock</th>
                        <th style={thStyle}>Added</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No books found.</td>
                        </tr>
                    ) : (
                        books.map(book => (
                            <tr key={book.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>{book.title}</td>
                                <td style={tdStyle}>${Number(book.price).toFixed(2)}</td>
                                <td style={tdStyle}>
                                    <span style={stockBadgeStyle(book.stock)}>{book.stock}</span>
                                </td>
                                <td style={tdStyle}>{new Date(book.created_at).toLocaleDateString()}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => navigate(`/edit-book/${book.id}`)}
                                            style={editButtonStyle}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            style={deleteButtonStyle}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

const thStyle = { padding: '14px 16px', textAlign: 'left', fontWeight: 'bold' };
const tdStyle = { padding: '12px 16px' };
const editButtonStyle = { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const deleteButtonStyle = { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const stockBadgeStyle = (stock) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: stock > 0 ? '#27ae60' : '#e74c3c',
    color: 'white'
});

export default SellerBooks;