import '../../css/admin/AdminHeader.css';
import dropdown from '../../assets/Dropdown.png';
import BrandName from '../BrandName.jsx';

function AdminHeader() {
  return (
    <header>
      <BrandName />

      <div className="user-info">
        <div>
          <p className="user">Ervhyne</p>
          <p className="role">Admin</p>
        </div>
        <img src={dropdown} alt="Dropdown" />
      </div>
    </header>
  );
}

export default AdminHeader;