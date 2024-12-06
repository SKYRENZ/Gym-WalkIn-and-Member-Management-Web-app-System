import '../../css/admin/Header.css';
import dropdown from '../../assets/Dropdown.png';

function Header() {
  return (
    <header>
      <div className="brand">
        <h1 className="gymbrand">Cavin Fitness</h1>
      </div>

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

export default Header;