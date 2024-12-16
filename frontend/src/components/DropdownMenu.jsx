
import { useNavigate } from 'react-router-dom';
import dropdown from '../assets/Dropdown.png';
import SignOut from '../assets/Sign Out.png';
import '../css/DropdownMenu.css';
import PropTypes from 'prop-types';

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
// Define prop types
DropdownMenu.propTypes = {
  isDropdownVisible: PropTypes.bool.isRequired, // isDropdownVisible should be a required boolean
  toggleDropdown: PropTypes.func.isRequired,    // toggleDropdown should be a required function
};

export default DropdownMenu;