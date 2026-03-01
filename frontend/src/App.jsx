import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home'; // 1. استيراد صفحة Home الجديدة
import Login from './pages/Login'; 
import Register from './pages/Register';
import AddBook from './pages/AddBook';
import BookDetails from './pages/BookDetails';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
       
        <Route path="/" element={<Home />} /> 
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<BookDetails />} />
      </Routes>
    </Router>
  );
}

export default App;