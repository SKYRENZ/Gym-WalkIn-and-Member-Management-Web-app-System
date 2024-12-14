import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin.jsx";
import LoginPage from "./pages/login.jsx";
import Counter from "./pages/Counter.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/counter" element={<Counter />} />
        <Route path="/admin/*" element={<Admin />} /> {/* Handle Admin routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
