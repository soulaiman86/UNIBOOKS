import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function BookDetails() {
  const { id } = useParams(); // الحصول على id الكتاب من الرابط
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching book details:", error);
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (!book) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Book not found!</div>;

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        {/* قسم الصورة */}
        <div style={imageSection}>
          <img src={book.image_urls[0]} alt={book.title} style={imageStyle} />
        </div>

        {/* قسم المعلومات */}
        <div style={infoSection}>
          <p style={categoryTag}>{book.category}</p>
          <h1 style={titleStyle}>{book.title}</h1>
          <p style={descriptionStyle}>{book.description}</p>
          <h2 style={priceStyle}>${book.price}</h2>
          
          <button style={buyButtonStyle}>Buy Now</button>
        </div>
      </div>
    </div>
  );
}

// التنسيقات
const containerStyle = { maxWidth: '1000px', margin: '50px auto', padding: '20px' };
const contentWrapper = { display: 'flex', gap: '40px', flexWrap: 'wrap' };
const imageSection = { flex: '1', minWidth: '300px' };
const imageStyle = { width: '100%', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const infoSection = { flex: '1.2', minWidth: '300px' };
const categoryTag = { color: '#27ae60', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' };
const titleStyle = { fontSize: '2.5rem', margin: '10px 0', color: '#2c3e50' };
const descriptionStyle = { lineHeight: '1.6', color: '#555', marginBottom: '20px' };
const priceStyle = { fontSize: '2rem', color: '#2c3e50', marginBottom: '30px' };
const buyButtonStyle = { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '15px 40px', fontSize: '1.1rem', borderRadius: '8px', cursor: 'pointer', width: '100%' };

export default BookDetails;