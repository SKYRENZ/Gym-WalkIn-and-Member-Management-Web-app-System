import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin.jsx';
import CounterPage from './pages/Counter.jsx';
import LoginPage from './login/login.jsx'; // Import the LoginPage component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} /> {/* Route for the login page */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/counter" element={<CounterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
