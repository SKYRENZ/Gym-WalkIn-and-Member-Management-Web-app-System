import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin.jsx';
import LoginPage from './pages/login.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;