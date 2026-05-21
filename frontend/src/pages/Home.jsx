import { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: '',
    seller: '',
    min_price: '',
    max_price: ''
  });

  const fetchBooks = async (currentFilters) => {
    try {
      setLoading(true);
      const params = {};
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.category) params.category = currentFilters.category;
      if (currentFilters.condition) params.condition = currentFilters.condition;
      if (currentFilters.seller) params.seller = currentFilters.seller;
      if (currentFilters.min_price) params.min_price = currentFilters.min_price;
      if (currentFilters.max_price) params.max_price = currentFilters.max_price;

      const response = await axios.get('http://localhost:5000/api/books', { params });
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(filters);
  }, []);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
  };

  const handleSearch = () => fetchBooks(filters);

  const handleReset = () => {
    const empty = { search: '', category: '', condition: '', seller: '', min_price: '', max_price: '' };
    setFilters(empty);
    fetchBooks(empty);
  };

  return (
    <div style={pageStyle}>

      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={heroOverlayStyle}>
          <h1 style={heroTitleStyle}>📚 UNIBOOKS</h1>
          <p style={heroSubtitleStyle}>Discover, Buy & Sell Books Easily</p>
          <p style={heroDescStyle}>The smartest way to buy and sell books online</p>
        </div>
      </div>

      <div style={contentStyle}>

        {/* Filter Section */}
        <div style={filterCardStyle}>
          <h3 style={filterTitleStyle}>🔍 Filter Books</h3>
          <div style={filterRowStyle}>
            <input
              type="text"
              name="search"
              placeholder="🔎 Search by title..."
              value={filters.search}
              onChange={handleFilterChange}
              style={filterInputStyle}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <input
              type="text"
              name="seller"
              placeholder="👤 Search by seller..."
              value={filters.seller}
              onChange={handleFilterChange}
              style={filterInputStyle}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              style={filterSelectStyle}
            >
              <option value="">📂 All Categories</option>
              <option value="FICTION">Fiction</option>
              <option value="SCIENCE">Science</option>
              <option value="HISTORY">History</option>
              <option value="COOKING">Cooking</option>
              <option value="TECHNOLOGY">Technology</option>
            </select>
            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              style={filterSelectStyle}
            >
              <option value="">📋 All Conditions</option>
              <option value="New">✨ New</option>
              <option value="Used">📖 Used</option>
            </select>
            <input
              type="number"
              name="min_price"
              placeholder="Min $"
              value={filters.min_price}
              onChange={handleFilterChange}
              style={{ ...filterInputStyle, width: '100px' }}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <input
              type="number"
              name="max_price"
              placeholder="Max $"
              value={filters.max_price}
              onChange={handleFilterChange}
              style={{ ...filterInputStyle, width: '100px' }}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={handleSearch}
              style={searchBtnStyle}
              onMouseEnter={e => e.target.style.backgroundColor = '#0a2540'}
              onMouseLeave={e => e.target.style.backgroundColor = '#0f3460'}
            >
              🔍 Search
            </button>
            <button
              onClick={handleReset}
              style={resetBtnStyle}
              onMouseEnter={e => e.target.style.backgroundColor = '#64748b'}
              onMouseLeave={e => e.target.style.backgroundColor = '#94a3b8'}
            >
              ✖ Reset
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div style={resultCountStyle}>
          <span style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '1rem' }}>
            {loading ? 'Loading...' : `${books.length} Books Found`}
          </span>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p style={{ color: '#64748b', marginTop: '15px' }}>Loading our collection...</p>
          </div>
        ) : books.length > 0 ? (
          <div style={gridStyle}>
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div style={emptyStyle}>
            <p style={{ fontSize: '4rem', margin: 0 }}>📭</p>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: '600' }}>No books found matching your search.</p>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const pageStyle = {
  backgroundColor: '#f0f4f8',
  minHeight: '100vh',
};

const heroStyle = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  padding: '80px 20px',
  textAlign: 'center',
  position: 'relative',
};

const heroOverlayStyle = {
  position: 'relative',
  zIndex: 1,
};

const heroTitleStyle = {
  fontSize: '3.5rem',
  fontWeight: '800',
  color: 'white',
  margin: '0 0 10px 0',
  letterSpacing: '2px',
};

const heroSubtitleStyle = {
  fontSize: '1.3rem',
  color: 'rgba(255,255,255,0.8)',
  fontWeight: '300',
  margin: '0 0 8px 0',
};

const heroDescStyle = {
  fontSize: '1rem',
  color: 'rgba(255,255,255,0.5)',
  margin: 0,
};

const contentStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 20px',
};

const filterCardStyle = {
  backgroundColor: 'white',
  borderRadius: '16px',
  padding: '25px 30px',
  marginBottom: '30px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const filterTitleStyle = {
  margin: '0 0 20px 0',
  color: '#0f3460',
  fontSize: '1.1rem',
  fontWeight: '700',
};

const filterRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  alignItems: 'center',
};

const filterInputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.9rem',
  outline: 'none',
  flex: '1',
  minWidth: '150px',
  transition: 'border-color 0.2s',
  backgroundColor: '#f8fafc',
};

const filterSelectStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  fontSize: '0.9rem',
  outline: 'none',
  flex: '1',
  minWidth: '150px',
  backgroundColor: '#f8fafc',
  cursor: 'pointer',
  color: '#374151',
};

const searchBtnStyle = {
  padding: '10px 24px',
  backgroundColor: '#0f3460',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s',
  whiteSpace: 'nowrap',
};

const resetBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#94a3b8',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s',
  whiteSpace: 'nowrap',
};

const resultCountStyle = {
  marginBottom: '20px',
  paddingLeft: '5px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '25px',
};

const loadingStyle = {
  textAlign: 'center',
  padding: '80px 0',
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

const emptyStyle = {
  textAlign: 'center',
  padding: '80px 0',
};

export default Home;