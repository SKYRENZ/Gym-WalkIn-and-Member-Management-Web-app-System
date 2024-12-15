
import { useNavigate } from 'react-router-dom';
import dropdown from '../assets/Dropdown.png';
import SignOut from '../assets/Sign Out.png';
import '../css/DropdownMenu.css';

function DropdownMenu({ isDropdownVisible, toggleDropdown }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the session/token from localStorage
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffRole');
    
    // Redirect to login page
    navigate('/');
  };

  return (
    <div className="dropdown-container">
      <button className="dropdown-button" onClick={toggleDropdown}>
        <img src={dropdown} alt="Dropdown" />
      </button>
      {isDropdownVisible && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={handleLogout}>
            <img src={SignOut} alt="Sign Out" className="dropdown-icon" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;