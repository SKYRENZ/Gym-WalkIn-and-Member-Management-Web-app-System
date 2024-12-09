import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin.jsx';
import CounterPage from './pages/Counter.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/counter" element={<CounterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;