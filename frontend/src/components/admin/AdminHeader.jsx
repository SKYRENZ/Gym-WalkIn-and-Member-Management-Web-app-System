import React, { useState } from 'react';
import '../../css/admin/AdminHeader.css';
import BrandName from '../BrandName.jsx';
import DropdownMenu from '../DropdownMenu.jsx';

function AdminHeader() {

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
          <p className="user">Ervhyne</p>
          <p className="role">Admin</p>
        </div>
          <DropdownMenu isDropdownVisible={isDropdownVisible} toggleDropdown={toggleDropdown} />
      </div>
    </header>
  );
}

export default AdminHeader;