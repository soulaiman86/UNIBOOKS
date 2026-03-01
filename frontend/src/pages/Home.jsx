import { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books');
        setBooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: '#7f8c8d' }}>
        Loading our collection...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#2c3e50', fontWeight: '700' }}>
        Explore Our Library
      </h1>

      <div style={gridStyle}>
        {books.length > 0 ? (
          books.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#95a5a6' }}>
            No books available at the moment.
          </p>
        )}
      </div>
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '30px',
  maxWidth: '1200px',
  margin: '0 auto'
};

export default Home;