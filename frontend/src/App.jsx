// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Admin from "./pages/Admin.jsx";
import LoginPage from "./pages/login.jsx";
import Counter from "./pages/Counter.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route 
          path="/counter" 
          element={
            <PrivateRoute requiredRole="staff">
              <Counter />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute requiredRole="admin">
              <Admin />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;