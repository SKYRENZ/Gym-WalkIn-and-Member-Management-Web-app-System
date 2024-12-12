import React, { useState } from 'react';
import '../../css/counter/CounterHeader.css';
import BrandName from '../BrandName.jsx';
import DropdownMenu from '../DropdownMenu.jsx';

function CounterHeader() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    console.log('Dropdown toggled'); // Debugging log
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <header>
      <BrandName />
      <div className="user-info">
        <div>
          <p className="user">Laurenz</p>
          <p className="role">Receptionist</p>
        </div>
        <DropdownMenu isDropdownVisible={isDropdownVisible} toggleDropdown={toggleDropdown} />
      </div>
    </header>
  );
}

export default CounterHeader;