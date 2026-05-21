import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');

    const fetchBooks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/books');
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
            await axios.delete(`http://localhost:5000/api/admin/books/${id}`);
            alert("Book deleted successfully.");
            fetchBooks();
        } catch (err) {
            console.error("Error deleting book:", err);
            alert("Failed to delete book.");
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.seller_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>📚 Books Management</h2>

            {/* خانة البحث */}
            <input
                type="text"
                placeholder="Search by title or seller..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchStyle}
            />

            {/* جدول الكتب */}
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Seller</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Stock</th>
                        <th style={thStyle}>Added</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBooks.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No books found.</td>
                        </tr>
                    ) : (
                        filteredBooks.map(book => (
                            <tr key={book.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>{book.title}</td>
                                <td style={tdStyle}>{book.seller_name}</td>
                                <td style={tdStyle}>${Number(book.price).toFixed(2)}</td>
                                <td style={tdStyle}>
                                    <span style={stockBadgeStyle(book.stock)}>{book.stock}</span>
                                </td>
                                <td style={tdStyle}>{new Date(book.created_at).toLocaleDateString()}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => handleDelete(book.id)}
                                        style={deleteButtonStyle}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

const searchStyle = { width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '0.95rem', outline: 'none' };
const thStyle = { padding: '14px 16px', textAlign: 'left', fontWeight: 'bold' };
const tdStyle = { padding: '12px 16px' };
const deleteButtonStyle = { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

const stockBadgeStyle = (stock) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: stock > 0 ? '#27ae60' : '#e74c3c',
    color: 'white'
});

export default AdminBooks;